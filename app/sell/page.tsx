import type { Metadata } from 'next';
import { BadgeIndianRupee, Camera, Megaphone, UserCheck } from 'lucide-react';
import { PageHero } from '@/components/ui';
import SellForm from './SellForm';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Sell or Rent Out Your Property — Post Property Free',
  description: 'List your apartment, villa, plot, land or commercial property for sale or rent on RealtechX and reach serious buyers and tenants.',
  alternates: { canonical: '/sell' },
};

export default function SellPage() {
  return (
    <>
      <PageHero
        eyebrow="Post property free"
        title="Sell or rent out your property, the premium way"
        text="Owners, builders and channel partners — list with RealtechX and reach buyers and tenants actively searching in your city."
        image={img.villa[6]}
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Sell' }]}
      />
      <section className="container grid gap-12 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="h-section mt-3">Four simple steps</h2>
          <div className="mt-8 space-y-6">
            {[
              { Icon: UserCheck, t: 'Share your details', d: 'Fill in the form with your property information. It takes under two minutes.' },
              { Icon: Camera, t: 'We verify & shoot', d: 'Our team verifies documents and arranges professional photography.' },
              { Icon: Megaphone, t: 'Premium listing goes live', d: 'Your listing is published with SEO-optimised content and promoted to matching buyers.' },
              { Icon: BadgeIndianRupee, t: 'Close the deal', d: 'Get qualified enquiries, schedule visits and close with full support.' },
            ].map(({ Icon, t, d }, i) => (
              <div key={t} className="flex gap-4">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-gold-light">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink">{i + 1}</span>
                </span>
                <div><p className="font-bold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-7 md:p-10">
          <h2 className="font-display text-3xl font-semibold">Property details</h2>
          <p className="mb-6 mt-1 text-sm text-muted">Fields marked * are required.</p>
          <SellForm />
        </div>
      </section>
    </>
  );
}
