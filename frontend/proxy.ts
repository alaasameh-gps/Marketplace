import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ar'];
const hasLocalePrefix = (pathname: string) =>
  locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!hasLocalePrefix(pathname)) {
    const locale = pathname.startsWith('/ar') || pathname.startsWith('/ar/') ? 'ar' : 'en';
    const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/';
    return NextResponse.redirect(new URL(`/${locale}${cleanPath}${search}`, request.url));
  }
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)',
};