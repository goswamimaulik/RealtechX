import { requireUser } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const labels: Record<string, string> = { home: 'Home page', about: 'About us', contact: 'Contact page', footer: 'Footer' };

export const GET = handle(async () => {
  const { db } = await requireUser('content');
  const docs = await db.coll('content').find({}, { projection: { title: 1, updated: 1, slug: 1, updatedAt: 1 } });
  const order = ['home', 'about', 'contact', 'footer'];
  return {
    items: docs
      .map((d) => ({ _id: d._id, label: labels[d._id] ?? d.title ?? d._id, legal: String(d._id).startsWith('legal:'), slug: d.slug ?? '', updatedAt: d.updatedAt ?? d.updated ?? '' }))
      .sort((a, b) => (order.indexOf(a._id) + 1 || 99) - (order.indexOf(b._id) + 1 || 99) || a.label.localeCompare(b.label)),
  };
});
