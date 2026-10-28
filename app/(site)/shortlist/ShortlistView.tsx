'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import { useShortlist } from '@/components/useShortlist';
import { openLead } from '@/components/LeadModal';
import type { CardProperty } from '@/lib/types';

export default function ShortlistView({ all }: { all: CardProperty[] }) {
  const { items } = useShortlist();
  const list = all.filter((p) => items.includes(p.id));

  if (!list.length) {
    return (
      <div className="container flex flex-col items-center py-20 text-center">
        <Heart className="h-12 w-12 text-gold" />
        <p className="mt-4 font-display text-3xl font-semibold">Your shortlist is empty</p>
        <p className="mt-2 text-sm text-muted">Tap the heart on any property to save it here.</p>
        <Link href="/properties" className="btn-gold mt-6">Browse properties</Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm"><span className="font-bold">{list.length}</span> saved properties</p>
        <button
          onClick={() => openLead({ intent: 'Compare My Shortlist', source: 'Shortlist', property: list.map((p) => p.title).join(', '), title: 'Get expert comparison of your shortlist' })}
          className="btn-gold"
        >
          Get expert comparison
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
