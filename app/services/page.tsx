import type { Metadata } from 'next';
import { Building2, Calculator, ClipboardList, Globe, Home, KeyRound, LineChart, Megaphone } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/ui';
import { LeadButton } from '@/components/LeadButtons';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Our Services — Buying, Renting, Selling & Real Estate Marketing',
  description: 'Property buying advisory, rentals, resale listings, home loan assistance and premium real estate websites & lead generation for developers and channel partners.',
  alternates: { canonical: '/services' },
};

const buyers = [
  { Icon: Home, t: 'Property Buying Advisory', d: 'Shortlisting, site visits, price negotiation and documentation support.' },
  { Icon: KeyRound, t: 'Rental & Leasing', d: 'Homes, villas and offices on rent with transparent terms.' },
  { Icon: ClipboardList, t: 'Resale & Listing', d: 'List your property and reach serious buyers and tenants.' },
  { Icon: Calculator, t: 'Home Loan Assistance', d: 'EMI planning and help comparing offers from leading lenders.' },
];

const business = [
  { Icon: Globe, t: 'Real Estate Websites', d: 'Premium, fast and SEO-ready websites and portals for developers, brokers and channel partners.' },
  { Icon: Megaphone, t: 'Project Landing Pages', d: 'High-converting landing pages with popups, CTAs and lead capture built in.' },
  { Icon: LineChart, t: 'Lead Management CRM', d: 'Capture, track and convert leads with email alerts and status pipelines.' },
  { Icon: Building2, t: 'Property Listing Platforms', d: 'Multi-city listing portals with search, filters, developer pages and admin panel.' },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Everything you need, under one roof" text="For home buyers, tenants and owners — and for real estate businesses that want to grow online." image={img.commercial[1]} crumbs={[{ href: '/', label: 'Home' }, { label: 'Services' }]} />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="For buyers, tenants & owners" title="Property services" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {buyers.map((s) => <ServiceCard key={s.t} {...s} />)}
          </div>
        </div>
      </section>

      <section className="section bg-ink text-ivory">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow !text-gold-light">For developers, brokers & channel partners</p>
            <h2 className="h-section mt-3">Grow your real estate business online</h2>
            <p className="mt-4 text-ivory/65">The same technology that powers RealtechX — premium design, fast performance, SEO structure and lead management — built for your brand.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {business.map(({ Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <Icon className="h-8 w-8 text-gold" />
                <p className="mt-5 font-display text-2xl font-semibold">{t}</p>
                <p className="mt-2 text-sm text-ivory/60">{d}</p>
              </div>
            ))}
          </div>
          <LeadButton className="btn-gold mt-12" intent="Website & Lead Generation Enquiry" source="Services Page" title="Want a portal like RealtechX?" subtitle="Share your details and we’ll show you a live demo and proposal.">
            Get a website like this
          </LeadButton>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ Icon, t, d }: { Icon: React.ElementType; t: string; d: string }) {
  return (
    <div className="card group p-7 transition hover:-translate-y-1 hover:shadow-luxe">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink transition group-hover:bg-gold"><Icon className="h-6 w-6 text-gold-light group-hover:text-ink" /></span>
      <p className="mt-5 font-display text-2xl font-semibold">{t}</p>
      <p className="mt-2 text-sm text-muted">{d}</p>
    </div>
  );
}
