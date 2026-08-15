import { Prisma } from "@prisma/client";

/**
 * Wraps a Prisma call so that ONLY "the database isn't reachable yet"
 * (Prisma.PrismaClientInitializationError — missing DATABASE_URL,
 * connection refused, etc.) falls back to a safe default. Every other
 * Prisma error (a bad query, a schema mismatch, a real outage of an
 * otherwise-configured database) is a genuine bug and is re-thrown
 * unchanged — this is deliberately narrow, not a blanket try/catch.
 *
 * Why this exists: several routes use `generateStaticParams` and/or ISR
 * (`export const revalidate`), so `next build` attempts to pre-render
 * them at build time. Before a production DATABASE_URL (Supabase) is
 * configured in Vercel, that build-time attempt would otherwise fail the
 * entire deploy. Once Supabase IS configured, this code path is never
 * exercised in normal operation — every call resolves for real, and the
 * catch block only ever fires on an actual connection failure.
 */
export async function safeDbCall<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.warn(
        `[db-safe] ${context}: database unreachable — using a safe fallback. ` +
          `This is expected until DATABASE_URL (Supabase) is configured; it should not happen once it is. ` +
          `(${error.message.split("\n")[0]})`
      );
      return fallback;
    }
    throw error;
  }
}
