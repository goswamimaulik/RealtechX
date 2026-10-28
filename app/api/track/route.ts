import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { istDate } from '@/lib/server/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Counts a property page view (one per browser session, sent by <ViewTracker/>). */
export async function POST(req: Request) {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id || !/^[\w-]{1,60}$/.test(id)) return new NextResponse(null, { status: 204 });
    const ua = req.headers.get('user-agent') || '';
    if (/bot|crawl|spider|slurp|preview/i.test(ua)) return new NextResponse(null, { status: 204 });
    const db = await getDb();
    const ok = await db.coll('properties').updateOne({ _id: id }, { $inc: { views: 1 } });
    if (ok) {
      const day = istDate();
      await db.coll('stats_daily').updateOne({ _id: day }, { $inc: { views: 1 }, $set: { date: day } }, { upsert: true });
    }
  } catch {
    /* tracking must never break the page */
  }
  return new NextResponse(null, { status: 204 });
}
