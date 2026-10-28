import { pageMeta } from '@/lib/server/seo';
import ArchivePage from '@/components/ArchivePage';
import { getStore, filterBy, cardsOf } from '@/lib/server/store';
import { img } from '@/lib/data/images';

export const generateMetadata = () => pageMeta('/rent', { title: 'Rent Property — Furnished Homes, Villas & Offices for Lease', description: 'Rent furnished apartments, luxury villas and Grade-A office spaces in Mumbai, Bangalore, Hyderabad, Ahmedabad and more.' });

export default async function RentPage() {
  const s = await getStore();
  return (
    <ArchivePage
      eyebrow="For rent & lease"
      title="Properties for rent"
      text="Furnished homes, luxury villas and office spaces available for immediate move-in."
      image={img.apartment[7]}
      crumbs={[{ href: '/', label: 'Home' }, { label: 'Rent' }]}
      items={cardsOf(s, filterBy(s, { listingFor: 'rent' }))}
      hide={['for']}
      related={{ title: 'Rent in', links: s.cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: c.name })) }}
      seoText={[
        'Looking for a home or office on rent? RealtechX lists verified-format rental options with monthly rent, area, furnishing and amenities clearly shown.',
        'Shortlist the ones you like and our team will arrange visits at a time that suits you.',
      ]}
    />
  );
}
