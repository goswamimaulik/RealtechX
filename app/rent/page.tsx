import type { Metadata } from 'next';
import ArchivePage from '@/components/ArchivePage';
import { filterProperties } from '@/lib/data/properties';
import { cities } from '@/lib/data/cities';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Rent Property — Furnished Homes, Villas & Offices for Lease',
  description: 'Rent furnished apartments, luxury villas and Grade-A office spaces in Mumbai, Bangalore, Hyderabad, Ahmedabad and more.',
  alternates: { canonical: '/rent' },
};

export default function RentPage() {
  return (
    <ArchivePage
      eyebrow="For rent & lease"
      title="Properties for rent"
      text="Furnished homes, luxury villas and office spaces available for immediate move-in."
      image={img.apartment[7]}
      crumbs={[{ href: '/', label: 'Home' }, { label: 'Rent' }]}
      items={filterProperties({ listingFor: 'rent' })}
      hide={['for']}
      related={{ title: 'Rent in', links: cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: c.name })) }}
      seoText={[
        'Looking for a home or office on rent? RealtechX lists verified-format rental options with monthly rent, area, furnishing and amenities clearly shown.',
        'Shortlist the ones you like and our team will arrange visits at a time that suits you.',
      ]}
    />
  );
}
