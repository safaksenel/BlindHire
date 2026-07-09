import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isHrRoute = pathname.startsWith("/hr");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isHrRoute || isAdminRoute) {
    const token = request.cookies.get("auth_token")?.value;
    const role = request.cookies.get("user_role")?.value;

    if (!token || token !== "authenticated") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl, { status: 302 });
    }

    if (isAdminRoute && role !== "SUPER_ADMIN") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl, { status: 302 });
    }

    if (isHrRoute && role !== "HR") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl, { status: 302 });
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: ["/hr/:path*", "/admin/:path*"],
};
