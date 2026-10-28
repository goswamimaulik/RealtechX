'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, ExternalLink, Eye, Home, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import { api, inr, qs, when } from './api';
import { AddButton, Badge, Empty, ErrorBox, IconButton, Loading, PageHeader, Pagination, SearchBox, Tabs, publishTone, useAdmin, useApi, type ListResult } from './ui';
import { thumb } from './media';

export interface PropRow {
  _id: string;
  id: string;
  slug: string;
  title: string;
  type: string;
  kind?: string;
  purpose?: string;
  listingFor: string;
  status: string;
  city: string;
  locality: string;
  developer: string;
  priceMin: number;
  priceMax: number;
  publish?: string;
  featured?: boolean;
  views?: number;
  images: string[];
  updatedAt?: string;
  source?: string;
  subType?: string;
}

type Opts = { cities: { slug: string; name: string }[]; categories: { slug: string; label: string }[]; statuses: { slug: string; label: string }[]; developers: { slug: string; name: string }[] };

const sorts = [
  { v: 'updatedAt:desc', l: 'Recently updated' },
  { v: 'createdAt:desc', l: 'Newest first' },
  { v: 'views:desc', l: 'Most viewed' },
  { v: 'priceMin:asc', l: 'Price: low → high' },
  { v: 'priceMin:desc', l: 'Price: high → low' },
  { v: 'title:asc', l: 'Title A → Z' },
];

export default function PropertyList({ kind }: { kind: 'property' | 'project' }) {
  const sp = useSearchParams();
  const { toast, confirm } = useAdmin();
  const [scope, setScope] = useState<string>(sp.get('kind') ?? kind);
  const [publish, setPublish] = useState(sp.get('publish') ?? '');
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [developer, setDeveloper] = useState('');
  const [featured, setFeatured] = useState(sp.get('featured') === '1');
  const [sort, setSort] = useState(sorts[0].v);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const opts = useApi<Opts>('options').data;

  const [sortField, dir] = sort.split(':');
  const filters = { kind: scope, q, city, type, status, developer, featured: featured ? '1' : '' };
  const path = `properties${qs({ ...filters, publish, page, limit: 20, sort: sortField, dir })}`;
  const { data, error, loading, reload } = useApi<ListResult<PropRow>>(path);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});

  const countKey = JSON.stringify(filters);
  useEffect(() => {
    let live = true;
    Promise.all(['', 'published', 'draft', 'pending'].map((p) => api<ListResult<PropRow>>(`properties${qs({ ...filters, publish: p, limit: 1 })}`).then((r) => [p || 'all', r.total] as const)))
      .then((r) => live && setTabCounts(Object.fromEntries(r)))
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countKey, data]);

  useEffect(() => {
    setPage(1);
    setSel([]);
  }, [scope, publish, q, city, type, status, developer, featured, sort]);

  const cityName = useMemo(() => Object.fromEntries((opts?.cities ?? []).map((c) => [c.slug, c.name])), [opts]);
  const items = data?.items ?? [];
  const allSel = items.length > 0 && items.every((i) => sel.includes(i._id));

  const bulk = async (action: string, label: string) => {
    if (action === 'delete' && !(await confirm({ title: `Delete ${sel.length} listing${sel.length === 1 ? '' : 's'}?`, text: 'This cannot be undone. Their pages will disappear from the website.', confirm: 'Delete', danger: true }))) return;
    try {
      const r = await api<{ done: number; skipped: string[] }>('properties/bulk', { body: { ids: sel, action } });
      toast(`${r.done} listing${r.done === 1 ? '' : 's'} ${label}`);
      if (r.skipped.length) toast(r.skipped.slice(0, 2).join(' · '), 'error');
      setSel([]);
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const remove = async (p: PropRow) => {
    setMenu(null);
    if (!(await confirm({ title: `Delete “${p.title}”?`, text: 'The listing and its page will be removed permanently.', confirm: 'Delete', danger: true }))) return;
    try {
      await api(`properties/${p._id}`, { method: 'DELETE' });
      toast('Listing deleted');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const duplicate = async (p: PropRow) => {
    setMenu(null);
    try {
      const { item } = await api<{ item: Record<string, unknown> }>(`properties/${p._id}`);
      const { _id, id, slug, views, createdAt, publishedAt, ...rest } = item as Record<string, unknown>;
      void _id; void id; void slug; void views; void createdAt; void publishedAt;
      const r = await api<{ item: { _id: string } }>('properties', { body: { ...rest, title: `${p.title} (copy)`, publish: 'draft' } });
      toast('Duplicated as draft');
      window.location.href = `/admin/properties/${r.item._id}`;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const toggleFeatured = async (p: PropRow) => {
    try {
      await api('properties/bulk', { body: { ids: [p._id], action: p.featured ? 'unfeature' : 'feature' } });
      toast(p.featured ? 'Removed from featured' : 'Marked as featured');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const isProject = kind === 'project';
  const RowMenu = ({ p }: { p: PropRow }) => (
    <div className="relative">
      <IconButton label="More actions" onClick={() => setMenu(menu === p._id ? null : p._id)}><MoreHorizontal className="h-4 w-4" /></IconButton>
      {menu === p._id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 text-[13px] shadow-luxe">
            <Link href={`/admin/properties/${p._id}`} className="flex items-center gap-2 px-3.5 py-2 hover:bg-ivory"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
            {p.publish === 'published' && <a href={`/property/${p.slug}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3.5 py-2 hover:bg-ivory"><ExternalLink className="h-3.5 w-3.5" /> View on site</a>}
            <button onClick={() => { setMenu(null); toggleFeatured(p); }} className="flex w-full items-center gap-2 px-3.5 py-2 text-left hover:bg-ivory"><Star className="h-3.5 w-3.5" /> {p.featured ? 'Unfeature' : 'Feature'}</button>
            <button onClick={() => duplicate(p)} className="flex w-full items-center gap-2 px-3.5 py-2 text-left hover:bg-ivory"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
            <button onClick={() => remove(p)} className="flex w-full items-center gap-2 border-t border-ink/[0.06] px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Listings"
        title={isProject ? 'Projects' : 'Properties'}
        subtitle={isProject ? 'New developments by builders — launches, under-construction and ready projects.' : 'Resale, rental and individual units. Switch to “All listings” to see everything.'}
        actions={<AddButton href={`/admin/properties/new?kind=${kind}`}>{isProject ? 'Add project' : 'Add property'}</AddButton>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={publish}
          onChange={setPublish}
          tabs={[
            { value: '', label: 'All', count: tabCounts.all },
            { value: 'published', label: 'Published', count: tabCounts.published },
            { value: 'draft', label: 'Drafts', count: tabCounts.draft },
            { value: 'pending', label: 'Pending', count: tabCounts.pending },
          ]}
        />
        <Tabs
          value={scope}
          onChange={setScope}
          tabs={[
            { value: kind, label: isProject ? 'Projects' : 'Properties' },
            { value: '', label: 'All listings' },
          ]}
        />
      </div>

      <div className="a-card mb-4 grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(5,1fr)]">
        <SearchBox value={q} onChange={setQ} placeholder="Search title, locality, ID, RERA…" className="sm:col-span-2 lg:col-span-1" />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="a-input"><option value="">All cities</option>{opts?.cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="a-input"><option value="">All categories</option>{opts?.categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="a-input"><option value="">Any status</option>{opts?.statuses.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select>
        <select value={developer} onChange={(e) => setDeveloper(e.target.value)} className="a-input"><option value="">All developers</option>{opts?.developers.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="a-input">{sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}</select>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setFeatured((f) => !f)} className={`chip ${featured ? 'chip-active' : ''}`}><Star className="h-3.5 w-3.5" /> Featured only</button>
        {sel.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink px-3 py-2 text-[12.5px] text-ivory">
            <b>{sel.length} selected</b>
            <span className="h-4 w-px bg-white/20" />
            <button className="font-semibold text-gold-light hover:underline" onClick={() => bulk('publish', 'published')}>Publish</button>
            <button className="font-semibold text-ivory/80 hover:underline" onClick={() => bulk('draft', 'moved to draft')}>Unpublish</button>
            <button className="font-semibold text-ivory/80 hover:underline" onClick={() => bulk('feature', 'featured')}>Feature</button>
            <button className="font-semibold text-ivory/80 hover:underline" onClick={() => bulk('unfeature', 'unfeatured')}>Unfeature</button>
            <button className="font-semibold text-rose-300 hover:underline" onClick={() => bulk('delete', 'deleted')}>Delete</button>
            <button className="ml-1 text-ivory/50 hover:text-ivory" onClick={() => setSel([])}>Clear</button>
          </div>
        )}
      </div>

      {error ? (
        <ErrorBox error={error} retry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : !items.length ? (
        <div className="a-card"><Empty icon={Home} title="No listings found" text="Try clearing filters, or add your first listing." action={<AddButton href={`/admin/properties/new?kind=${kind}`}>{isProject ? 'Add project' : 'Add property'}</AddButton>} /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={`a-card hidden overflow-hidden md:block ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full">
              <thead className="border-b border-ink/[0.06] bg-ivory/50">
                <tr>
                  <th className="a-th w-10"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? [] : items.map((i) => i._id))} className="h-4 w-4 accent-[#C9A45C]" /></th>
                  <th className="a-th">Listing</th>
                  <th className="a-th hidden xl:table-cell">Category</th>
                  <th className="a-th">Price</th>
                  <th className="a-th">Status</th>
                  <th className="a-th hidden lg:table-cell">Views</th>
                  <th className="a-th hidden lg:table-cell">Updated</th>
                  <th className="a-th w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05]">
                {items.map((p) => (
                  <tr key={p._id} className={`transition hover:bg-ivory/50 ${sel.includes(p._id) ? 'bg-gold-50/50' : ''}`}>
                    <td className="a-td"><input type="checkbox" aria-label={`Select ${p.title}`} checked={sel.includes(p._id)} onChange={() => setSel((s) => (s.includes(p._id) ? s.filter((x) => x !== p._id) : [...s, p._id]))} className="h-4 w-4 accent-[#C9A45C]" /></td>
                    <td className="a-td">
                      <Link href={`/admin/properties/${p._id}`} className="group flex items-center gap-3">
                        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ivory-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.images?.[0] && <img src={thumb(p.images[0], 160)} alt="" className="h-full w-full object-cover" loading="lazy" />}
                          {p.featured && <Star className="absolute left-1 top-1 h-3.5 w-3.5 fill-gold text-gold" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[320px] truncate font-semibold group-hover:text-gold-dark">{p.title}</span>
                          <span className="block truncate text-[12px] text-ink/50">{p.id} · {p.locality}, {cityName[p.city] ?? p.city}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="a-td hidden capitalize text-ink/70 xl:table-cell">{p.subType || p.type}<span className="block text-[11.5px] text-ink/45">{p.purpose ?? p.listingFor}</span></td>
                    <td className="a-td whitespace-nowrap font-semibold tabular-nums">{inr(p.priceMin)}{p.listingFor === 'rent' && p.priceMin ? <span className="font-normal text-ink/45">/mo</span> : ''}</td>
                    <td className="a-td"><div className="flex flex-col items-start gap-1"><Badge tone={publishTone(p.publish)}>{p.publish ?? 'published'}</Badge><span className="text-[11px] capitalize text-ink/45">{p.status.replace(/-/g, ' ')}</span></div></td>
                    <td className="a-td hidden tabular-nums text-ink/70 lg:table-cell"><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-ink/35" />{(p.views ?? 0).toLocaleString('en-IN')}</span></td>
                    <td className="a-td hidden whitespace-nowrap text-[12.5px] text-ink/55 lg:table-cell">{when(p.updatedAt)}</td>
                    <td className="a-td">{RowMenu({ p })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 md:hidden">
            {items.map((p) => (
              <div key={p._id} className={`a-card flex gap-3 p-3 ${sel.includes(p._id) ? 'ring-2 ring-gold/40' : ''}`}>
                <Link href={`/admin/properties/${p._id}`} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.images?.[0] && <img src={thumb(p.images[0], 200)} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  {p.featured && <Star className="absolute left-1.5 top-1.5 h-4 w-4 fill-gold text-gold" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/properties/${p._id}`} className="line-clamp-2 text-[14px] font-semibold leading-snug">{p.title}</Link>
                  <p className="mt-0.5 truncate text-[12px] text-ink/50">{p.locality}, {cityName[p.city] ?? p.city}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={publishTone(p.publish)}>{p.publish ?? 'published'}</Badge>
                    <span className="text-[12.5px] font-semibold">{inr(p.priceMin)}</span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-ink/45"><Eye className="h-3 w-3" />{p.views ?? 0}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <input type="checkbox" aria-label={`Select ${p.title}`} checked={sel.includes(p._id)} onChange={() => setSel((s) => (s.includes(p._id) ? s.filter((x) => x !== p._id) : [...s, p._id]))} className="h-4 w-4 accent-[#C9A45C]" />
                  {RowMenu({ p })}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data!.page} pages={data!.pages} total={data!.total} onPage={setPage} label="listings" />
        </>
      )}
    </div>
  );
}
