import { NextResponse } from 'next/server';
import { HttpError } from './auth';

/** Wraps an admin API handler: JSON errors, consistent shape, no caching. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  return async (...args: A) => {
    try {
      const out = await fn(...args);
      if (out instanceof Response) return out;
      return NextResponse.json({ ok: true, ...(out as object) }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[admin api]', e);
      if (/E11000|duplicate/i.test(msg)) return NextResponse.json({ ok: false, error: 'An item with this slug / email already exists.' }, { status: 409 });
      if (/ECONNREFUSED|ENOTFOUND|Server selection|MongoServerSelection|querySrv/i.test(msg)) {
        return NextResponse.json({ ok: false, error: 'Cannot reach the database. Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0).' }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  };
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'Invalid request body');
  }
}

export const bad = (msg: string) => new HttpError(422, msg);
