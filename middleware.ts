import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, signSession, verifySession, cookieOptions } from './lib/auth/jwt';

const PUBLIC_PAGES = ['/admin/login', '/admin/forgot', '/admin/reset'];
const PUBLIC_API = ['/api/admin/auth/login', '/api/admin/auth/forgot', '/api/admin/auth/reset', '/api/admin/auth/status'];

/** Guards /admin and /api/admin. Role checks happen in each API route; this enforces "logged in" + idle timeout. */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith('/api/admin');
  if (PUBLIC_PAGES.includes(pathname) || PUBLIC_API.includes(pathname)) return NextResponse.next();

  const claims = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) {
    if (isApi) return NextResponse.json({ ok: false, error: 'Your session has expired. Please log in again.' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  // Sliding session: activity pushes the idle timeout forward (refreshed at most once a minute).
  const now = Math.floor(Date.now() / 1000);
  if (now - claims.iat > 60) {
    const token = await signSession({ sub: claims.sub, role: claims.role, name: claims.name, sv: claims.sv, ttl: claims.ttl });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions(claims.ttl));
  }
  return res;
}

export const config = { matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'] };
