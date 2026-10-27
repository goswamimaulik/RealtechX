import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from '@/components/SmartImage';
import { PageHero } from '@/components/ui';
import { cities } from '@/lib/data/cities';
import { properties, localitiesOf } from '@/lib/data/properties';
import { startPrice } from '@/lib/format';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Localities — Explore Property by Locality',
  description: 'Browse every locality on RealtechX across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat with project counts and starting prices.',
  alternates: { canonical: '/localities' },
};

export default function LocalitiesPage() {
  return (
    <>
      <PageHero eyebrow="Localities" title="Explore property by locality" text="Every neighbourhood we cover, with project counts and starting prices." image={img.city.mumbai} crumbs={[{ href: '/', label: 'Home' }, { label: 'Localities' }]} />
      <div className="container space-y-12 py-12 md:space-y-16 md:py-16">
        {cities.map((c) => {
          const locs = localitiesOf(c.slug);
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-24">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">{c.state}</p>
                  <h2 className="mt-2 font-display text-[26px] font-semibold md:text-4xl">{c.name}</h2>
                </div>
                <Link href={`/city/${c.slug}`} className="shrink-0 pb-1 text-[13px] font-bold text-gold-dark">All in {c.name} →</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
                {locs.map((l) => {
                  const list = properties.filter((p) => p.city === c.slug && p.localitySlug === l.slug);
                  const cheapest = [...list].sort((a, b) => a.priceMin - b.priceMin)[0];
                  return (
                    <Link key={l.slug} href={`/city/${c.slug}/${l.slug}`} className="group overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-card transition hover:-translate-y-1 hover:shadow-luxe">
                      <div className="relative aspect-[16/10]">
                        <Image src={cheapest.images[0]} alt={`Property in ${l.name}`} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover transition duration-700 group-hover:scale-105" />
                      </div>
                      <div className="p-3 md:p-4">
                        <p className="flex items-center justify-between gap-2 text-[14px] font-bold group-hover:text-gold-dark md:text-[15px]">
                          <span className="truncate">{l.name}</span> <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50" />
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><MapPin className="h-3 w-3" />{list.length} {list.length === 1 ? 'project' : 'projects'}</p>
                        <p className="mt-2 text-[12px]">from <span className="font-display text-[15px] font-bold">{startPrice(cheapest)}</span></p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
