import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const nextPath = req.nextUrl.pathname;

  const isAuthPage = nextPath.startsWith("/login") || nextPath.startsWith("/register");
  const isAdminPage = nextPath.startsWith("/admin");
  const isDashboardPage = nextPath.startsWith("/dashboard");

  if (isAuthPage) {
    if (isLoggedIn) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  if (!isLoggedIn && (isAdminPage || isDashboardPage)) {
    let callbackUrl = nextPath;
    if (req.nextUrl.search) callbackUrl += req.nextUrl.search;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.url));
  }

  if (isAdminPage && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboardPage && userRole === "ADMIN") {
     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
