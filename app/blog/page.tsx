import type { Metadata } from 'next';
import Link from 'next/link';
import Image from '@/components/SmartImage';
import { PageHero } from '@/components/ui';
import { blogs } from '@/lib/data/blogs';
import { img } from '@/lib/data/images';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Real Estate Blog — Buying Guides, Home Loans & Market Insights',
  description: 'Expert guides on buying property, home loans, RERA, investment and city market insights from RealtechX.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const [lead, ...rest] = blogs;
  return (
    <>
      <PageHero eyebrow="Journal" title="Insights for smarter property decisions" text="Guides, explainers and market notes from the RealtechX research desk." image={img.apartment[9]} crumbs={[{ href: '/', label: 'Home' }, { label: 'Blog' }]} />
      <section className="container py-14">
        <Link href={`/blog/${lead.slug}`} className="card group grid overflow-hidden md:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden">
            <Image src={lead.cover} alt={lead.title} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">Featured · {lead.category}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight group-hover:text-gold-dark md:text-4xl">{lead.title}</h2>
            <p className="mt-3 text-muted">{lead.excerpt}</p>
            <p className="mt-6 text-xs font-semibold text-ink/60">{formatDate(lead.date)} · {lead.readTime}</p>
          </div>
        </Link>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((b) => (
            <Link key={b.slug} href={`/blog/${b.slug}`} className="card group overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={b.cover} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">{b.category}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-snug group-hover:text-gold-dark">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{b.excerpt}</p>
                <p className="mt-4 text-xs font-semibold text-ink/60">{formatDate(b.date)} · {b.readTime}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
