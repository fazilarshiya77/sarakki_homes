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
  secret: process.env.NEXTAUTH_SECRET || "sarakki-homes-crm-secret-key-1234",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
