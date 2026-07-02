import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Basic bot/spam protection headers + admin cookie enforcement handled server-side
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', pathname.startsWith('/admin') || pathname.startsWith('/api/admin') ? 'noindex, nofollow' : 'index, follow');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
