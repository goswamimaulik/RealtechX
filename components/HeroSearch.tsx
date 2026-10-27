'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, ChevronDown, MapPin, Navigation, Search, Wallet } from 'lucide-react';
import { cities } from '@/lib/data/cities';
import { localitiesOf } from '@/lib/data/properties';
import { budgetBuy, budgetRent, navTypes } from '@/lib/site';

type Tab = { key: string; label: string; params: Record<string, string>; types: string[] };

const allTypes = navTypes.map((t) => t.slug as string);
const tabs: Tab[] = [
  { key: 'buy', label: 'Buy', params: { for: 'buy' }, types: allTypes },
  { key: 'rent', label: 'Rent', params: { for: 'rent' }, types: ['residential', 'villa', 'commercial'] },
  { key: 'new', label: 'New Launch', params: { status: 'new-launch' }, types: allTypes },
  { key: 'commercial', label: 'Commercial', params: {}, types: ['commercial'] },
  { key: 'plots', label: 'Plots & Land', params: {}, types: ['plot', 'land'] },
];

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');

  const localities = useMemo(() => (city ? localitiesOf(city) : []), [city]);
  const budgets = tab.key === 'rent' ? budgetRent : budgetBuy;
  const typeOptions = navTypes.filter((t) => tab.types.includes(t.slug));

  function pickTab(t: Tab) {
    setTab(t);
    setBudget('');
    setType(t.types.length === 1 ? t.types[0] : '');
  }

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(tab.params);
    if (city) params.set('city', city);
    if (locality) params.set('locality', locality);
    const t = type || (tab.types.length === 1 ? tab.types[0] : '');
    if (t) params.set('type', t);
    if (budget) params.set('budget', budget);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form onSubmit={go} className="w-full max-w-[1000px] overflow-hidden rounded-[22px] bg-white/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] backdrop-blur md:rounded-[26px]">
      {/* Category tabs */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink/5 px-2 pt-2 md:px-3 md:pt-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => pickTab(t)}
            className={`relative shrink-0 rounded-t-xl px-3.5 pb-3 pt-2 text-[13px] font-bold transition md:px-5 md:text-sm ${
              tab.key === t.key ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {tab.key === t.key && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gold-grad" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:gap-0 md:p-3">
        <Field icon={<MapPin className="h-4 w-4" />} label="City">
          <select value={city} onChange={(e) => { setCity(e.target.value); setLocality(''); }} aria-label="City">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field icon={<Navigation className="h-4 w-4" />} label="Locality" divider>
          <select value={locality} onChange={(e) => setLocality(e.target.value)} disabled={!city} aria-label="Locality">
            <option value="">{city ? 'All localities' : 'Select city first'}</option>
            {localities.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
        </Field>
        <Field icon={<Building className="h-4 w-4" />} label="Property type" divider>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
            {typeOptions.length > 1 && <option value="">All types</option>}
            {typeOptions.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
          </select>
        </Field>
        <Field icon={<Wallet className="h-4 w-4" />} label="Budget" divider>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget">
            <option value="">Any budget</option>
            {budgets.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </Field>
        <button type="submit" className="btn-gold col-span-2 !rounded-2xl !py-3.5 md:col-span-1 md:ml-2 md:!px-8">
          <Search className="h-4 w-4" /> Search
        </button>
      </div>
    </form>
  );
}

function Field({ icon, label, children, divider = false }: { icon: React.ReactNode; label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <label className={`relative flex min-w-0 items-center gap-2.5 rounded-2xl bg-ivory px-3 py-2 md:rounded-none md:bg-transparent md:px-4 ${divider ? 'md:border-l md:border-ink/10' : ''}`}>
      <span className="hidden text-gold-dark sm:block">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</span>
        <span className="relative block [&_select]:w-full [&_select]:min-w-0 [&_select]:cursor-pointer [&_select]:appearance-none [&_select]:truncate [&_select]:bg-transparent [&_select]:pr-5 [&_select]:text-[15.5px] md:[&_select]:text-[14px] [&_select]:font-semibold [&_select]:text-ink [&_select]:outline-none [&_select:disabled]:text-muted/70">
          {children}
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        </span>
      </span>
    </label>
  );
}
