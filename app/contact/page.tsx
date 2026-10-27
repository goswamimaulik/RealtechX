import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Faq, PageHero } from '@/components/ui';
import LeadForm from '@/components/LeadForm';
import { site } from '@/lib/site';
import { img } from '@/lib/data/images';

export const metadata: Metadata = {
  title: 'Contact RealtechX',
  description: `Call ${site.phone} or email ${site.email}. RealtechX, Surat, Gujarat.`,
  alternates: { canonical: '/contact' },
};

const faqs = [
  { q: 'How quickly will someone respond to my enquiry?', a: 'During working hours we usually call back within an hour. Enquiries received late in the evening are answered the next morning.' },
  { q: 'Can I book a site visit through RealtechX?', a: 'Yes. Mention the project and your preferred date in the form, or tap “Book site visit” on any property page. We confirm the slot with you by call or WhatsApp.' },
  { q: 'Can you help me with a home loan?', a: 'We can help you estimate EMI and eligibility and connect you with lenders. Visit the Home Loan page or share your requirement in the form.' },
  { q: 'I want to list my property — whom do I contact?', a: 'Use the Post Property page or send us a message here with the property details. Our listing team will get in touch within 24 hours.' },
  { q: 'Do you offer virtual site visits?', a: 'Yes, for many projects we can arrange a live video walkthrough — ideal for NRI buyers or anyone who cannot visit in person.' },
];

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
      <PageHero eyebrow="Contact" title="Let’s talk property" text="Questions about a listing, selling your property or a portal for your business — we respond quickly." image={img.commercial[3]} crumbs={[{ href: '/', label: 'Home' }, { label: 'Contact' }]} />
      <section className="container grid gap-8 py-12 md:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <div className="order-2 space-y-3 lg:order-1">
          {items.map(({ Icon, k, v, href }) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink"><Icon className="h-5 w-5 text-gold-light" /></span>
                <span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{k}</span><span className="block break-words text-[15px] font-bold">{v}</span></span>
              </>
            );
            return href ? (
              <a key={k} href={href} className="card flex items-center gap-4 p-4 transition hover:shadow-luxe md:p-5">{inner}</a>
            ) : (
              <div key={k} className="card flex items-center gap-4 p-4 md:p-5">{inner}</div>
            );
          })}
          <div className="card overflow-hidden">
            <iframe title="RealtechX location" src="https://maps.google.com/maps?q=Surat%2C%20Gujarat&z=12&output=embed" className="h-60 w-full border-0" loading="lazy" />
          </div>
        </div>
        <div className="card order-1 self-start p-5 md:p-10 lg:order-2">
          <h2 className="font-display text-[26px] font-semibold md:text-3xl">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We usually reply within an hour during working hours.</p>
          <LeadForm source="Contact Page" cta="Send message" showMessage />
        </div>
      </section>
      <section className="bg-white py-12 md:py-20">
        <div className="container max-w-3xl">
          <p className="eyebrow">Support</p>
          <h2 className="h-section mb-7 mt-3">Frequently asked questions</h2>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
