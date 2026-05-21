import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Edge proxy (Next.js 16 replaces middleware.ts with proxy.ts).
 *
 * Responsibilities:
 *  - Redirect authenticated users away from /login & /register.
 *  - Require auth for /admin/* and /dashboard/*.
 *  - Enforce role separation (ADMIN-only on /admin, USER-only on /dashboard).
 *  - Force phone verification for non-admin users with phoneVerified=false.
 *  - Gate /verify-phone to signed-in, unverified users.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const userRole = user?.role;
  const phoneVerified = Boolean(user?.phoneVerified);
  const nextPath = req.nextUrl.pathname;

  const isAuthPage = nextPath.startsWith("/login") || nextPath.startsWith("/register");
  const isAdminPage = nextPath.startsWith("/admin");
  const isDashboardPage = nextPath.startsWith("/dashboard");
  const isVerifyPage = nextPath.startsWith("/verify-phone");

  // Already-authenticated users hitting login/register go straight to their home.
  if (isAuthPage) {
    if (isLoggedIn) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      // Non-admin without phone verified → force phone verification first.
      if (!phoneVerified) {
        return NextResponse.redirect(new URL("/verify-phone", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  // /verify-phone gating
  if (isVerifyPage) {
    if (!isLoggedIn) {
      const cb = encodeURIComponent("/verify-phone");
      return NextResponse.redirect(new URL(`/login?callbackUrl=${cb}`, req.url));
    }
    // Admin doesn't need phone verification; bounce to admin home.
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (phoneVerified) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  // Unauthenticated visitors trying to access protected areas.
  if (!isLoggedIn && (isAdminPage || isDashboardPage)) {
    let callbackUrl = nextPath;
    if (req.nextUrl.search) callbackUrl += req.nextUrl.search;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.url));
  }

  // Role separation.
  if (isAdminPage && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboardPage && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Non-admin users on dashboard MUST have phoneVerified.
  if (isDashboardPage && userRole !== "ADMIN" && !phoneVerified) {
    let nextUrl = nextPath;
    if (req.nextUrl.search) nextUrl += req.nextUrl.search;
    const encoded = encodeURIComponent(nextUrl);
    return NextResponse.redirect(new URL(`/verify-phone?next=${encoded}`, req.url));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
