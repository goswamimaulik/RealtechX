import { requireUser } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';
import { can } from '@/lib/auth/permissions';
import { istDate } from '@/lib/server/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const monthKey = (iso: string) => istDate(new Date(iso)).slice(0, 7);

export const GET = handle(async () => {
  const { db, user } = await requireUser('dashboard');
  const showProps = can(user.role, 'properties');
  const showLeads = can(user.role, 'leads');

  // last 12 months (IST)
  const months: string[] = [];
  const d = new Date(istDate() + 'T00:00:00Z');
  d.setUTCDate(1);
  for (let i = 11; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    months.push(m.toISOString().slice(0, 7));
  }
  const since = new Date(`${months[0]}-01T00:00:00+05:30`).toISOString();
  const today = istDate();

  const [props, leadsRecent, leadStats, stats, cities, localities, developers, blogs] = await Promise.all([
    db.coll('properties').find({}, { projection: { id: 1, slug: 1, title: 1, publish: 1, kind: 1, views: 1, createdAt: 1, publishedAt: 1, updatedAt: 1, images: 1, city: 1, locality: 1, type: 1, priceMin: 1, priceMax: 1, listingFor: 1, featured: 1 } }),
    showLeads ? db.coll('leads').find({ spam: { $ne: true } }, { sort: { createdAt: -1 }, limit: 6 }) : Promise.resolve([]),
    showLeads ? db.coll('leads').find({ spam: { $ne: true } }, { projection: { createdAt: 1, status: 1, source: 1, followUp: 1 } }) : Promise.resolve([]),
    db.coll('stats_daily').find({ date: { $gte: `${months[0]}-01` } }),
    db.coll('cities').count({}),
    db.coll('localities').count({}),
    db.coll('developers').count({}),
    db.coll('blogs').count({}),
  ]);

  const count = (f: (p: (typeof props)[number]) => boolean) => props.filter(f).length;
  const totals = {
    properties: props.length,
    published: count((p) => p.publish === 'published'),
    draft: count((p) => p.publish === 'draft'),
    pending: count((p) => p.publish === 'pending'),
    projects: count((p) => p.kind === 'project'),
    featured: count((p) => !!p.featured),
    views: props.reduce((n, p) => n + (Number(p.views) || 0), 0),
    cities,
    localities,
    developers,
    blogs,
    leads: leadStats.length,
    leadsToday: leadStats.filter((l) => istDate(new Date(l.createdAt)) === today).length,
    leadsMonth: leadStats.filter((l) => monthKey(l.createdAt) === today.slice(0, 7)).length,
    newLeads: leadStats.filter((l) => l.status === 'new').length,
    followUpsDue: leadStats.filter((l) => l.followUp && l.followUp <= today && !['closed', 'lost'].includes(l.status)).length,
  };

  const leadStatus = ['new', 'contacted', 'qualified', 'closed', 'lost'].map((s) => ({ status: s, count: leadStats.filter((l) => l.status === s).length }));
  const sources = Object.entries(
    leadStats.reduce<Record<string, number>>((m, l) => {
      const k = String(l.source || 'Website').split(':')[0].trim();
      m[k] = (m[k] || 0) + 1;
      return m;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, n]) => ({ source, count: n }));

  const monthly = months.map((m) => ({
    month: m,
    leads: leadStats.filter((l) => l.createdAt >= since && monthKey(l.createdAt) === m).length,
    views: stats.filter((s) => String(s.date).startsWith(m)).reduce((n, s) => n + (Number(s.views) || 0), 0),
  }));

  const slim = (p: (typeof props)[number]) => ({ _id: p._id, id: p.id, slug: p.slug, title: p.title, image: p.images?.[0] ?? '', city: p.city, locality: p.locality, views: p.views ?? 0, publish: p.publish, kind: p.kind, type: p.type, priceMin: p.priceMin, priceMax: p.priceMax, listingFor: p.listingFor, at: p.createdAt, publishedAt: p.publishedAt });
  const by = (k: 'createdAt' | 'publishedAt') => (a: (typeof props)[number], b: (typeof props)[number]) => String(b[k] || '').localeCompare(String(a[k] || ''));

  return {
    user,
    show: { properties: showProps, leads: showLeads },
    totals,
    leadStatus: showLeads ? leadStatus : [],
    sources: showLeads ? sources : [],
    monthly,
    recentLeads: leadsRecent.map((l) => ({ _id: l._id, leadId: l.leadId, name: l.name, phone: l.phone, property: l.property, source: l.source, status: l.status, createdAt: l.createdAt })),
    recentProperties: [...props].sort(by('createdAt')).slice(0, 5).map(slim),
    mostViewed: [...props].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5).map(slim),
    latestProjects: props.filter((p) => p.kind === 'project' && p.publish === 'published').sort(by('publishedAt')).slice(0, 5).map(slim),
  };
});
