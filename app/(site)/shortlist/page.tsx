import type { Metadata } from 'next';
import { PageHero } from '@/components/ui';
import ShortlistView from './ShortlistView';
import { getStore, cardsOf } from '@/lib/server/store';

export const metadata: Metadata = { title: 'My Shortlist', robots: { index: false } };

export default async function ShortlistPage() {
  const s = await getStore();
  return (
    <>
      <PageHero eyebrow="Saved" title="My shortlist" text="Properties you have saved on this device." crumbs={[{ href: '/', label: 'Home' }, { label: 'Shortlist' }]} />
      <ShortlistView all={cardsOf(s, s.properties)} />
    </>
  );
}
