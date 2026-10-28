import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/ui';
import SmartImage from '@/components/SmartImage';
import { developers } from '@/lib/data/developers';
import { properties } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Real Estate Developers & Builders',
  description: 'Explore real estate developers and their projects across 10 Indian cities including Mumbai, Pune, Bangalore, Hyderabad, Gurugram and Noida.',
  alternates: { canonical: '/developers' },
};

export default function DevelopersPage() {
  return (
    <>
      <PageHero
        eyebrow="Builders & developers"
        title="Developers on RealtechX"
        text="Explore each developer’s profile, track record and every project they have listed with us."
        image={img.commercial[5]}
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Developers' }]}
      />
      <section className="container grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {developers.map((d) => {
          const count = properties.filter((p) => p.developer === d.slug).length;
          return (
            <Link key={d.slug} href={`/developers/${d.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-luxe">
              <div className="relative h-40 overflow-hidden">
                <SmartImage src={d.cover} alt={d.name} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              </div>
              <div className="relative p-6 pt-10">
                <span className="absolute -top-8 left-6 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-ink font-display text-2xl font-bold text-gold-light">
                  {d.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </span>
                <p className="flex items-center justify-between font-display text-2xl font-semibold group-hover:text-gold-dark">
                  {d.name} <ArrowUpRight className="h-5 w-5" />
                </p>
                <p className="mt-1 text-sm text-muted">{d.tagline}</p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-ink/5 pt-4 text-center text-xs">
                  <div><p className="font-display text-xl font-semibold">{d.established || new Set(properties.filter((p) => p.developer === d.slug).map((p) => p.city)).size}</p><p className="text-muted">{d.established ? 'Established' : 'Cities'}</p></div>
                  <div><p className="font-display text-xl font-semibold">{count}</p><p className="text-muted">Projects</p></div>
                  <div><p className="font-display text-xl font-semibold">{getCity(d.city)?.name}</p><p className="text-muted">Base</p></div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
