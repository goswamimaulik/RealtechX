'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Building2 } from 'lucide-react';
import type { CityExplorerData } from '@/lib/nav';
import SmartImage from './SmartImage';

export default function CityExplorer({ data }: { data: CityExplorerData }) {
  const [active, setActive] = useState(data[0].slug);
  const city = data.find((c) => c.slug === active)!;
  const locs = city.locs;

  return (
    <div>
      {/* City tabs */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:-mx-6 md:px-6 lg:mx-0 lg:mb-8 lg:flex-wrap lg:px-0" role="tablist">
        {data.map((c) => {
          const count = c.total;
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
            View all {city.total} properties <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Locality cards */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:-mx-6 md:scroll-px-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {locs.map((l) => (
            <div key={l.slug} className="w-[82%] shrink-0 snap-start rounded-2xl border border-ink/[0.06] bg-white p-4 shadow-card transition hover:shadow-luxe sm:w-[48%] md:p-5 lg:w-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/city/${city.slug}/${l.slug}`} className="group/l inline-flex items-center gap-1 font-display text-lg font-semibold hover:text-gold-dark md:text-xl">
                    {l.name} <ArrowUpRight className="h-4 w-4 opacity-50 group-hover/l:opacity-100" />
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {l.count} {l.count === 1 ? 'project' : 'projects'} · from <span className="font-bold text-ink">{l.from}</span>
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50"><Building2 className="h-4 w-4 text-gold-dark" /></span>
              </div>
              <ul className="mt-3 divide-y divide-ink/5 border-t border-ink/5">
                {l.top.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/property/${p.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-[13px] hover:text-gold-dark">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.title}</span>
                        <span className="block truncate text-[11px] text-muted">{p.config}</span>
                      </span>
                      <span className="shrink-0 font-display text-[16px] font-semibold">{p.price}</span>
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
