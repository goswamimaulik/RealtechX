'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Wallet } from 'lucide-react';
import { cities } from '@/lib/data/cities';
import { budgetBuy, budgetRent } from '@/lib/site';

const tabs: { key: string; label: string; params: Record<string, string> }[] = [
  { key: 'buy', label: 'Buy', params: { for: 'buy' } },
  { key: 'rent', label: 'Rent', params: { for: 'rent' } },
  { key: 'commercial', label: 'Commercial', params: { type: 'commercial' } },
  { key: 'plot', label: 'Plots', params: { type: 'plot' } },
  { key: 'land', label: 'Land', params: { type: 'land' } },
  { key: 'villa', label: 'Villas', params: { type: 'villa' } },
];

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState('buy');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [budget, setBudget] = useState('');

  const budgets = tab === 'rent' ? budgetRent : budgetBuy;

  function go(e: React.FormEvent) {
    e.preventDefault();
    const t = tabs.find((x) => x.key === tab)!;
    const params = new URLSearchParams(t.params);
    if (city) params.set('city', city);
    if (q.trim()) params.set('q', q.trim());
    if (budget) params.set('budget', budget);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setBudget(''); }}
            className={`shrink-0 rounded-t-2xl px-5 py-3 text-sm font-bold transition ${
              tab === t.key ? 'bg-white text-ink' : 'bg-white/10 text-ivory/80 backdrop-blur hover:bg-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={go} className="grid gap-2 rounded-b-2xl rounded-tr-2xl bg-white p-3 shadow-luxe md:grid-cols-[1.1fr_1.6fr_1.1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl bg-ivory px-4">
          <MapPin className="h-4 w-4 shrink-0 text-gold-dark" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent py-3.5 text-sm font-semibold text-ink outline-none" aria-label="City">
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-ivory px-4">
          <Search className="h-4 w-4 shrink-0 text-gold-dark" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Locality, project or developer" className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-muted" />
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-ivory px-4">
          <Wallet className="h-4 w-4 shrink-0 text-gold-dark" />
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-transparent py-3.5 text-sm font-semibold text-ink outline-none" aria-label="Budget">
            <option value="">Any Budget</option>
            {budgets.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-gold !rounded-xl !px-8 !py-3.5">
          <Search className="h-4 w-4" /> Search
        </button>
      </form>
    </div>
  );
}
