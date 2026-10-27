import { Suspense } from 'react';
import Link from 'next/link';
import PropertiesExplorer from './PropertiesExplorer';
import { PageHero } from './ui';
import { LeadButton } from './LeadButtons';
import type { Property } from '@/lib/types';

type Key = 'q' | 'for' | 'type' | 'city' | 'locality' | 'status' | 'developer' | 'budget' | 'bhk' | 'sort';

export default function ArchivePage({
  eyebrow,
  title,
  text,
  image,
  crumbs,
  items,
  hide = [],
  related,
  seoText,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  crumbs: { href?: string; label: string }[];
  items: Property[];
  hide?: Key[];
  related?: { title: string; links: { href: string; label: string }[] };
  seoText?: string[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} text={text} image={image} crumbs={crumbs}>
        <div className="mt-8 flex flex-wrap gap-3">
          <LeadButton className="btn-gold" intent="Get Best Deals" source={`Archive: ${title}`} title={`Best deals: ${title}`}>
            Get best deals
          </LeadButton>
          <span className="btn-ghost-light pointer-events-none">{items.length} listings</span>
        </div>
      </PageHero>

      {related && related.links.length > 0 && (
        <div className="border-b border-ink/5 bg-white">
          <div className="container no-scrollbar flex items-center gap-2 overflow-x-auto py-4">
            <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted">{related.title}:</span>
            {related.links.map((l) => (
              <Link key={l.href} href={l.href} className="chip shrink-0">{l.label}</Link>
            ))}
          </div>
        </div>
      )}

      <Suspense fallback={<div className="container py-20 text-center text-muted">Loading properties…</div>}>
        <PropertiesExplorer items={items} hide={hide} />
      </Suspense>

      {seoText && (
        <section className="container pb-16">
          <div className="card prose-luxe p-7 md:p-10">
            <h2>About {title}</h2>
            {seoText.map((t, i) => <p key={i}>{t}</p>)}
          </div>
        </section>
      )}
    </>
  );
}
