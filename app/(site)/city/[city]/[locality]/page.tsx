import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArchivePage from '@/components/ArchivePage';
import { getStore, filterBy, cardsOf, cityOf, localitiesIn, type Store } from '@/lib/server/store';
import { buildMeta } from '@/lib/server/seo';

function find(s: Store, city: string, locality: string) {
  const c = cityOf(s, city);
  const l = localitiesIn(s, city).find((x) => x.slug === locality);
  const master = s.localities.find((x) => x.city === city && x.slug === locality);
  return { c, l, master };
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; locality: string }> }): Promise<Metadata> {
  const { city, locality } = await params;
  const s = await getStore();
  const { c, l, master } = find(s, city, locality);
  if (!c || !l) return {};
  return buildMeta(master?.seo, {
    title: `Property in ${l.name}, ${c.name}`,
    description: `Explore flats, villas, plots and commercial property in ${l.name}, ${c.name}. Prices, configurations and amenities.`,
    image: master?.image,
    canonical: `/city/${c.slug}/${locality}`,
  }, s.settings.name);
}

export default async function LocalityPage({ params }: { params: Promise<{ city: string; locality: string }> }) {
  const { city, locality } = await params;
  const s = await getStore();
  const { c, l, master } = find(s, city, locality);
  if (!c || !l) notFound();
  const items = filterBy(s, { city, locality });
  return (
    <ArchivePage
      eyebrow={`${c.name} locality`}
      title={`Property in ${l.name}, ${c.name}`}
      text={`Handpicked projects in ${l.name} — compare prices, configurations and amenities.`}
      image={master?.image || items[0]?.images[0] || c.image}
      crumbs={[{ href: '/', label: 'Home' }, { href: `/city/${c.slug}`, label: c.name }, { label: l.name }]}
      items={cardsOf(s, items)}
      hide={['city', 'locality']}
      related={{ title: `More in ${c.name}`, links: localitiesIn(s, city).filter((x) => x.slug !== locality).map((x) => ({ href: `/city/${c.slug}/${x.slug}`, label: x.name })) }}
      seoText={master?.about ? master.about.split(/\n{2,}/) : undefined}
    />
  );
}
