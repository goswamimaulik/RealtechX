'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { statuses } from '@/lib/site';
import PropertyCard from './PropertyCard';

export default function StatusTabs({ items }: { items: Property[] }) {
  const [tab, setTab] = useState<string>(statuses[0].slug);
  const list = items.filter((p) => p.status === tab).slice(0, 6);
  return (
    <div>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
        {statuses.map((s) => (
          <button key={s.slug} onClick={() => setTab(s.slug)} className={`chip shrink-0 !px-5 !py-2.5 !text-sm ${tab === s.slug ? 'chip-active' : ''}`}>
            {s.label} <span className="opacity-60">({items.filter((p) => p.status === s.slug).length})</span>
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      <div className="mt-10 text-center">
        <Link href={`/status/${tab}`} className="btn-outline">View all {statuses.find((s) => s.slug === tab)?.label} projects</Link>
      </div>
    </div>
  );
}
