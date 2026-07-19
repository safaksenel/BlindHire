import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Admin access control
  if (pathname.startsWith('/admin') && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Company Manager access control
  if (pathname.startsWith('/company-manager') && userRole !== 'COMPANY_MANAGER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // HR access control
  if (pathname.startsWith('/hr') && userRole !== 'HR') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Lock authenticated non-candidate users to their panels
  if ((pathname === '/' || pathname === '/login' || pathname === '/register') && userRole) {
    if (userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (userRole === 'COMPANY_MANAGER') {
      return NextResponse.redirect(new URL('/company-manager/dashboard', request.url));
    }
    if (userRole === 'HR') {
      return NextResponse.redirect(new URL('/hr/dashboard', request.url));
    }
    // For candidates, we allow access to "/"
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
