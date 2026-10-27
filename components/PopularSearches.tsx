import Link from 'next/link';
import { Search } from 'lucide-react';
import { allLocalities, properties } from '@/lib/data/properties';
import { cities, getCity } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { navTypes, budgetBuy } from '@/lib/site';

/** "Popular searches" link hub shown above the footer on every page. */
export default function PopularSearches() {
  const groups: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: 'Localities',
      links: allLocalities().map((l) => ({ href: `/city/${l.city}/${l.slug}`, label: `Property in ${l.name}, ${getCity(l.city)?.name}` })),
    },
    {
      title: 'Developers',
      links: developers.map((d) => ({ href: `/developers/${d.slug}`, label: `${d.name} projects` })),
    },
    {
      title: 'Budget',
      links: budgetBuy.map((b) => ({ href: `/properties?for=buy&budget=${b.value}`, label: `Property ${b.label.replace('Under', 'under').replace('Above', 'above')}` })),
    },
    {
      title: 'Configuration',
      links: [2, 3, 4, 5].map((b) => ({ href: `/properties?bhk=${b}`, label: `${b === 5 ? '5+' : b} BHK flats & villas` }))
        .concat(navTypes.map((t) => ({ href: `/property-type/${t.slug}`, label: `${t.label} for sale` }))),
    },
    {
      title: 'City & type',
      links: cities.flatMap((c) =>
        navTypes
          .filter((t) => properties.some((p) => p.city === c.slug && p.type === t.slug))
          .slice(0, 2)
          .map((t) => ({ href: `/properties?city=${c.slug}&type=${t.slug}`, label: `${t.label} in ${c.name}` })),
      ),
    },
  ];

  return (
    <section className="border-t border-ink/5 bg-white py-12 md:py-16" aria-labelledby="popular-searches">
      <div className="container">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-50"><Search className="h-4 w-4 text-gold-dark" /></span>
          <div>
            <h2 id="popular-searches" className="font-display text-2xl font-semibold md:text-3xl">Popular searches</h2>
            <p className="text-xs text-muted md:text-sm">Quick links to the most searched properties on RealtechX</p>
          </div>
        </div>
        {/* Desktop: open columns */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="pb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-dark">{g.title}</p>
              <ul className="space-y-2 text-[13px] text-ink/70">
                {g.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="transition hover:text-gold-dark">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Mobile / tablet: accordions */}
        <div className="grid gap-x-8 sm:grid-cols-2 lg:hidden">
          {groups.map((g) => (
            <details key={g.title} className="group border-b border-ink/5">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-ink [&::-webkit-details-marker]:hidden">
                {g.title}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ivory text-base text-gold-dark transition group-open:rotate-45">+</span>
              </summary>
              <div className="flex flex-wrap gap-2 pb-5">
                {g.links.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-full border border-ink/10 px-3 py-1.5 text-[12.5px] text-ink/75">{l.label}</Link>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
