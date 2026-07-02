import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow /hr/login through
  if (pathname === "/hr/login") {
    return NextResponse.next();
  }

  // Check HR auth cookie
  const authToken = request.cookies.get("hr_auth_token")?.value;

  if (authToken !== "authenticated") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/hr/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, { status: 302 });
  }

  // Security headers
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
  matcher: ["/hr/:path*"],
};
