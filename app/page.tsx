import Link from 'next/link';
import Image from '@/components/SmartImage';
import { ArrowUpRight, BadgeCheck, Building2, Calculator, Handshake, Home, Landmark, LineChart, MapPinned, Sparkles, Trees, Warehouse } from 'lucide-react';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/PropertyCard';
import StatusTabs from '@/components/StatusTabs';
import EmiCalculator from '@/components/EmiCalculator';
import LeadForm from '@/components/LeadForm';
import { LeadButton } from '@/components/LeadButtons';
import { SectionHeading } from '@/components/ui';
import { properties } from '@/lib/data/properties';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { blogs } from '@/lib/data/blogs';
import { img } from '@/lib/data/images';
import { navTypes } from '@/lib/site';
import { formatDate } from '@/lib/format';

const typeMeta: Record<string, { icon: React.ElementType; text: string; image: string }> = {
  residential: { icon: Home, text: 'Apartments, penthouses & sky residences', image: img.apartment[0] },
  commercial: { icon: Building2, text: 'Offices, retail & business parks', image: img.commercial[0] },
  plot: { icon: MapPinned, text: 'Gated, approved residential plots', image: img.land[3] },
  land: { icon: Trees, text: 'Farmland & investment land parcels', image: img.land[1] },
  villa: { icon: Warehouse, text: 'Private villas with gardens & pools', image: img.villa[0] },
};

const faqs = [
  { q: 'What types of properties can I find on RealtechX?', a: 'RealtechX lists residential apartments, commercial offices and retail, residential plots, land parcels and luxury villas — for sale and for rent — across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat.' },
  { q: 'Is there any fee to enquire about a property?', a: 'No. Enquiring, shortlisting and booking a site visit through RealtechX is completely free for home buyers and tenants.' },
  { q: 'Are the projects RERA verified?', a: 'RealtechX is currently a preview portal and the listings are sample projects for demonstration. Always verify any project on the respective state RERA website before making a booking.' },
  { q: 'Can I list my property for sale or rent?', a: 'Yes. Use the “Post Property” option to share your property details. Our team will review and get in touch with you.' },
  { q: 'How do I calculate my home loan EMI?', a: 'Use our free EMI calculator on the Home Loan page. Adjust the loan amount, interest rate and tenure to see your monthly EMI and the full repayment schedule instantly.' },
];

export default function HomePage() {
  const featured = properties.filter((p) => p.featured).slice(0, 6);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden bg-ink">
        <Image src={img.hero} alt="Luxury villa at dusk" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
        <div className="container flex min-h-[640px] flex-col justify-center py-20 md:min-h-[720px]">
          <p className="eyebrow animate-fadeUp !text-gold-light">India’s Premium Property Portal</p>
          <h1 className="mt-5 max-w-4xl animate-fadeUp text-balance font-display text-5xl font-semibold leading-[1.02] text-ivory md:text-7xl">
            Discover homes that match your <em className="gold-text not-italic">ambition</em>
          </h1>
          <p className="mt-5 max-w-xl animate-fadeUp text-base leading-relaxed text-ivory/75 md:text-lg">
            Curated residences, offices, plots, land and villas across six of India’s fastest-growing cities — with transparent details and advisors who actually pick up the phone.
          </p>
          <div className="mt-10 animate-fadeUp">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ivory/70">
            <span className="font-semibold text-ivory/90">Trending:</span>
            {[
              { href: '/properties?city=mumbai&type=residential', l: 'Flats in Worli' },
              { href: '/properties?city=pune&q=baner', l: 'Baner, Pune' },
              { href: '/properties?type=villa', l: 'Luxury villas' },
              { href: '/properties?city=bangalore&type=plot', l: 'Plots near Bangalore Airport' },
              { href: '/properties?for=rent&type=commercial', l: 'Offices for lease' },
            ].map((t) => (
              <Link key={t.href} href={t.href} className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-gold hover:text-gold-light">{t.l}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STATS ───────── */}
      <section className="relative z-10 -mt-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink/5 shadow-luxe md:grid-cols-4">
            {[
              { n: properties.length + '+', l: 'Curated listings' },
              { n: cities.length, l: 'Cities covered' },
              { n: developers.length, l: 'Developer partners' },
              { n: '5', l: 'Property categories' },
            ].map((s) => (
              <div key={s.l} className="bg-white px-6 py-7 text-center">
                <p className="font-display text-4xl font-semibold text-ink md:text-5xl">{s.n}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROPERTY TYPES ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Explore by category" title={<>Every kind of property, <span className="italic text-gold-dark">one address</span></>} text="From sea-facing sky residences to farmland in the Sahyadris — browse by what you are looking for." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {navTypes.map((t, i) => {
              const meta = typeMeta[t.slug];
              const Icon = meta.icon;
              const count = properties.filter((p) => p.type === t.slug).length;
              return (
                <Link key={t.slug} href={`/property-type/${t.slug}`} className={`group relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl p-6 text-ivory ${i === 0 ? 'lg:col-span-1' : ''}`}>
                  <Image src={meta.image} alt={t.label} fill sizes="(max-width:768px) 100vw, 20vw" className="-z-10 object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                  <span className="mb-auto grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Icon className="h-5 w-5 text-gold-light" /></span>
                  <p className="font-display text-3xl font-semibold">{t.label}</p>
                  <p className="mt-1 text-xs text-ivory/70">{meta.text}</p>
                  <p className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-semibold">
                    {count} listings <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      <section className="section bg-ivory-200/60">
        <div className="container">
          <SectionHeading eyebrow="Handpicked for you" title="Featured projects" text="Our advisors’ pick of the most promising launches and ready homes this month." action={{ href: '/properties?sort=featured', label: 'View all properties' }} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* ───────── CITIES ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Top destinations" title="Explore property by city" action={{ href: '/properties', label: 'All locations' }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c, i) => (
              <Link key={c.slug} href={`/city/${c.slug}`} className={`group relative isolate flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl p-6 text-ivory ${i === 0 ? 'lg:row-span-2 lg:min-h-full' : ''}`}>
                <Image src={c.image} alt={`Property in ${c.name}`} fill sizes="(max-width:768px) 100vw, 33vw" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">{c.state}</p>
                <p className="font-display text-4xl font-semibold">{c.name}</p>
                <p className="mt-1 max-w-sm text-sm text-ivory/70">{c.blurb}</p>
                <p className="mt-3 text-xs font-bold">{properties.filter((p) => p.city === c.slug).length} properties →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STATUS TABS ───────── */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="By project stage" title="New launches to ready-to-move homes" center />
          <StatusTabs items={properties} />
        </div>
      </section>

      {/* ───────── DEVELOPERS ───────── */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Builders we feature" title="Top developers" action={{ href: '/developers', label: 'All developers' }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {developers.slice(0, 8).map((d) => (
              <Link key={d.slug} href={`/developers/${d.slug}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-luxe">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-ink font-display text-xl font-bold text-gold-light">
                  {d.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold group-hover:text-gold-dark">{d.name}</span>
                  <span className="block text-xs text-muted">Since {d.established} · {properties.filter((p) => p.developer === d.slug).length} projects</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── WHY US ───────── */}
      <section className="section bg-ink text-ivory">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:aspect-[5/6]">
            <Image src={img.villa[2]} alt="Premium home interior" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-ink/80 p-5 backdrop-blur">
              <p className="font-display text-2xl font-semibold">“We help you decide — not just discover.”</p>
              <p className="mt-1 text-xs text-ivory/60">The RealtechX promise</p>
            </div>
          </div>
          <div>
            <p className="eyebrow !text-gold-light">Why RealtechX</p>
            <h2 className="h-section mt-3">A calmer, clearer way to buy property</h2>
            <p className="mt-4 text-ivory/65">Every listing on RealtechX is presented with complete pricing, configurations, amenities and location insights — so you spend less time chasing details and more time deciding.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                { Icon: BadgeCheck, t: 'Complete project details', d: 'Prices, floor plans, amenities and possession timelines on one page.' },
                { Icon: Handshake, t: 'Zero brokerage enquiries', d: 'Enquire, shortlist and book site visits at no cost.' },
                { Icon: LineChart, t: 'Market insight', d: 'Locality guides and investment analysis from our research desk.' },
                { Icon: Landmark, t: 'Home loan support', d: 'Compare home loan offers and calculate EMI instantly.' },
              ].map(({ Icon, t, d }) => (
                <div key={t}>
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/30 bg-gold/10"><Icon className="h-5 w-5 text-gold" /></span>
                  <p className="mt-4 font-bold">{t}</p>
                  <p className="mt-1 text-sm text-ivory/60">{d}</p>
                </div>
              ))}
            </div>
            <LeadButton className="btn-gold mt-10" intent="Talk to an Advisor" source="Home Why Us">Talk to an advisor</LeadButton>
          </div>
        </div>
      </section>

      {/* ───────── EMI ───────── */}
      <section className="section" id="emi">
        <div className="container">
          <SectionHeading eyebrow="Plan your finances" title={<><Calculator className="mr-2 inline h-9 w-9 text-gold-dark" />Home loan EMI calculator</>} action={{ href: '/home-loan', label: 'Home loan guide' }} />
          <div className="card p-6 md:p-10">
            <EmiCalculator compact={false} />
          </div>
        </div>
      </section>

      {/* ───────── SELL CTA ───────── */}
      <section className="pb-16 md:pb-24">
        <div className="container">
          <div className="grid overflow-hidden rounded-3xl bg-gold-grad md:grid-cols-2">
            <div className="p-8 md:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/70">For owners, builders & channel partners</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">Sell or rent out your property faster</h2>
              <p className="mt-4 max-w-md text-ink/75">List your property on RealtechX and reach serious buyers and tenants searching every day.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sell" className="btn-ink">Post Property Free</Link>
                <Link href="/services" className="btn border border-ink/20 text-ink hover:bg-ink/5">Our services</Link>
              </div>
            </div>
            <div className="relative min-h-[260px]">
              <Image src={img.villa[4]} alt="Modern home exterior" fill sizes="50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── BLOG ───────── */}
      <section className="section bg-ivory-200/60">
        <div className="container">
          <SectionHeading eyebrow="Insights" title="From the RealtechX journal" action={{ href: '/blog', label: 'Read the blog' }} />
          <div className="grid gap-6 md:grid-cols-3">
            {blogs.slice(0, 3).map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="card group overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={b.cover} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">{b.category} · {formatDate(b.date)}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-snug group-hover:text-gold-dark">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ + LEAD ───────── */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions buyers ask us" />
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold">
                    {f.q}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ivory-200 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="card self-start p-7 md:p-9 lg:sticky lg:top-28">
            <Sparkles className="h-8 w-8 text-gold" />
            <h3 className="mt-3 font-display text-3xl font-semibold">Get a free property consultation</h3>
            <p className="mb-6 mt-2 text-sm text-muted">Share your requirement and receive handpicked options within 30 minutes.</p>
            <LeadForm source="Home Consultation" cta="Request Call Back" showMessage />
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </section>
    </>
  );
}
