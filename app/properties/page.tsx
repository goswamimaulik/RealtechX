import type { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesExplorer from '@/components/PropertiesExplorer';
import { PageHero } from '@/components/ui';
import { properties } from '@/lib/data/properties';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Search Properties — Flats, Offices, Plots, Land & Villas',
  description: 'Search and filter premium properties for sale and rent across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat by type, budget, BHK, status and developer.',
  alternates: { canonical: '/properties' },
};

export default function PropertiesPage() {
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
        <PropertiesExplorer items={properties} syncUrl />
      </Suspense>
    </>
  );
}
