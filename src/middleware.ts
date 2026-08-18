import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Outer authentication gate for the whole CRM surface.
 *
 * SECURITY: this previously used an explicit allow-list of admin paths,
 * which silently left `/admin/leads`, `/admin/tasks` and
 * `/admin/customers` publicly reachable — any page added later was
 * unprotected unless someone remembered to extend the list. The matcher
 * below is now deny-by-default across all of `/admin` and `/api/admin`,
 * so forgetting to update this file can no longer expose a page.
 *
 * Written with `getToken` rather than `withAuth` on purpose: `withAuth`
 * answers every unauthenticated request with a redirect to the sign-in
 * page. That is right for a page navigation but wrong for `/api/admin/*`,
 * where the caller is `fetch()` expecting JSON — it would receive the
 * login page's HTML and throw on `res.json()`, surfacing as a confusing
 * parse error rather than "you are signed out". So pages redirect, and
 * API routes get a real 401.
 *
 * This is only the outer gate (authenticated vs not). Per-route
 * authorization — *which* staff role may do *what* — lives in
 * `src/lib/authz.ts` and is enforced inside each route handler.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The sign-in page must stay reachable while signed out, or the
  // redirect below would loop.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const signInUrl = new URL("/admin/login", req.url);
    // Send the user back where they were headed once they sign in.
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
