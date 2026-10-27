import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck, Building, CalendarClock, CheckCircle2, Download, FileText, Layers, MapPin, Maximize2, MessageCircle, Phone, Ruler, ShieldAlert, Sparkles,
} from 'lucide-react';
import Gallery from '@/components/Gallery';
import PropertyActions from '@/components/PropertyActions';
import PropertyCard from '@/components/PropertyCard';
import LeadForm from '@/components/LeadForm';
import EmiCalculator from '@/components/EmiCalculator';
import { AutoLeadPopup, LeadButton } from '@/components/LeadButtons';
import { Breadcrumbs } from '@/components/ui';
import { getProperty, properties } from '@/lib/data/properties';
import { getCity } from '@/lib/data/cities';
import { getDeveloper } from '@/lib/data/developers';
import { areaRange, configLabel, formatDate, priceRange, titleCase } from '@/lib/format';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return {};
  const city = getCity(p.city)?.name;
  const title = `${p.title}, ${p.locality} ${city} — ${configLabel(p)} | ${priceRange(p)}`;
  return {
    title,
    description: `${p.tagline}. ${p.description[0].slice(0, 120)}…`,
    alternates: { canonical: `/property/${p.slug}` },
    openGraph: { title, images: [{ url: p.images[0] }] },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();
  const city = getCity(p.city)!;
  const dev = getDeveloper(p.developer)!;
  const similar = properties
    .filter((x) => x.id !== p.id && (x.city === p.city || x.type === p.type))
    .sort((a, b) => Number(b.city === p.city && b.type === p.type) - Number(a.city === p.city && a.type === p.type))
    .slice(0, 3);
  const isRent = p.listingFor === 'rent';

  const facts = [
    { Icon: Layers, k: isRent ? 'Monthly Rent' : 'Price', v: priceRange(p) },
    { Icon: Building, k: 'Configuration', v: configLabel(p) },
    { Icon: Maximize2, k: 'Area', v: areaRange(p) },
    { Icon: CalendarClock, k: 'Possession', v: p.possession },
    { Icon: Ruler, k: 'Land Parcel', v: p.landParcel },
    { Icon: Sparkles, k: 'Total Units', v: p.totalUnits },
    { Icon: BadgeCheck, k: 'Status', v: titleCase(p.status) },
    { Icon: FileText, k: 'RERA', v: p.rera },
  ];

  const faqs = [
    { q: `What is the price of ${p.title}?`, a: `${p.title} in ${p.locality}, ${city.name} is priced at ${priceRange(p)} depending on the configuration and floor.` },
    { q: `What configurations are available in ${p.title}?`, a: `${p.title} offers ${p.configurations.map((c) => `${c.label} (${c.area})`).join(', ')}.` },
    { q: `Who is the developer of ${p.title}?`, a: `${p.title} is developed by ${dev.name}, established in ${dev.established}.` },
    { q: `What is the possession date of ${p.title}?`, a: `The possession timeline for ${p.title} is ${p.possession}.` },
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: p.title,
        description: p.description.join(' '),
        image: p.images,
        brand: { '@type': 'Organization', name: dev.name },
        offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: p.priceMin, highPrice: p.priceMax, offerCount: p.configurations.length, availability: 'https://schema.org/InStock' },
      },
      { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  const tabs = ['Overview', 'Pricing', 'Amenities', 'Location', 'Developer', 'EMI', 'FAQs'].filter((t) => !(isRent && t === 'EMI'));

  return (
    <>
      <AutoLeadPopup storageKey={p.id} property={p.title} intent="Get Best Price" image={p.images[0]} title={`Get the best price for ${p.title}`} subtitle="Receive price sheet, floor plans and current offers on WhatsApp — in under 2 minutes." />

      <div className="container pt-6">
        <div className="text-ink">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: `/city/${city.slug}`, label: city.name }, { href: `/city/${city.slug}/${p.localitySlug}`, label: p.locality }, { label: p.title }]} />
        </div>
        <div className="mt-5">
          <Gallery images={p.images} title={p.title} />
        </div>
      </div>

      <div className="container grid gap-10 pb-24 pt-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {/* Title block */}
          <div className="flex flex-col gap-5 border-b border-ink/5 pb-7 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-light">{titleCase(p.status)}</span>
                <span className="rounded-full bg-gold-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-dark">{titleCase(p.type)} · For {isRent ? 'Rent' : 'Sale'}</span>
                <span className="rounded-full border border-ink/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">ID {p.id}</span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">{p.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/70"><MapPin className="h-4 w-4 text-gold-dark" />{p.locality}, {city.name}, {city.state}</p>
              <p className="mt-1 text-sm text-muted">by <Link href={`/developers/${dev.slug}`} className="font-semibold text-ink underline decoration-gold underline-offset-4">{dev.name}</Link></p>
            </div>
            <div className="md:text-right">
              <p className="font-display text-4xl font-semibold">{priceRange(p)}</p>
              <p className="mt-1 text-xs text-muted">{isRent ? 'Monthly rent, maintenance extra' : 'All-inclusive price on request'}</p>
              <div className="mt-4 md:flex md:justify-end"><PropertyActions id={p.id} title={p.title} /></div>
            </div>
          </div>

          {/* Section nav */}
          <nav className="no-scrollbar sticky top-[76px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-ink/5 bg-ivory/95 px-4 py-3 backdrop-blur">
            {tabs.map((t) => (
              <a key={t} href={`#${t.toLowerCase()}`} className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-white hover:text-ink">{t}</a>
            ))}
          </nav>

          {/* Overview */}
          <section id="overview" className="scroll-mt-36 pt-10">
            <h2 className="font-display text-3xl font-semibold">Project overview</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {facts.map(({ Icon, k, v }) => (
                <div key={k} className="card p-4">
                  <Icon className="h-5 w-5 text-gold-dark" />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</p>
                  <p className="mt-0.5 text-sm font-bold">{v}</p>
                </div>
              ))}
            </div>
            <div className="prose-luxe mt-8 max-w-none">
              {p.description.map((d, i) => <p key={i}>{d}</p>)}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {p.highlights.map((h) => (
                <p key={h} className="flex items-start gap-3 rounded-xl bg-white p-4 text-sm font-semibold shadow-card"><CheckCircle2 className="h-5 w-5 shrink-0 text-gold-dark" />{h}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LeadButton className="btn-ink" property={p.title} intent="Download Brochure" source="Property Brochure" image={p.images[1]}><Download className="h-4 w-4" /> Download Brochure</LeadButton>
              <LeadButton className="btn-outline" property={p.title} intent="Book Free Site Visit" source="Property Site Visit" image={p.images[2]}><CalendarClock className="h-4 w-4" /> Book Site Visit</LeadButton>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="scroll-mt-36 pt-14">
            <h2 className="font-display text-3xl font-semibold">{isRent ? 'Rent & configurations' : 'Price & floor plans'}</h2>
            <div className="card mt-6 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink text-left text-xs uppercase tracking-wider text-ivory/80">
                  <tr><th className="px-5 py-4">Configuration</th><th className="px-5 py-4">Area</th><th className="px-5 py-4">{isRent ? 'Rent' : 'Price'}</th><th className="hidden px-5 py-4 sm:table-cell" /></tr>
                </thead>
                <tbody>
                  {p.configurations.map((c) => (
                    <tr key={c.label + c.area} className="border-t border-ink/5">
                      <td className="px-5 py-4 font-bold">{c.label}</td>
                      <td className="px-5 py-4 text-ink/70">{c.area}</td>
                      <td className="px-5 py-4 font-display text-lg font-semibold">{c.price}</td>
                      <td className="hidden px-5 py-4 text-right sm:table-cell">
                        <LeadButton className="rounded-full border border-gold px-4 py-2 text-xs font-bold text-gold-dark transition hover:bg-gold hover:text-ink" property={p.title} intent={`Price Breakup: ${c.label}`} source="Pricing Table">
                          Get price breakup
                        </LeadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {p.configurations.slice(0, 2).map((c, i) => (
                <div key={c.label + i} className="card relative grid aspect-[4/3] place-items-center overflow-hidden bg-[repeating-linear-gradient(45deg,#FAF7F1,#FAF7F1_12px,#F3EDE2_12px,#F3EDE2_24px)]">
                  <div className="text-center blur-[0.5px]">
                    <Layers className="mx-auto h-10 w-10 text-gold-dark" />
                    <p className="mt-2 font-display text-2xl font-semibold">{c.label} floor plan</p>
                    <p className="text-sm text-muted">{c.area}</p>
                  </div>
                  <LeadButton className="btn-gold absolute bottom-5" property={p.title} intent={`Unlock ${c.label} Floor Plan`} source="Floor Plan">Unlock floor plan</LeadButton>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section id="amenities" className="scroll-mt-36 pt-14">
            <h2 className="font-display text-3xl font-semibold">Amenities</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {p.amenities.map((a) => (
                <p key={a} className="flex items-center gap-3 rounded-xl border border-ink/5 bg-white px-4 py-3.5 text-sm font-semibold">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-50"><Sparkles className="h-4 w-4 text-gold-dark" /></span>{a}
                </p>
              ))}
            </div>
          </section>

          {/* Location */}
          <section id="location" className="scroll-mt-36 pt-14">
            <h2 className="font-display text-3xl font-semibold">Location advantages</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <ul className="card divide-y divide-ink/5">
                {p.nearby.map((n) => (
                  <li key={n.name} className="flex items-center justify-between px-5 py-4 text-sm">
                    <span className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-gold-dark" />{n.name}</span>
                    <span className="rounded-full bg-ivory-200 px-3 py-1 text-xs font-bold">{n.distance}</span>
                  </li>
                ))}
              </ul>
              <div className="card min-h-[280px] overflow-hidden">
                <iframe
                  title={`Map of ${p.locality}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapQuery)}&z=13&output=embed`}
                  className="h-full min-h-[280px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>

          {/* Developer */}
          <section id="developer" className="scroll-mt-36 pt-14">
            <div className="card flex flex-col gap-6 p-7 md:flex-row md:items-center">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-ink font-display text-3xl font-bold text-gold-light">
                {dev.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </span>
              <div className="flex-1">
                <p className="eyebrow">About the developer</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{dev.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{dev.about}</p>
              </div>
              <Link href={`/developers/${dev.slug}`} className="btn-outline shrink-0">All projects</Link>
            </div>
          </section>

          {/* EMI */}
          {!isRent && (
            <section id="emi" className="scroll-mt-36 pt-14">
              <h2 className="mb-6 font-display text-3xl font-semibold">EMI calculator</h2>
              <div className="card p-6 md:p-8"><EmiCalculator defaultAmount={Math.round(p.priceMin * 0.8)} compact /></div>
            </section>
          )}

          {/* FAQs */}
          <section id="faqs" className="scroll-mt-36 pt-14">
            <h2 className="font-display text-3xl font-semibold">Frequently asked questions</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold">{f.q}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ivory-200 transition group-open:rotate-45">+</span></summary>
                  <p className="mt-3 text-sm text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-gold-50 p-4 text-xs leading-relaxed text-ink/70">
              <ShieldAlert className="h-4 w-4 shrink-0 text-gold-dark" />
              Disclaimer: This is a preview listing for demonstration. Details, prices and images are indicative and may change. Please verify project registration on the respective state RERA website before any decision. Listed {formatDate(p.postedOn)}.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-ink-grad p-6 text-ivory">
                <p className="text-xs uppercase tracking-[0.25em] text-gold-light">{isRent ? 'Rent' : 'Starting price'}</p>
                <p className="mt-1 font-display text-3xl font-semibold">{priceRange(p)}</p>
                <p className="mt-1 text-xs text-ivory/60">{configLabel(p)} · {areaRange(p)}</p>
              </div>
              <div className="p-6">
                <p className="mb-4 font-bold">Get best price & offers</p>
                <LeadForm source="Property Sidebar" property={p.title} intent="Get Best Price" cta="Get Best Price" showEmail={false} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${site.phoneRaw}`} className="btn-ink"><Phone className="h-4 w-4" /> Call</a>
              <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, I am interested in ${p.title} (${p.id}).`)}`} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="bg-ivory-200/60 py-16">
          <div className="container">
            <h2 className="mb-8 font-display text-3xl font-semibold md:text-4xl">Similar properties you may like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => <PropertyCard key={s.id} p={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-2 border-t border-ink/10 bg-white/95 p-3 backdrop-blur lg:hidden">
        <a href={`tel:${site.phoneRaw}`} className="btn-outline !px-2 !py-3"><Phone className="h-4 w-4" /> Call</a>
        <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, I am interested in ${p.title} (${p.id}).`)}`} target="_blank" rel="noopener" className="btn !px-2 !py-3 bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /> Chat</a>
        <LeadButton className="btn-gold !px-2 !py-3" property={p.title} intent="Get Best Price" source="Mobile Sticky Bar" image={p.images[0]}>Enquire</LeadButton>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
