import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
  action,
  light = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  center?: boolean;
  action?: { href: string; label: string };
  light?: boolean;
}) {
  return (
    <div className={`mb-7 flex gap-4 md:mb-12 ${center ? 'flex-col items-center text-center' : 'items-end justify-between'}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow ${light ? '!text-gold-light' : ''}`}>{eyebrow}</p>}
        <h2 className="h-section mt-2.5 text-balance md:mt-3">{title}</h2>
        {text && <p className={`mt-3 text-[14px] leading-relaxed md:mt-4 md:text-[15px] ${light ? 'text-ivory/65' : 'text-ink/65'}`}>{text}</p>}
      </div>
      {action && !center && (
        <>
          <Link href={action.href} className="flex shrink-0 items-center gap-1 pb-1 text-[13px] font-bold text-gold-dark md:hidden">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={action.href} className="btn-outline hidden shrink-0 md:inline-flex">
            {action.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, ...(it.href ? { item: it.href } : {}) })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs">
      <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap opacity-75">
        {items.map((it, i) => (
          <li key={i} className="flex shrink-0 items-center gap-1.5">
            {it.href ? <Link href={it.href} className="hover:text-gold">{it.label}</Link> : <span className="max-w-[200px] truncate font-semibold">{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3" />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
  image,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  image?: string;
  crumbs?: { href?: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-ivory">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" fetchPriority="high" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="container relative py-10 md:py-20">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow mt-5 !text-gold-light md:mt-6">{eyebrow}</p>}
        <h1 className="mt-2.5 max-w-3xl text-balance font-display text-[30px] font-semibold leading-[1.1] md:mt-3 md:text-[56px]">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ivory/70 md:mt-4 md:text-[15px]">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function Faq({ items, id }: { items: { q: string; a: string }[]; id?: string }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <div id={id} className="space-y-3">
      {items.map((f, i) => (
        <details key={f.q} className="group rounded-2xl border border-ink/[0.06] bg-white p-4 shadow-card md:p-5 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-bold md:text-[15px]">
            {f.q}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ivory-200 text-lg text-gold-dark transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{f.a}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
