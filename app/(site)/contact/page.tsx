import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Faq, PageHero } from '@/components/ui';
import LeadForm from '@/components/LeadForm';
import { getStore } from '@/lib/server/store';
import { pageMeta } from '@/lib/server/seo';

export async function generateMetadata() {
  const s = await getStore();
  const st = s.settings;
  return pageMeta('/contact', { title: `Contact ${st.name}`, description: `Call ${st.phone} or email ${st.email}. ${st.address}.` });
}

export default async function ContactPage() {
  const s = await getStore();
  const site = s.settings;
  const c = s.contact;
  const items = [
    { Icon: Phone, k: 'Call us', v: site.phone, href: `tel:${site.phoneRaw}` },
    { Icon: MessageCircle, k: 'WhatsApp', v: site.phone, href: `https://wa.me/${site.whatsapp}` },
    { Icon: Mail, k: 'Email', v: site.email, href: `mailto:${site.email}` },
    { Icon: MapPin, k: 'Office', v: site.address },
    { Icon: Clock, k: 'Hours', v: site.hours },
  ].filter((x) => x.v);
  const mapQuery = c.mapQuery || site.address;
  return (
    <>
      <PageHero eyebrow="Contact" title={c.heroTitle} text={c.heroText} image={c.heroImage} crumbs={[{ href: '/', label: 'Home' }, { label: 'Contact' }]} />
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
          {mapQuery && (
            <div className="card overflow-hidden">
              <iframe title={`${site.name} location`} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`} className="h-60 w-full border-0" loading="lazy" />
            </div>
          )}
        </div>
        <div className="card order-1 self-start p-5 md:p-10 lg:order-2">
          <h2 className="font-display text-[26px] font-semibold md:text-3xl">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We usually reply within an hour during working hours.</p>
          <LeadForm source="Contact Page" cta="Send message" showMessage />
        </div>
      </section>
      {c.faqs.length > 0 && (
        <section className="bg-white py-12 md:py-20">
          <div className="container max-w-3xl">
            <p className="eyebrow">Support</p>
            <h2 className="h-section mb-7 mt-3">Frequently asked questions</h2>
            <Faq items={c.faqs} />
          </div>
        </section>
      )}
    </>
  );
}
