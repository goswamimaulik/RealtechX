import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from '@/components/SmartImage';
import { Breadcrumbs } from '@/components/ui';
import LeadForm from '@/components/LeadForm';
import PropertyCard from '@/components/PropertyCard';
import { blogs, getBlog } from '@/lib/data/blogs';
import { properties } from '@/lib/data/properties';
import { formatDate, slugify } from '@/lib/format';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBlog(slug);
  if (!b) return {};
  return {
    title: b.title,
    description: b.excerpt,
    alternates: { canonical: `/blog/${b.slug}` },
    openGraph: { type: 'article', title: b.title, description: b.excerpt, images: [{ url: b.cover }], publishedTime: b.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBlog(slug);
  if (!b) notFound();
  const more = blogs.filter((x) => x.slug !== b.slug).slice(0, 3);
  const featured = properties.filter((p) => p.featured).slice(0, 2);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: b.title,
    description: b.excerpt,
    image: b.cover,
    datePublished: b.date,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  };

  return (
    <article>
      <header className="container max-w-4xl pt-10">
        <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { label: b.title }]} />
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-dark">{b.category}</p>
        <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.08] md:text-6xl">{b.title}</h1>
        <p className="mt-4 text-lg text-ink/65">{b.excerpt}</p>
        <p className="mt-4 text-xs font-semibold text-muted">{formatDate(b.date)} · {b.readTime} · By RealtechX Research</p>
      </header>
      <div className="container mt-8 max-w-5xl">
        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
          <Image src={b.cover} alt={b.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>

      <div className="container grid max-w-6xl gap-12 py-12 lg:grid-cols-[220px_1fr_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="label">On this page</p>
            <ul className="space-y-2 text-sm">
              {b.sections.map((s) => <li key={s.heading}><a href={`#${slugify(s.heading)}`} className="text-ink/70 hover:text-gold-dark">{s.heading}</a></li>)}
            </ul>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="prose-luxe text-[16.5px]">
            {b.sections.map((s) => (
              <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-28">
                <h2>{s.heading}</h2>
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </section>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-ink-grad p-8 text-ivory">
            <h3 className="font-display text-3xl font-semibold">Need help applying this to your search?</h3>
            <span className="mb-6 mt-2 block text-sm text-ivory/60">Talk to a RealtechX advisor — free, no obligation.</span>
            <LeadForm source={`Blog: ${b.title}`} cta="Talk to an Advisor" dark showEmail={false} />
          </div>
        </div>
        <aside className="space-y-6">
          <p className="label">Featured properties</p>
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </aside>
      </div>

      <section className="bg-ivory-200/60 py-14">
        <div className="container">
          <h2 className="mb-8 font-display text-3xl font-semibold">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/blog/${m.slug}`} className="card group p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">{m.category}</p>
                <p className="mt-2 font-display text-2xl font-semibold group-hover:text-gold-dark">{m.title}</p>
                <p className="mt-2 text-sm text-muted">{m.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </article>
  );
}
