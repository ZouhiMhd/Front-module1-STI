import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/config/i18n/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

// Protected page routes (require authentication)
const protectedPageRoutes = [
  "/dashboard",
  "/cases",
  "/profile",
  "/settings",
];

// Auth page routes (redirect to dashboard if already authenticated)
const authPageRoutes = ["/login", "/register"];

// Check if path matches any protected routes
function isProtectedPage(pathname: string): boolean {
  // Remove locale prefix if present
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "");
  return protectedPageRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
}

// Check if path is an auth page
function isAuthPage(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "");
  return authPageRoutes.some((route) => pathWithoutLocale.startsWith(route));
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get token from cookie or Authorization header
  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Handle protected page routes
  if (isProtectedPage(pathname)) {
    if (!token) {
      // Redirect to login if no token
      const locale = pathname.match(/^\/(en|fr)/)?.[1] || "en";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth pages - redirect to dashboard if already authenticated
  if (isAuthPage(pathname) && token) {
    const locale = pathname.match(/^\/(en|fr)/)?.[1] || "en";
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Apply i18n middleware for non-API routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files (images, fonts, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
