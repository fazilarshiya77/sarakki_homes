import { Prisma } from "@prisma/client";

/**
 * Wraps a Prisma call so that ONLY "the database isn't reachable"
 * falls back to a safe default. Every other Prisma error (a bad query, a
 * schema mismatch, a constraint violation) is a genuine bug and is
 * re-thrown unchanged — this is deliberately narrow, not a blanket
 * try/catch.
 *
 * "Not reachable" covers two distinct Prisma error shapes, both meaning
 * the same thing from the caller's perspective:
 *  - Prisma.PrismaClientInitializationError — DATABASE_URL missing/bad,
 *    or the connection was refused before a client ever came up. This is
 *    the case several routes hit at `next build` time (generateStaticParams
 *    + ISR pre-rendering) before a production DATABASE_URL is configured
 *    in Vercel.
 *  - Prisma.PrismaClientKnownRequestError with code "P1001" — "Can't
 *    reach database server". An already-initialized client can still hit
 *    this on a transient network blip to Supabase (observed in this dev
 *    sandbox's connection to ap-northeast-1) — the process didn't just
 *    start, the DB simply didn't answer for a moment. Treating this the
 *    same as the init case means a page load doesn't hard-crash with a
 *    500 over a connection hiccup that resolves itself seconds later.
 */
export async function safeDbCall<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const isUnreachable =
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001");

    if (isUnreachable) {
      console.warn(
        `[db-safe] ${context}: database unreachable — using a safe fallback. ` +
          `This is expected until DATABASE_URL (Supabase) is configured, or on a transient network blip; ` +
          `it should not happen persistently once the DB is reachable. ` +
          `(${error.message.split("\n")[0]})`
      );
      return fallback;
    }
    throw error;
  }
}
