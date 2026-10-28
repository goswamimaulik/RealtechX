import { requireUser } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Issue = { kind: 'property' | 'blog' | 'developer' | 'city'; id: string; title: string; href: string; edit: string; problems: string[]; score: number };

/** Checks every published page for common SEO gaps (titles, descriptions, images, content length, duplicates). */
export const GET = handle(async () => {
  const { db } = await requireUser('seo');
  const [props, blogs, devs, cities] = await Promise.all([
    db.coll('properties').find({ publish: 'published' }),
    db.coll('blogs').find({ publish: 'published' }),
    db.coll('developers').find({}),
    db.coll('cities').find({}),
  ]);
  const titles = new Map<string, number>();
  props.forEach((p) => titles.set(p.title.toLowerCase(), (titles.get(p.title.toLowerCase()) ?? 0) + 1));

  const out: Issue[] = [];
  for (const p of props) {
    const probs: string[] = [];
    const desc = (p.description ?? []).join(' ');
    if (!p.seo?.description && desc.length < 120) probs.push('Short description (under 120 characters) and no custom meta description');
    if (p.seo?.title && p.seo.title.length > 65) probs.push(`Meta title is ${p.seo.title.length} characters (keep under 65)`);
    if (p.seo?.description && (p.seo.description.length < 70 || p.seo.description.length > 165)) probs.push('Meta description should be 70–165 characters');
    if ((p.images ?? []).length < 3) probs.push(`Only ${(p.images ?? []).length} image(s) — add at least 3`);
    if ((p.amenities ?? []).length < 4) probs.push('Fewer than 4 amenities');
    if (!(p.configurations ?? []).length) probs.push('No configurations / floor plans');
    if (!(p.nearby ?? []).length) probs.push('No nearby places (location advantages)');
    if ((titles.get(p.title.toLowerCase()) ?? 0) > 1) probs.push('Duplicate title — another property has the same name');
    if (p.seo?.noindex) probs.push('Hidden from Google (noindex is on)');
    if (probs.length) out.push({ kind: 'property', id: p._id, title: p.title, href: `/property/${p.slug}`, edit: `/admin/properties/${p._id}`, problems: probs, score: Math.max(0, 100 - probs.length * 15) });
  }
  for (const b of blogs) {
    const probs: string[] = [];
    if ((b.excerpt ?? '').length < 70 && !b.seo?.description) probs.push('Excerpt is short and there is no meta description');
    if ((b.sections ?? []).length < 2) probs.push('Fewer than 2 sections');
    if (b.title.length > 70 && !b.seo?.title) probs.push('Title over 70 characters — add a shorter SEO title');
    if (probs.length) out.push({ kind: 'blog', id: b._id, title: b.title, href: `/blog/${b.slug}`, edit: `/admin/blogs/${b._id}`, problems: probs, score: Math.max(0, 100 - probs.length * 20) });
  }
  for (const d of devs) {
    const probs: string[] = [];
    if ((d.about ?? '').length < 150) probs.push('About text under 150 characters');
    if (!d.logo) probs.push('No logo');
    if (probs.length) out.push({ kind: 'developer', id: d._id, title: d.name, href: `/developers/${d.slug}`, edit: `/admin/developers?edit=${d._id}`, problems: probs, score: Math.max(0, 100 - probs.length * 20) });
  }
  for (const c of cities) {
    const probs: string[] = [];
    if ((c.blurb ?? '').length < 80) probs.push('City description under 80 characters');
    if (probs.length) out.push({ kind: 'city', id: c._id, title: c.name, href: `/city/${c.slug}`, edit: `/admin/locations?tab=cities&edit=${c._id}`, problems: probs, score: 80 });
  }
  const pages = props.length + blogs.length + devs.length + cities.length;
  const healthy = pages - out.length;
  return { pages, healthy, score: pages ? Math.round(out.reduce((n, i) => n + i.score, healthy * 100) / pages) : 100, issues: out.sort((a, b) => a.score - b.score) };
});
