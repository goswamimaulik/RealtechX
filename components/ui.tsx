import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  center?: boolean;
  action?: { href: string; label: string };
}) {
  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-14 ${center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={center ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="h-section mt-3 text-balance">{title}</h2>
        {text && <p className="mt-4 text-[15px] leading-relaxed text-ink/65">{text}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-outline shrink-0">
          {action.label} <ChevronRight className="h-4 w-4" />
        </Link>
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
    <nav aria-label="Breadcrumb" className="text-xs">
      <ol className="flex flex-wrap items-center gap-1.5 text-current opacity-75">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? <Link href={it.href} className="hover:text-gold">{it.label}</Link> : <span className="font-semibold">{it.label}</span>}
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
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" fetchPriority="high" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="container relative py-14 md:py-20">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow mt-6 !text-gold-light">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] md:text-6xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory/70">{text}</p>}
        {children}
      </div>
    </section>
  );
}
