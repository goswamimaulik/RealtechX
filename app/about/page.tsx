import type { Metadata } from 'next';
import Image from '@/components/SmartImage';
import { Compass, Eye, Gem, ShieldCheck } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/ui';
import { LeadButton } from '@/components/LeadButtons';
import { img } from '@/lib/data/images';
import { properties } from '@/lib/data/properties';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';

export const metadata: Metadata = {
  title: 'About RealtechX — Premium Real Estate Portal',
  description: 'RealtechX is a premium real estate portal built to make property discovery clear, fast and trustworthy across India’s top cities.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Real estate, presented the way it deserves" text="RealtechX brings premium design, complete information and genuine advice to property discovery in India." image={img.villa[1]} crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]} />

      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="h-section mt-3">Built for buyers who value clarity</h2>
            <div className="prose-luxe mt-6">
              <p>Searching for property in India often means incomplete listings, hidden prices and endless follow-up calls. RealtechX was created to change that — with a portal where every project is presented with full pricing, configurations, amenities and location insights on a single, beautiful page.</p>
              <p>We cover residential apartments, commercial spaces, plots, land and luxury villas across Mumbai, Pune, Bangalore, Hyderabad, Ahmedabad and Surat, and we are expanding city by city.</p>
              <p>Behind the portal is a team that understands real estate websites, search and lead management — so developers and channel partners get qualified enquiries, and buyers get answers.</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={img.apartment[7]} alt="Premium living room" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-ivory">
        <div className="container grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { n: properties.length + '+', l: 'Listings' },
            { n: cities.length, l: 'Cities' },
            { n: developers.length, l: 'Developers' },
            { n: '24/7', l: 'Online enquiries' },
          ].map((s) => (
            <div key={s.l}><p className="font-display text-5xl font-semibold text-gold-light">{s.n}</p><p className="mt-1 text-xs uppercase tracking-[0.25em] text-ivory/60">{s.l}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="What drives us" title="Our values" center />
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { Icon: Eye, t: 'Transparency', d: 'Complete details, upfront. No hidden surprises.' },
              { Icon: Gem, t: 'Premium experience', d: 'Design and speed that respect your time.' },
              { Icon: ShieldCheck, t: 'Responsibility', d: 'We encourage every buyer to verify on RERA.' },
              { Icon: Compass, t: 'Guidance', d: 'Advisors who help you decide, not just discover.' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="card p-7 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold-50"><Icon className="h-6 w-6 text-gold-dark" /></span>
                <p className="mt-4 font-display text-2xl font-semibold">{t}</p>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <LeadButton className="btn-gold" intent="Talk to Us" source="About Page">Talk to our team</LeadButton>
          </div>
        </div>
      </section>
    </>
  );
}
