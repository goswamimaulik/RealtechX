import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArchivePage from '@/components/ArchivePage';
import { allLocalities, filterProperties, localitiesOf } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';

export function generateStaticParams() {
  return allLocalities().map((l) => ({ city: l.city, locality: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; locality: string }> }): Promise<Metadata> {
  const { city, locality } = await params;
  const c = getCity(city);
  const l = localitiesOf(city).find((x) => x.slug === locality);
  if (!c || !l) return {};
  return {
    title: `Property in ${l.name}, ${c.name}`,
    description: `Explore flats, villas, plots and commercial property in ${l.name}, ${c.name}. Prices, configurations and amenities.`,
    alternates: { canonical: `/city/${c.slug}/${locality}` },
  };
}

export default async function LocalityPage({ params }: { params: Promise<{ city: string; locality: string }> }) {
  const { city, locality } = await params;
  const c = getCity(city);
  const l = localitiesOf(city).find((x) => x.slug === locality);
  if (!c || !l) notFound();
  const items = filterProperties({ city, locality });
  return (
    <ArchivePage
      eyebrow={`${c.name} locality`}
      title={`Property in ${l.name}, ${c.name}`}
      text={`Handpicked projects in ${l.name} — compare prices, configurations and amenities.`}
      image={items[0]?.images[0] ?? c.image}
      crumbs={[{ href: '/', label: 'Home' }, { href: `/city/${c.slug}`, label: c.name }, { label: l.name }]}
      items={items}
      hide={['city', 'locality']}
      related={{ title: `More in ${c.name}`, links: localitiesOf(city).filter((x) => x.slug !== locality).map((x) => ({ href: `/city/${c.slug}/${x.slug}`, label: x.name })) }}
    />
  );
}
