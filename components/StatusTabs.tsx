'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Property } from '@/lib/types';
import { statuses } from '@/lib/site';
import PropertyCard from './PropertyCard';
import Carousel from './Carousel';

export default function StatusTabs({ items }: { items: Property[] }) {
  const [tab, setTab] = useState<string>(statuses[0].slug);
  const list = items.filter((p) => p.status === tab).slice(0, 8);
  const label = statuses.find((s) => s.slug === tab)?.label;
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:mb-8 md:justify-center md:px-0">
        {statuses.map((s) => (
          <button key={s.slug} onClick={() => setTab(s.slug)} className={`chip shrink-0 !px-4 !py-2.5 !text-[13px] md:!px-5 ${tab === s.slug ? 'chip-active' : ''}`}>
            {s.label} <span className="opacity-60">({items.filter((p) => p.status === s.slug).length})</span>
          </button>
        ))}
      </div>
      <div key={tab} className="animate-fadeUp">
        <Carousel label={`${label} projects`}>
          {list.map((p) => <PropertyCard key={p.id} p={p} />)}
        </Carousel>
      </div>
      <div className="mt-8 text-center md:mt-10">
        <Link href={`/status/${tab}`} className="btn-outline">View all {label} projects <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
