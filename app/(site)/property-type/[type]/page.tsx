import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMeta } from '@/lib/server/seo';
import ArchivePage from '@/components/ArchivePage';
import { getStore, filterBy, cardsOf } from '@/lib/server/store';
import { img } from '@/lib/data/images';
import { navTypes } from '@/lib/site';

const copy: Record<string, { title: string; text: string; image: string; seo: string[] }> = {
  residential: {
    title: 'Residential apartments & flats',
    text: '2, 3, 4 BHK homes, penthouses and sky residences in prime city locations.',
    image: img.apartment[0],
    seo: ['Explore residential projects ranging from efficient 2 BHK homes to sea-facing 4 BHK sky residences. Each listing shows configurations, carpet areas, price range, amenities and possession date.'],
  },
  commercial: {
    title: 'Commercial property — offices & retail',
    text: 'Grade-A office spaces, business parks and high-street retail for sale and lease.',
    image: img.commercial[0],
    seo: ['Commercial real estate offers attractive rental yields and long lease tenures. Browse office suites, full floors and retail spaces in leading business districts like BKC, Kharadi, Whitefield, HITEC City and SG Highway.'],
  },
  plot: {
    title: 'Residential plots',
    text: 'Gated, approved plotted developments ready for you to build your dream home.',
    image: img.land[3],
    seo: ['Residential plots give you complete freedom to design your home. Browse approved, gated plotted communities with roads, utilities and amenities in place across major growth corridors.'],
  },
  land: {
    title: 'Land & farmland',
    text: 'Clear-title land parcels for farmhouses, investment and development.',
    image: img.land[1],
    seo: ['Land is the appreciating asset in real estate. Discover clear-title land parcels near highways, airports and scenic getaways — suitable for farmhouses, warehousing or long-term investment.'],
  },
  villa: {
    title: 'Luxury villas',
    text: 'Private villas with gardens, pools and smart-home features.',
    image: img.villa[0],
    seo: ['Experience the privacy of a bungalow with the security of a gated community. Browse luxury villas for sale and rent with private pools, gardens and premium clubhouses.'],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const c = copy[type];
  if (!c) return {};
  return pageMeta(`/property-type/${type}`, { title: `${c.title} for Sale & Rent`, description: c.text });
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const c = copy[type];
  if (!c) notFound();
  const s = await getStore();
  return (
    <ArchivePage
      eyebrow="Property type"
      title={c.title}
      text={c.text}
      image={c.image}
      crumbs={[{ href: '/', label: 'Home' }, { href: '/properties', label: 'Properties' }, { label: navTypes.find((t) => t.slug === type)?.label ?? type }]}
      items={cardsOf(s, filterBy(s, { type }))}
      hide={['type']}
      related={{ title: 'In city', links: s.cities.map((ct) => ({ href: `/properties?type=${type}&city=${ct.slug}`, label: ct.name })) }}
      seoText={c.seo}
    />
  );
}
