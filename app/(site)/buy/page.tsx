import { pageMeta } from '@/lib/server/seo';
import ArchivePage from '@/components/ArchivePage';
import { getStore, filterBy, cardsOf } from '@/lib/server/store';
import { img } from '@/lib/data/images';

export const generateMetadata = () => pageMeta('/buy', { title: 'Buy Property — Flats, Villas, Plots, Land & Offices for Sale', description: 'Buy premium apartments, villas, plots, land and commercial property in Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat.' });

export default async function BuyPage() {
  const s = await getStore();
  return (
    <ArchivePage
      eyebrow="For sale"
      title="Properties for sale"
      text="New launches, under-construction and ready-to-move properties from trusted developers."
      image={img.villa[3]}
      crumbs={[{ href: '/', label: 'Home' }, { label: 'Buy' }]}
      items={cardsOf(s, filterBy(s, { listingFor: 'buy' }))}
      hide={['for']}
      related={{ title: 'Buy in', links: s.cities.map((c) => ({ href: `/properties?for=buy&city=${c.slug}`, label: c.name })) }}
      seoText={[
        'Buying a property is one of the biggest financial decisions you will make. RealtechX brings together residential apartments, villas, plots, land and commercial spaces for sale with complete pricing, configuration and possession details in one place.',
        'Use the filters to narrow down by budget, BHK, project status and developer, then shortlist and compare. When you are ready, request a call back or book a free site visit.',
      ]}
    />
  );
}
