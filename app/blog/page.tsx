import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import Image from '@/components/SmartImage';
import BlogBrowser from '@/components/BlogBrowser';
import { LeadButton } from '@/components/LeadButtons';
import { Breadcrumbs } from '@/components/ui';
import { blogs } from '@/lib/data/blogs';
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
      <section className="border-b border-ink/[0.06] bg-white">
        <div className="container py-8 md:py-14">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Blog' }]} />
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">The RealtechX journal</p>
              <h1 className="mt-2 font-display text-[32px] font-semibold leading-tight md:text-[52px]">Insights for smarter property decisions</h1>
            </div>
            <p className="max-w-sm text-[14.5px] text-muted">Buying guides, home-loan explainers and market notes from our research desk.</p>
          </div>

          {/* Featured */}
          <Link href={`/blog/${lead.slug}`} className="group mt-8 grid overflow-hidden rounded-[26px] border border-ink/[0.07] bg-ivory/40 md:mt-10 md:grid-cols-[1.2fr_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[360px]">
              <Image src={lead.cover} alt={lead.title} fill priority sizes="(max-width:768px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">Featured</span>
            </div>
            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-dark">{lead.category}</p>
              <h2 className="mt-2 font-display text-[24px] font-semibold leading-tight transition group-hover:text-gold-dark md:text-[34px]">{lead.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{lead.excerpt}</p>
              <p className="mt-5 flex items-center gap-2 text-[13px] text-muted">{formatDate(lead.date)} · <Clock className="h-3.5 w-3.5" /> {lead.readTime}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink group-hover:text-gold-dark">Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <h2 className="mb-6 font-display text-[24px] font-semibold md:text-[30px]">Latest articles</h2>
        <BlogBrowser posts={rest} />
      </section>

      <section className="container pb-16">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-7 text-ivory md:flex md:items-center md:justify-between md:gap-8 md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <p className="eyebrow !text-gold-light">Need personal advice?</p>
            <p className="mt-2 font-display text-[26px] font-semibold leading-tight md:text-[34px]">Talk to a RealtechX property advisor</p>
            <p className="mt-2 max-w-lg text-[14.5px] text-ivory/65">Get answers specific to your budget, city and timeline — free and no obligation.</p>
          </div>
          <LeadButton className="btn-gold relative mt-6 w-full shrink-0 md:mt-0 md:w-auto" intent="Talk to an Advisor" source="Blog Listing CTA">Talk to an advisor <ArrowRight className="h-4 w-4" /></LeadButton>
        </div>
      </section>
    </>
  );
}
