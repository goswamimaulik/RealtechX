import { cookies } from 'next/headers';
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { getDb, newId, nowIso, type Db, type Doc } from './db';
import { ensureSeeded } from './seed';
import { SESSION_COOKIE, signSession, verifySession, cookieOptions, type SessionClaims } from '../auth/jwt';
import { can, type Perm } from '../auth/permissions';
import type { Role } from '../types';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(pw: string, stored?: string) {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  const expected = Buffer.from(hash, 'base64');
  const got = await scrypt(pw, Buffer.from(salt, 'base64'), expected.length);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
export const randomToken = () => randomBytes(32).toString('base64url');

export function passwordProblem(pw: string) {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use letters and at least one number.';
  return '';
}

/** Local demo login (only when MongoDB is NOT configured). */
export const DEMO_ADMIN = { email: 'admin@realtechx.local', password: 'Admin@12345' };

export async function adminDb() {
  const db = await getDb();
  await ensureSeeded(db);
  await bootstrapAdmin(db);
  return db;
}

/** Creates the first Super Admin from ADMIN_EMAIL / ADMIN_PASSWORD (or the local demo login) when no users exist. */
const gReset = globalThis as unknown as { __rtxResetDone?: boolean };

/**
 * Emergency reset: set ADMIN_RESET=true in Vercel and redeploy. The ADMIN_EMAIL account is then
 * (re)created as an active Super Admin with ADMIN_PASSWORD and any login lock is cleared.
 * Remove ADMIN_RESET after logging in.
 */
async function resetAdmin(db: Db) {
  if (gReset.__rtxResetDone || !/^(1|true|yes)$/i.test((process.env.ADMIN_RESET || '').trim())) return;
  gReset.__rtxResetDone = true;
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD || '').trim();
  if (!email || !password) return;
  const users = db.coll('users');
  const u = await users.findOne({ email });
  if (!u) {
    await users.insertOne({ _id: newId(), name: process.env.ADMIN_NAME || 'Super Admin', email, role: 'super_admin', active: true, passwordHash: await hashPassword(password), sessionVersion: 1, createdAt: nowIso() });
  } else if (!(await verifyPassword(password, u.passwordHash)) || u.role !== 'super_admin' || !u.active) {
    await users.updateOne({ _id: u._id }, { $set: { passwordHash: await hashPassword(password), role: 'super_admin', active: true }, $inc: { sessionVersion: 1 } });
  }
  await db.coll('ratelimits').deleteMany({ _id: { $in: [`login:${email}`] } });
}

export async function bootstrapAdmin(db: Db) {
  await resetAdmin(db);
  const users = db.coll('users');
  if ((await users.count({})) > 0) return;
  const email = (process.env.ADMIN_EMAIL || (db.kind === 'memory' ? DEMO_ADMIN.email : '')).trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD || '').trim() || (db.kind === 'memory' ? DEMO_ADMIN.password : '');
  if (!email || !password) return;
  try {
    await users.insertOne({
      _id: newId(),
      name: process.env.ADMIN_NAME || 'Super Admin',
      email,
      role: 'super_admin',
      active: true,
      passwordHash: await hashPassword(password),
      sessionVersion: 1,
      createdAt: nowIso(),
    });
  } catch {
    /* created concurrently */
  }
}

export async function sessionTtl(db: Db) {
  const s = await db.coll('settings').findOne({ _id: 'site' });
  const minutes = Number(s?.security?.sessionMinutes) || 60;
  return Math.min(Math.max(minutes, 5), 24 * 60) * 60;
}

export async function startSession(db: Db, user: Doc) {
  const ttl = await sessionTtl(db);
  const token = await signSession({ sub: user._id, role: user.role, name: user.name, sv: user.sessionVersion ?? 1, ttl });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(ttl));
}

export async function endSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', cookieOptions(0));
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

/** Validates the cookie AND the user record (active, role, session version). */
export async function currentUser(db?: Db): Promise<SessionUser | null> {
  const jar = await cookies();
  const claims: SessionClaims | null = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const d = db ?? (await adminDb());
  const u = await d.coll('users').findOne({ _id: claims.sub });
  if (!u || !u.active || (u.sessionVersion ?? 1) !== claims.sv) return null;
  return { id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** For API routes: returns { db, user } or throws 401/403. */
export async function requireUser(perm?: Perm) {
  const db = await adminDb();
  const user = await currentUser(db);
  if (!user) throw new HttpError(401, 'Your session has expired. Please log in again.');
  if (perm && !can(user.role, perm)) throw new HttpError(403, 'You do not have permission for this action.');
  return { db, user };
}

export async function logActivity(db: Db, user: Pick<SessionUser, 'id' | 'name'> | null, action: string, entity: string, entityId = '', summary = '', ip = '') {
  try {
    await db.coll('activity').insertOne({
      _id: newId(),
      at: nowIso(),
      userId: user?.id ?? '',
      userName: user?.name ?? 'System',
      action,
      entity,
      entityId,
      summary: summary.slice(0, 300),
      ip,
    });
  } catch {
    /* never block on logging */
  }
}

export const publicUser = (u: Doc) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone ?? '',
  role: u.role,
  active: !!u.active,
  lastLogin: u.lastLogin ?? '',
  createdAt: u.createdAt,
});
