/**
 * Minimal HS256 JWT using WebCrypto — works in both the Edge middleware and Node route handlers.
 */
export interface SessionClaims {
  sub: string; // user id
  role: string;
  name: string;
  sv: number; // session version (bumped on password change / "log out everywhere")
  ttl: number; // idle timeout in seconds (sliding)
  iat: number;
  exp: number;
}

export const SESSION_COOKIE = 'rtx_admin';

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

let secretPromise: Promise<string> | null = null;
/** AUTH_SECRET, or a value derived from MONGODB_URI so a deploy without AUTH_SECRET still has a private key. */
export function authSecret(): Promise<string> {
  if (!secretPromise) {
    secretPromise = (async () => {
      if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) return process.env.AUTH_SECRET;
      const seed = process.env.MONGODB_URI || 'realtechx-local-demo';
      const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(`rtx-session:${seed}`)));
      return b64url(h);
    })();
  }
  return secretPromise;
}

async function key() {
  return crypto.subtle.importKey('raw', enc.encode(await authSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(c: Omit<SessionClaims, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionClaims = { ...c, iat: now, exp: now + c.ttl };
  const head = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(`${head}.${body}`)));
  return `${head}.${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(), fromB64url(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
    if (!ok) return null;
    const c = JSON.parse(new TextDecoder().decode(fromB64url(parts[1]))) as SessionClaims;
    if (!c.exp || c.exp < Math.floor(Date.now() / 1000)) return null;
    return c;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});
