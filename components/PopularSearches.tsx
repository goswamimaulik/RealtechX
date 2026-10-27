'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { allLocalities, properties } from '@/lib/data/properties';
import { cities, getCity } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { navTypes, budgetBuy } from '@/lib/site';

type Group = { title: string; links: { href: string; label: string }[] };

const groups: Group[] = [
  {
    title: 'Localities',
    links: allLocalities().map((l) => ({ href: `/city/${l.city}/${l.slug}`, label: `Property in ${l.name}, ${getCity(l.city)?.name}` })),
  },
  { title: 'Developers', links: developers.map((d) => ({ href: `/developers/${d.slug}`, label: `${d.name} projects` })) },
  {
    title: 'Budget',
    links: cities.flatMap((c) => budgetBuy.slice(1, 3).map((b) => ({ href: `/properties?city=${c.slug}&budget=${b.value}`, label: `Property ${b.label} in ${c.name}` }))),
  },
  {
    title: 'Configuration',
    links: cities.flatMap((c) => [2, 3, 4].map((b) => ({ href: `/properties?city=${c.slug}&bhk=${b}`, label: `${b} BHK in ${c.name}` }))),
  },
  {
    title: 'Property type',
    links: cities.flatMap((c) =>
      navTypes.filter((t) => properties.some((p) => p.city === c.slug && p.type === t.slug)).map((t) => ({ href: `/properties?city=${c.slug}&type=${t.slug}`, label: `${t.label} in ${c.name}` })),
    ),
  },
];

/** "Popular searches" link hub (tab-wise) shown above the footer on every page. */
export default function PopularSearches() {
  const [tab, setTab] = useState(groups[0].title);
  const [more, setMore] = useState(false);
  const current = groups.find((g) => g.title === tab)!;
  return (
    <section className="border-t border-ink/[0.06] bg-white py-12 md:py-16" aria-labelledby="popular-searches">
      <div className="container">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Quick links</p>
            <h2 id="popular-searches" className="mt-2 font-display text-[24px] font-semibold md:text-[32px]">Popular searches</h2>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist">
            {groups.map((g) => (
              <button
                key={g.title}
                role="tab"
                aria-selected={tab === g.title}
                onClick={() => { setTab(g.title); setMore(false); }}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition ${tab === g.title ? 'border-ink bg-ink text-ivory' : 'border-ink/10 bg-white text-ink/70 hover:border-gold hover:text-ink'}`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>
        <ul key={tab} className="mt-7 grid animate-fadeIn grid-cols-1 gap-x-8 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-4">
          {current.links.map((l, i) => (
            <li key={l.href} className={!more && i >= 10 ? 'hidden sm:block' : ''}>
              <Link href={l.href} className="group flex items-center justify-between gap-2 border-b border-ink/[0.05] py-2.5 text-[13.5px] text-ink/70 transition hover:text-gold-dark">
                <span className="truncate">{l.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
        {current.links.length > 10 && (
          <button type="button" onClick={() => setMore((v) => !v)} className="btn-outline mt-5 w-full !py-2.5 text-[13px] sm:hidden">
            {more ? 'Show less' : `Show all ${current.links.length}`}
          </button>
        )}
      </div>
    </section>
  );
}
