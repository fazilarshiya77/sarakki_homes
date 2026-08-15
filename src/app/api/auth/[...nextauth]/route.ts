import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
          throw new Error("No user found with this email.");
        }

        const isPasswordCorrect = bcrypt.compareSync(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password.");
        }

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
