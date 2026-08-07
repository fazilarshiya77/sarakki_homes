import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/dashboard/:path*",
    "/admin/properties/:path*",
    "/admin/enquiries/:path*",
    "/admin/settings/:path*",
    "/admin/builders/:path*",
    "/admin/categories/:path*",
    "/admin/cms/:path*",
    "/admin/testimonials/:path*",
    "/admin/blog/:path*",
    "/admin/users/:path*",
  ],
};
