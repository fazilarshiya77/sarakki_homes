import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Login brute-force speed bump.
 *
 * CAVEAT, deliberately stated: this is plain in-memory state, scoped to a
 * single serverless instance and wiped on cold start. It is therefore a
 * speed bump, not a distributed guarantee — a determined attacker spraying
 * across instances gets more than 5 tries per window. A proper
 * implementation would keep counters in Redis/Upstash (or a rate-limit
 * table) so every instance shares one view. Even so, this raises the cost
 * of a naive online password-guessing attack by orders of magnitude at
 * zero infrastructure cost, which is the right trade for this deployment.
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const failedAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

/** True if this email is currently locked out. Also expires stale windows. */
function isLockedOut(email: string): boolean {
  const entry = failedAttempts.get(email);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > LOCKOUT_WINDOW_MS) {
    failedAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(email: string): void {
  const entry = failedAttempts.get(email);
  if (!entry || Date.now() - entry.firstAttemptAt > LOCKOUT_WINDOW_MS) {
    failedAttempts.set(email, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;

  // Cheap bound on memory: an attacker cycling through invented emails
  // would otherwise grow this map without limit. Drop expired windows
  // once it gets large; genuine lockouts in progress are recent entries.
  if (failedAttempts.size > 10_000) {
    const cutoff = Date.now() - LOCKOUT_WINDOW_MS;
    for (const [key, value] of failedAttempts) {
      if (value.firstAttemptAt < cutoff) failedAttempts.delete(key);
    }
  }
}

function clearFailures(email: string): void {
  failedAttempts.delete(email);
}

const RATE_LIMIT_MESSAGE =
  "Too many failed sign-in attempts. Please try again in a few minutes.";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        // Normalized so "Admin@x.com" and "admin@x.com" share one counter
        // and the lockout can't be sidestepped by changing capitalization.
        const rateLimitKey = credentials.email.trim().toLowerCase();

        if (isLockedOut(rateLimitKey)) {
          throw new Error(RATE_LIMIT_MESSAGE);
        }

        // A raw, uncaught PrismaClientInitializationError bubbling out of
        // this callback (e.g. DATABASE_URL not configured yet) is what
        // NextAuth v4 shows to users as the generic, unhelpful
        // "/api/auth/error?error=Configuration" page — it doesn't know how
        // to categorize an infrastructure crash as a normal login
        // rejection. Catching it here and re-throwing a plain, descriptive
        // Error keeps that same "login failed" behavior (nothing about
        // auth security changes — a real user table lookup is still
        // required either way) but makes both the server logs and the
        // sign-in page say what's actually wrong instead of "Configuration".
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientInitializationError) {
            console.error(
              "[auth] Database unreachable during login — DATABASE_URL is likely missing or invalid in this environment."
            );
            throw new Error(
              "The database is not configured yet. Please contact the administrator."
            );
          }
          throw error;
        }

        if (!user || !user.passwordHash) {
          recordFailure(rateLimitKey);
          throw new Error("No user found with this email.");
        }

        const isPasswordCorrect = bcrypt.compareSync(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          recordFailure(rateLimitKey);
          // Surface the lockout on the attempt that trips it, rather than
          // making the user discover it on their next try.
          throw new Error(
            isLockedOut(rateLimitKey) ? RATE_LIMIT_MESSAGE : "Invalid password."
          );
        }

        // A successful sign-in wipes the counter for this email.
        clearFailures(rateLimitKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        } as any;
      }
      return session;
    },
  },
  // A hardcoded fallback secret used to live here. That's a real security
  // hole in production: anyone who reads this public repo could forge a
  // valid session JWT for any user (including admins) against a deployment
  // that never got its own NEXTAUTH_SECRET configured. Instead:
  //  - production (NODE_ENV=production) requires a real NEXTAUTH_SECRET and
  //    fails loudly and immediately if it's missing, rather than silently
  //    running with a secret anyone can read on GitHub.
  //  - local dev keeps a clearly-labeled, obviously-insecure fallback so
  //    `npm run dev` still works without extra setup.
  secret: process.env.NEXTAUTH_SECRET ?? getDevOnlySecret(),
};

function getDevOnlySecret(): string {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Generate one (e.g. `openssl rand -base64 32`) " +
        "and add it in Vercel → Project → Settings → Environment Variables."
    );
  }
  return "dev-only-insecure-secret-do-not-use-in-production";
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
