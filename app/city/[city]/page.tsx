import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArchivePage from '@/components/ArchivePage';
import { filterProperties, localitiesOf } from '@/lib/data/properties';
import { cities, getCity } from '@/lib/data/cities';

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return {};
  return {
    title: `Property in ${c.name} — Flats, Villas, Plots & Offices`,
    description: `Buy or rent property in ${c.name}, ${c.state}. ${c.blurb}`,
    alternates: { canonical: `/city/${c.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();
  const locs = localitiesOf(c.slug);
  return (
    <ArchivePage
      eyebrow={c.state}
      title={`Property in ${c.name}`}
      text={c.blurb}
      image={c.image}
      crumbs={[{ href: '/', label: 'Home' }, { href: '/properties', label: 'Properties' }, { label: c.name }]}
      items={filterProperties({ city: c.slug })}
      hide={['city']}
      related={{ title: 'Localities', links: locs.map((l) => ({ href: `/city/${c.slug}/${l.slug}`, label: l.name })) }}
      seoText={[
        `${c.name} is one of India’s most active real estate markets. ${c.blurb}`,
        `Browse residential apartments, commercial spaces, plots, land and villas in ${c.name} — filter by locality, budget and project status to find the right fit.`,
      ]}
    />
  );
}
