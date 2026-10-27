import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/ui';
import LeadForm from '@/components/LeadForm';
import { site } from '@/lib/site';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Contact RealtechX',
  description: `Call ${site.phone} or email ${site.email}. RealtechX, Surat, Gujarat.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const items = [
    { Icon: Phone, k: 'Call us', v: site.phone, href: `tel:${site.phoneRaw}` },
    { Icon: MessageCircle, k: 'WhatsApp', v: site.phone, href: `https://wa.me/${site.whatsapp}` },
    { Icon: Mail, k: 'Email', v: site.email, href: `mailto:${site.email}` },
    { Icon: MapPin, k: 'Office', v: site.address },
    { Icon: Clock, k: 'Hours', v: site.hours },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s talk property" text="Questions about a listing, selling your property or a website for your business — we respond quickly." image={img.commercial[3]} crumbs={[{ href: '/', label: 'Home' }, { label: 'Contact' }]} />
      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {items.map(({ Icon, k, v, href }) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink"><Icon className="h-5 w-5 text-gold-light" /></span>
                <span><span className="block text-xs font-semibold uppercase tracking-wider text-muted">{k}</span><span className="block font-bold">{v}</span></span>
              </>
            );
            return href ? (
              <a key={k} href={href} className="card flex items-center gap-4 p-5 transition hover:shadow-luxe">{inner}</a>
            ) : (
              <div key={k} className="card flex items-center gap-4 p-5">{inner}</div>
            );
          })}
          <div className="card overflow-hidden">
            <iframe title="RealtechX location" src="https://maps.google.com/maps?q=Surat%2C%20Gujarat&z=12&output=embed" className="h-64 w-full border-0" loading="lazy" />
          </div>
        </div>
        <div className="card self-start p-7 md:p-10">
          <h2 className="font-display text-3xl font-semibold">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We usually reply within an hour during working hours.</p>
          <LeadForm source="Contact Page" cta="Send Message" showMessage />
        </div>
      </section>
    </>
  );
}
