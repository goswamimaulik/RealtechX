import type { Metadata } from 'next';
import { PageHero } from '@/components/ui';
import ShortlistView from './ShortlistView';
import { properties, toCards } from '@/lib/data/properties';

export const metadata: Metadata = { title: 'My Shortlist', robots: { index: false } };

export default function ShortlistPage() {
  return (
    <>
      <PageHero eyebrow="Saved" title="My shortlist" text="Properties you have saved on this device." crumbs={[{ href: '/', label: 'Home' }, { label: 'Shortlist' }]} />
      <ShortlistView all={toCards(properties)} />
    </>
  );
}
