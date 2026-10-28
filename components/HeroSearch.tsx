'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Building2, ChevronDown, Home, MapPin, Search, Wallet, X } from 'lucide-react';
import type { SearchIndex } from '@/lib/nav';
import { budgetBuy, budgetRent, navTypes } from '@/lib/site';

type Tab = { key: string; label: string; params: Record<string, string>; types: string[] };
const allTypes = navTypes.map((t) => t.slug as string);
const tabs: Tab[] = [
  { key: 'buy', label: 'Buy', params: { for: 'buy' }, types: allTypes },
  { key: 'rent', label: 'Rent', params: { for: 'rent' }, types: ['residential', 'villa', 'commercial'] },
  { key: 'new', label: 'New Launch', params: { status: 'new-launch' }, types: allTypes },
  { key: 'commercial', label: 'Commercial', params: {}, types: ['commercial'] },
  { key: 'plots', label: 'Plots / Land', params: {}, types: ['plot', 'land'] },
];

type Suggestion = { kind: 'Locality' | 'Project' | 'Developer'; label: string; sub: string; href: string };

function suggest(ix: SearchIndex, q: string, city: string): Suggestion[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const has = (t: string) => t.toLowerCase().includes(s);
  const L: Suggestion[] = ix.locs
    .filter((l) => (!city || l.city === city) && (has(l.name) || has(l.cityName)))
    .map((l) => ({ kind: 'Locality', label: l.name, sub: `${l.cityName} · ${l.count} ${l.count === 1 ? 'project' : 'projects'}`, href: `/city/${l.city}/${l.slug}` }));
  const P: Suggestion[] = ix.projects
    .filter((p) => (!city || p.city === city) && (has(p.title) || has(p.locality)))
    .map((p) => ({ kind: 'Project', label: p.title, sub: `${p.locality}, ${p.cityName} · ${p.config}`, href: `/property/${p.slug}` }));
  const D: Suggestion[] = ix.devs.filter((d) => has(d.name)).map((d) => ({ kind: 'Developer', label: d.name, sub: `Developer · ${d.cityName}`, href: `/developers/${d.slug}` }));
  return [...L.slice(0, 4), ...P.slice(0, 4), ...D.slice(0, 2)];
}

export default function HeroSearch({ index }: { index: SearchIndex }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(-1);
  const deskRef = useRef<HTMLDivElement>(null);
  const mobRef = useRef<HTMLDivElement>(null);

  const budgets = tab.key === 'rent' ? budgetRent : budgetBuy;
  const typeOptions = navTypes.filter((t) => tab.types.includes(t.slug));
  const results = useMemo(() => suggest(index, q, city), [index, q, city]);
  const showList = focus && q.trim().length > 0;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!deskRef.current?.contains(t) && !mobRef.current?.contains(t)) setFocus(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  function pickTab(t: Tab) {
    setTab(t);
    setBudget('');
    setType(t.types.length === 1 ? t.types[0] : '');
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (showList && active >= 0 && results[active]) return router.push(results[active].href);
    const params = new URLSearchParams(tab.params);
    if (city) params.set('city', city);
    if (q.trim()) params.set('q', q.trim());
    const t = type || (tab.types.length === 1 ? tab.types[0] : '');
    if (t) params.set('type', t);
    else if (tab.key === 'plots') params.set('type', 'plot');
    if (budget) params.set('budget', budget);
    router.push(`/properties?${params.toString()}`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); }
    if (e.key === 'Escape') setFocus(false);
  }

  /* ── shared pieces ── */
  const cityOptions = (
    <>
      <option value="">All cities</option>
      {index.cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
    </>
  );
  const typeSelectOptions = (
    <>
      {typeOptions.length > 1 && <option value="">All types</option>}
      {typeOptions.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
    </>
  );
  const budgetOptions = (
    <>
      <option value="">Any budget</option>
      {budgets.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
    </>
  );

  const searchInput = (variant: 'desktop' | 'mobile') => (
    <div ref={variant === 'desktop' ? deskRef : mobRef} className="relative min-w-0 flex-1">
      <div className={`flex items-center gap-3 ${variant === 'desktop' ? 'h-full px-5' : 'rounded-2xl border border-ink/10 bg-white px-4'}`}>
        <Search className="h-[18px] w-[18px] shrink-0 text-gold-dark" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(-1); setFocus(true); }}
          onFocus={() => setFocus(true)}
          onKeyDown={onKey}
          placeholder={variant === 'desktop' ? 'Search locality, project or developer' : 'Locality, project or developer'}
          className={`w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted/80 ${variant === 'desktop' ? 'py-5 text-[15px]' : 'py-3.5 text-base'}`}
          aria-label="Search locality, project or developer"
          autoComplete="off"
          enterKeyHint="search"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ivory text-muted" aria-label="Clear search">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {showList && (
        <div className={`absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-ink/[0.06] bg-white text-left shadow-luxe top-full`}>
          {results.length ? (
            <ul className="max-h-[320px] overflow-y-auto py-2">
              {results.map((r, i) => {
                const Icon = r.kind === 'Locality' ? MapPin : r.kind === 'Project' ? Home : Building2;
                return (
                  <li key={r.href}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => router.push(r.href)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active === i ? 'bg-ivory' : ''}`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-50"><Icon className="h-4 w-4 text-gold-dark" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{r.label}</span>
                        <span className="block truncate text-[12px] text-muted">{r.sub}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{r.kind}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-4 text-[13px] text-muted">No direct match — press search to see all results for “{q}”.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="w-full" role="search">
      {/* ═════════ DESKTOP (lg+) ═════════ */}
      <div className="hidden lg:block">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pickTab(t)}
              className={`rounded-t-2xl px-6 py-3 text-[14px] font-semibold transition-colors ${
                tab.key === t.key ? 'bg-white text-ink' : 'bg-white/10 text-ivory/80 backdrop-blur hover:bg-white/20 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex h-[76px] items-stretch rounded-b-3xl rounded-tr-3xl bg-white p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,.65)]">
          <SelectBox icon={<MapPin className="h-[18px] w-[18px]" />} label="City" value={city} onChange={setCity} className="w-[190px]">{cityOptions}</SelectBox>
          <span className="my-3 w-px bg-ink/10" />
          {searchInput('desktop')}
          <span className="my-3 w-px bg-ink/10" />
          <SelectBox icon={<Building className="h-[18px] w-[18px]" />} label="Property type" value={type} onChange={setType} className="w-[180px]">{typeSelectOptions}</SelectBox>
          <span className="my-3 w-px bg-ink/10" />
          <SelectBox icon={<Wallet className="h-[18px] w-[18px]" />} label="Budget" value={budget} onChange={setBudget} className="w-[180px]">{budgetOptions}</SelectBox>
          <button type="submit" className="btn-gold ml-2 !rounded-2xl !px-8 text-[15px]">
            <Search className="h-[18px] w-[18px]" /> Search
          </button>
        </div>
      </div>

      {/* ═════════ MOBILE / TABLET (< lg) ═════════ */}
      <div className="rounded-[24px] bg-white p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,.7)] lg:hidden">
        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pickTab(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${tab.key === t.key ? 'bg-ink text-ivory' : 'bg-ivory text-ink/70'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {searchInput('mobile')}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <MobileSelect icon={<MapPin className="h-4 w-4" />} label="City" value={city} onChange={setCity}>{cityOptions}</MobileSelect>
          <MobileSelect icon={<Building className="h-4 w-4" />} label="Type" value={type} onChange={setType}>{typeSelectOptions}</MobileSelect>
          <MobileSelect icon={<Wallet className="h-4 w-4" />} label="Budget" value={budget} onChange={setBudget}>{budgetOptions}</MobileSelect>
          <button type="submit" className="btn-gold !rounded-2xl !px-3 !py-0">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>
    </form>
  );
}

function SelectBox({ icon, label, value, onChange, children, className = '' }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <label className={`group relative flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl px-4 transition hover:bg-ivory ${className}`}>
      <span className="text-gold-dark">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent pr-5 text-[15px] font-semibold text-ink outline-none" aria-label={label}>
          {children}
        </select>
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </label>
  );
}

function MobileSelect({ icon, label, value, onChange, children }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative flex min-w-0 items-center gap-2 rounded-2xl bg-ivory px-3 py-2">
      <span className="shrink-0 text-gold-dark">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full min-w-0 appearance-none truncate bg-transparent pr-4 text-[14px] font-semibold text-ink outline-none" aria-label={label}>
          {children}
        </select>
      </span>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </label>
  );
}
