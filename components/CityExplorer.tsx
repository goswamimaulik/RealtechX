'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Building2 } from 'lucide-react';
import { cities } from '@/lib/data/cities';
import { properties, localitiesOf } from '@/lib/data/properties';
import { configLabel, startPrice } from '@/lib/format';
import SmartImage from './SmartImage';

export default function CityExplorer() {
  const [active, setActive] = useState(cities[0].slug);
  const city = cities.find((c) => c.slug === active)!;
  const cityProps = properties.filter((p) => p.city === active);
  const locs = localitiesOf(active).map((l) => {
    const list = cityProps.filter((p) => p.localitySlug === l.slug);
    const cheapest = [...list].sort((a, b) => a.priceMin - b.priceMin)[0];
    return { ...l, list, cheapest };
  });

  return (
    <div>
      {/* City tabs */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:mb-8 md:flex-wrap md:px-0" role="tablist">
        {cities.map((c) => {
          const count = properties.filter((p) => p.city === c.slug).length;
          return (
            <button
              key={c.slug}
              role="tab"
              aria-selected={active === c.slug}
              onClick={() => setActive(c.slug)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-bold transition md:px-5 md:text-sm ${
                active === c.slug ? 'border-ink bg-ink text-ivory shadow-luxe' : 'border-ink/10 bg-white text-ink/75 hover:border-gold'
              }`}
            >
              {c.name} <span className={active === c.slug ? 'text-gold-light' : 'text-muted'}>· {count}</span>
            </button>
          );
        })}
      </div>

      <div key={active} className="grid animate-fadeUp gap-4 lg:grid-cols-[360px_1fr] lg:gap-6">
        {/* City tile */}
        <Link href={`/city/${city.slug}`} className="group relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl p-5 text-ivory md:min-h-[260px] lg:min-h-full lg:p-7">
          <SmartImage src={city.image} alt={`Property in ${city.name}`} fill sizes="(max-width:1024px) 100vw, 360px" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold-light">{city.state}</p>
          <p className="mt-1 font-display text-3xl font-semibold md:text-4xl">{city.name}</p>
          <p className="mt-2 line-clamp-2 max-w-sm text-[13px] text-ivory/70">{city.blurb}</p>
          <span className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur transition group-hover:bg-gold group-hover:text-ink">
            View all {cityProps.length} properties <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Locality cards */}
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          {locs.map((l) => (
            <div key={l.slug} className="rounded-2xl border border-ink/[0.06] bg-white p-4 shadow-card transition hover:shadow-luxe md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/city/${city.slug}/${l.slug}`} className="group/l inline-flex items-center gap-1 font-display text-lg font-semibold hover:text-gold-dark md:text-xl">
                    Homes in {l.name} <ArrowUpRight className="h-4 w-4 opacity-50 group-hover/l:opacity-100" />
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {l.list.length} {l.list.length === 1 ? 'project' : 'projects'} · from <span className="font-bold text-ink">{l.cheapest ? startPrice(l.cheapest) : '—'}</span>
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50"><Building2 className="h-4 w-4 text-gold-dark" /></span>
              </div>
              <ul className="mt-3 divide-y divide-ink/5 border-t border-ink/5">
                {l.list.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link href={`/property/${p.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-[13px] hover:text-gold-dark">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.title}</span>
                        <span className="block truncate text-[11px] text-muted">{configLabel(p)}</span>
                      </span>
                      <span className="shrink-0 font-display text-[15px] font-bold">{startPrice(p)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
