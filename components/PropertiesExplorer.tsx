'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Property } from '@/lib/types';
import { navTypes, statuses, budgetBuy, budgetRent } from '@/lib/site';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import PropertyCard from './PropertyCard';
import { openLead } from './LeadModal';

type Key = 'q' | 'for' | 'type' | 'city' | 'locality' | 'status' | 'developer' | 'budget' | 'bhk' | 'sort';
type Filters = Record<Key, string>;
const EMPTY: Filters = { q: '', for: '', type: '', city: '', locality: '', status: '', developer: '', budget: '', bhk: '', sort: 'newest' };

export default function PropertiesExplorer({
  items,
  syncUrl = false,
  hide = [],
  preset = {},
}: {
  items: Property[];
  syncUrl?: boolean;
  hide?: Key[];
  preset?: Partial<Filters>;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [f, setF] = useState<Filters>(() => {
    const init: Filters = { ...EMPTY, ...preset };
    (Object.keys(EMPTY) as Key[]).forEach((k) => {
      const v = sp.get(k);
      if (v) init[k] = v;
    });
    return init;
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!syncUrl) return;
    const params = new URLSearchParams();
    (Object.keys(f) as Key[]).forEach((k) => {
      if (f[k] && !(k === 'sort' && f[k] === 'newest')) params.set(k, f[k]);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [f, syncUrl, pathname, router]);

  const set = (k: Key, v: string) =>
    setF((prev) => {
      const next = { ...prev, [k]: prev[k] === v && k !== 'q' && k !== 'sort' ? '' : v };
      if (k === 'city') next.locality = '';
      if (k === 'for') next.budget = '';
      return next;
    });

  const localities = useMemo(() => {
    const m = new Map<string, string>();
    items.filter((p) => !f.city || p.city === f.city).forEach((p) => m.set(p.localitySlug, p.locality));
    return Array.from(m, ([slug, name]) => ({ slug, name }));
  }, [items, f.city]);

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const [bMin, bMax] = f.budget ? f.budget.split('-').map(Number) : [0, Infinity];
    const list = items.filter((p) => {
      if (f.for && p.listingFor !== f.for) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.city && p.city !== f.city) return false;
      if (f.locality && p.localitySlug !== f.locality) return false;
      if (f.status && p.status !== f.status) return false;
      if (f.developer && p.developer !== f.developer) return false;
      if (f.bhk && !p.bhk.includes(Number(f.bhk)) && !(f.bhk === '5' && p.bhk.some((b) => b >= 5))) return false;
      if (f.budget && (p.priceMax < bMin || p.priceMin > bMax)) return false;
      if (q) {
        const dev = developers.find((d) => d.slug === p.developer)?.name ?? '';
        const hay = `${p.title} ${p.locality} ${p.city} ${p.type} ${dev} ${p.tagline}`.toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (f.sort === 'price-asc') sorted.sort((a, b) => a.priceMin - b.priceMin);
    else if (f.sort === 'price-desc') sorted.sort((a, b) => b.priceMin - a.priceMin);
    else if (f.sort === 'featured') sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    else sorted.sort((a, b) => b.postedOn.localeCompare(a.postedOn));
    return sorted;
  }, [items, f]);

  const activeChips = (Object.keys(f) as Key[])
    .filter((k) => f[k] && k !== 'sort' && !hide.includes(k) && preset[k] !== f[k])
    .map((k) => ({ k, label: chipLabel(k, f[k]) }));

  const budgets = f.for === 'rent' ? budgetRent : budgetBuy;

  const sidebar = (
    <div className="space-y-7">
      {!hide.includes('for') && (
        <Group title="Looking to">
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'buy', l: 'Buy' }, { v: 'rent', l: 'Rent' }].map((o) => (
              <button key={o.v} onClick={() => set('for', o.v)} className={`chip justify-center !py-2.5 ${f.for === o.v ? 'chip-active' : ''}`}>{o.l}</button>
            ))}
          </div>
        </Group>
      )}
      {!hide.includes('type') && (
        <Group title="Property Type">
          <div className="flex flex-wrap gap-2">
            {navTypes.map((t) => (
              <button key={t.slug} onClick={() => set('type', t.slug)} className={`chip ${f.type === t.slug ? 'chip-active' : ''}`}>{t.label}</button>
            ))}
          </div>
        </Group>
      )}
      {!hide.includes('city') && (
        <Group title="City">
          <select value={f.city} onChange={(e) => setF((p) => ({ ...p, city: e.target.value, locality: '' }))} className="input">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Group>
      )}
      {!hide.includes('locality') && localities.length > 0 && (
        <Group title="Locality">
          <select value={f.locality} onChange={(e) => setF((p) => ({ ...p, locality: e.target.value }))} className="input">
            <option value="">All localities</option>
            {localities.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
        </Group>
      )}
      <Group title="Budget">
        <div className="flex flex-wrap gap-2">
          {budgets.map((b) => (
            <button key={b.value} onClick={() => set('budget', b.value)} className={`chip ${f.budget === b.value ? 'chip-active' : ''}`}>{b.label}</button>
          ))}
        </div>
      </Group>
      <Group title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4', '5'].map((b) => (
            <button key={b} onClick={() => set('bhk', b)} className={`chip ${f.bhk === b ? 'chip-active' : ''}`}>{b === '5' ? '5+ BHK' : `${b} BHK`}</button>
          ))}
        </div>
      </Group>
      {!hide.includes('status') && (
        <Group title="Project Status">
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button key={s.slug} onClick={() => set('status', s.slug)} className={`chip ${f.status === s.slug ? 'chip-active' : ''}`}>{s.label}</button>
            ))}
          </div>
        </Group>
      )}
      {!hide.includes('developer') && (
        <Group title="Developer">
          <select value={f.developer} onChange={(e) => setF((p) => ({ ...p, developer: e.target.value }))} className="input">
            <option value="">All developers</option>
            {developers.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </Group>
      )}
      <button onClick={() => setF({ ...EMPTY, ...preset })} className="btn-outline w-full">Reset filters</button>
    </div>
  );

  return (
    <div className="container py-6 md:py-14">
      {/* Search bar */}
      <div className="card mb-6 flex flex-col gap-2 p-2.5 md:mb-8 md:flex-row md:items-center md:gap-3 md:p-3">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 shrink-0 text-gold-dark" />
          <input
            value={f.q}
            onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
            placeholder="Search by project, locality, city or developer"
            className="w-full bg-transparent py-3 text-base outline-none md:text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select value={f.sort} onChange={(e) => setF((p) => ({ ...p, sort: e.target.value }))} className="input min-w-0 flex-1 !py-2.5 md:!w-auto md:flex-none" aria-label="Sort">
            <option value="newest">Newest first</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button onClick={() => setDrawer(true)} className="btn-ink !px-4 lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button>
          <div className="hidden overflow-hidden rounded-xl border border-ink/10 md:flex">
            <button onClick={() => setView('grid')} className={`px-3 ${view === 'grid' ? 'bg-ink text-ivory' : 'bg-white'}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`px-3 ${view === 'list' ? 'bg-ink text-ivory' : 'bg-white'}`} aria-label="List view"><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-6">{sidebar}</div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-ink/70"><span className="font-bold text-ink">{results.length}</span> {results.length === 1 ? 'property' : 'properties'} found</p>
            {activeChips.map((c) => (
              <button key={c.k} onClick={() => setF((p) => ({ ...p, [c.k]: preset[c.k] ?? '' }))} className="chip !border-gold/40 !bg-gold-50">
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <p className="font-display text-3xl font-semibold">No matching properties yet</p>
              <p className="mt-2 max-w-md text-sm text-muted">Tell us what you need — our advisors will share handpicked options that are not listed online.</p>
              <button onClick={() => openLead({ intent: 'Share My Requirement', source: 'No Results' })} className="btn-gold mt-6">Share your requirement</button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3' : 'grid gap-4 md:gap-5'}>
              {results.map((p, i) => (
                <div key={p.id} className="contents">
                  <PropertyCard p={p} layout={view} />
                  {i === 5 && (
                    <div className="col-span-2 flex flex-col justify-between rounded-2xl bg-ink-grad p-6 text-ivory md:p-7 xl:col-span-1">
                      <div>
                        <p className="eyebrow !text-gold-light">Can’t decide?</p>
                        <p className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">Get a free shortlist from our advisor</p>
                        <p className="mt-2 text-sm text-ivory/60">Tell us your budget & location. We’ll share the best 5 options on WhatsApp.</p>
                      </div>
                      <button onClick={() => openLead({ intent: 'Get Free Shortlist', source: 'Listing Inline CTA' })} className="btn-gold mt-6 self-start">Get my shortlist</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-2xl font-semibold">Filters</p>
              <button onClick={() => setDrawer(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white" aria-label="Close filters"><X className="h-4 w-4" /></button>
            </div>
            {sidebar}
            <button onClick={() => setDrawer(false)} className="btn-gold mt-4 w-full">Show {results.length} results</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{title}</p>
      {children}
    </div>
  );
}

function chipLabel(k: Key, v: string) {
  switch (k) {
    case 'for': return v === 'rent' ? 'Rent' : 'Buy';
    case 'type': return navTypes.find((t) => t.slug === v)?.label ?? v;
    case 'city': return cities.find((c) => c.slug === v)?.name ?? v;
    case 'status': return statuses.find((s) => s.slug === v)?.label ?? v;
    case 'developer': return developers.find((d) => d.slug === v)?.name ?? v;
    case 'budget': return [...budgetBuy, ...budgetRent].find((b) => b.value === v)?.label ?? v;
    case 'bhk': return `${v} BHK`;
    case 'q': return `“${v}”`;
    default: return v.replace(/-/g, ' ');
  }
}
