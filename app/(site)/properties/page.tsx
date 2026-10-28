import { pageMeta } from '@/lib/server/seo';
import { Suspense } from 'react';
import PropertiesExplorer from '@/components/PropertiesExplorer';
import { PageHero } from '@/components/ui';
import { getStore, cardsOf } from '@/lib/server/store';
import { img } from '@/lib/data/images';

export const generateMetadata = () =>
  pageMeta('/properties', {
    title: 'Search Properties — Flats, Offices, Plots, Land & Villas',
    description: 'Search and filter premium properties for sale and rent across India’s top cities by type, budget, BHK, status and developer.',
  });

export default async function PropertiesPage() {
  const s = await getStore();
  return (
    <>
      <PageHero
        eyebrow="Property search"
        title="Find your next property"
        text="Filter by city, locality, budget, configuration, status and developer."
        image={img.heroAlt}
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Properties' }]}
      />
      <Suspense fallback={<div className="container py-20 text-center text-muted">Loading properties…</div>}>
        <PropertiesExplorer items={cardsOf(s, s.properties)} cityOptions={s.cities.map((c) => ({ slug: c.slug, name: c.name }))} syncUrl />
      </Suspense>
    </>
  );
}
