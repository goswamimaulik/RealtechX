import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, PenLine } from 'lucide-react';
import Image from '@/components/SmartImage';
import { Breadcrumbs } from '@/components/ui';
import PropertyCard from '@/components/PropertyCard';
import BlogCard from '@/components/BlogCard';
import Carousel from '@/components/Carousel';
import ShareButtons from '@/components/ShareButtons';
import { LeadButton } from '@/components/LeadButtons';
import { formatDate, slugify } from '@/lib/format';
import { getStore, blogOf, cityOf, cardOf } from '@/lib/server/store';
import { buildMeta } from '@/lib/server/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getStore();
  const b = blogOf(s, slug);
  if (!b) return {};
  const meta = buildMeta(b.seo, { title: b.title, description: b.excerpt, image: b.cover, canonical: `/blog/${b.slug}` }, s.settings.name);
  return { ...meta, openGraph: { ...meta.openGraph, type: 'article', publishedTime: b.date } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getStore();
  const site = s.settings;
  const { properties, blogs } = s;
  const b = blogOf(s, slug);
  if (!b) notFound();
  const author = b.author || `${site.name} Team`;
  const city = b.city ? cityOf(s, b.city) : undefined;
  const projects = (city ? properties.filter((p) => p.city === city.slug) : properties.filter((p) => p.featured))
    .sort((a, c) => Number(c.source === 'published') - Number(a.source === 'published'))
    .slice(0, 8);
  const related = blogs.filter((x) => x.slug !== b.slug).sort((x, y) => Number(y.category === b.category) - Number(x.category === b.category)).slice(0, 3);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: b.title,
    description: b.excerpt,
    image: b.cover,
    datePublished: b.date,
    author: { '@type': 'Organization', name: author },
    publisher: { '@type': 'Organization', name: site.name },
  };

  return (
    <article>
      {/* Header */}
      <header className="border-b border-ink/[0.06] bg-white">
        <div className="container max-w-3xl pb-8 pt-8 md:pb-10 md:pt-12">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { label: b.title }]} />
          <p className="mt-6 inline-flex rounded-full bg-gold-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-dark">{b.category}</p>
          <h1 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] md:text-[50px]">{b.title}</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink/65 md:text-[17px]">{b.excerpt}</p>
          <div className="mt-6 flex flex-col gap-4 border-t border-ink/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink"><PenLine className="h-4 w-4 text-gold-light" /></span>
              <div className="text-[13px]">
                <p className="font-semibold">{author}</p>
                <p className="flex items-center gap-1.5 text-muted">{formatDate(b.date)} · <Clock className="h-3 w-3" /> {b.readTime}</p>
              </div>
            </div>
            <ShareButtons title={b.title} />
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="container max-w-5xl pt-8 md:pt-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] md:rounded-[28px]">
          <Image src={b.cover} alt={b.title} fill priority sizes="(max-width:1024px) 100vw, 1024px" className="object-cover" />
        </div>
      </div>

      {/* Body */}
      <div className="container max-w-3xl py-10 md:py-14">
        {b.sections.length > 2 && (
          <nav className="mb-8 rounded-2xl border border-ink/[0.07] bg-white p-5" aria-label="In this article">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">In this article</p>
            <ol className="mt-3 space-y-1.5 text-[14.5px]">
              {b.sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${slugify(s.heading)}`} className="flex gap-2 text-ink/75 hover:text-gold-dark"><span className="text-muted">{i + 1}.</span>{s.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="prose-luxe text-[16.5px] [&_p]:text-[16.5px] [&_p]:leading-[1.85]">
          {b.sections.map((s) => (
            <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-28">
              <h2>{s.heading}</h2>
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/[0.06] pt-6">
          <Link href="/blog" className="btn-outline !py-2.5 text-[13.5px]"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
          <Link href={city ? `/city/${city.slug}` : '/properties'} className="btn-ink !py-2.5 text-[13.5px]">
            Browse properties{city ? ` in ${city.name}` : ''} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[24px] bg-ink p-6 text-ivory md:flex md:items-center md:justify-between md:gap-6 md:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <p className="font-display text-[24px] font-semibold leading-tight md:text-[28px]">Need help applying this to your search?</p>
            <p className="mt-1.5 text-[14px] text-ivory/65">Talk to a {site.name} advisor — free and no obligation.</p>
          </div>
          <LeadButton className="btn-gold relative mt-5 w-full shrink-0 md:mt-0 md:w-auto" intent="Talk to an Advisor" source={`Blog: ${b.title}`}>Talk to an advisor <ArrowRight className="h-4 w-4" /></LeadButton>
        </div>
      </div>

      {/* Projects */}
      <section className="border-t border-ink/[0.06] bg-white py-12 md:py-16">
        <div className="container">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="eyebrow">Explore projects</p>
              <h2 className="h-section mt-2">{city ? `Projects in ${city.name}` : 'Handpicked projects'}</h2>
            </div>
            <Link href={city ? `/city/${city.slug}` : '/properties?sort=featured'} className="shrink-0 pb-1 text-[13.5px] font-semibold text-gold-dark hover:underline">
              See all <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
          <Carousel label="Projects">
            {projects.map((p) => <PropertyCard key={p.id} p={cardOf(s, p)} />)}
          </Carousel>
        </div>
      </section>

      {/* Related reads */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
            <h2 className="h-section">Related reads</h2>
            <Link href="/blog" className="shrink-0 pb-1 text-[13.5px] font-semibold text-gold-dark hover:underline">All articles <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
          <Carousel label="Related reads">
            {related.map((r) => <BlogCard key={r.slug} b={r} />)}
          </Carousel>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </article>
  );
}
