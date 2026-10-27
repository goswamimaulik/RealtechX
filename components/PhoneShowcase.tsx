import { CheckCircle2, Heart, MapPin, MessageCircle, Search } from 'lucide-react';
import SmartImage from './SmartImage';
import { LeadButton } from './LeadButtons';
import { site } from '@/lib/site';
import type { Property } from '@/lib/types';
import { startPrice, configLabel } from '@/lib/format';

/** "Your partner in finding a home" CTA with an on-brand phone mockup. */
export default function PhoneShowcase({ featured }: { featured: Property[] }) {
  const [a, b] = featured;
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-ivory md:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow !text-gold-light">Personal shortlist</p>
          <h2 className="h-section mt-3 text-balance">RealtechX, your partner in finding the right property</h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ivory/70">
            Tell us your budget, city and configuration. Our advisor sends you 3 handpicked projects on WhatsApp within 24 hours — with price sheets and floor plans.
          </p>
          <ul className="mt-7 grid gap-3 text-sm text-ivory/85 sm:grid-cols-2">
            {['Shortlist matched to your budget', 'Price sheet & floor plans', 'Free site visit scheduling', 'Home loan assistance'].map((t) => (
              <li key={t} className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />{t}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LeadButton className="btn-gold" intent="Get My Shortlist" source="Phone Showcase" title="Get 3 handpicked projects on WhatsApp" subtitle="Share your requirement — we reply within 24 hours.">
              Get my shortlist
            </LeadButton>
            <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi RealtechX, please share a property shortlist for me.')}`} target="_blank" rel="noopener" className="btn-ghost-light">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto w-[260px] sm:w-[290px]">
          <div className="absolute -inset-6 rounded-[60px] bg-gold/20 blur-2xl" />
          <div className="relative rounded-[44px] border-[10px] border-[#1d2333] bg-ivory shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)] ring-1 ring-white/10">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1d2333]" />
            <div className="h-[520px] overflow-hidden rounded-[34px] sm:h-[560px]">
              <div className="flex items-center justify-between bg-white px-4 pb-3 pt-9">
                <span className="font-display text-[17px] font-bold text-ink">Realtech<span className="gold-text">X</span></span>
                <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/10"><Heart className="h-3.5 w-3.5 text-ink" /></span>
              </div>
              <div className="px-3.5 pt-3">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[11px] text-muted shadow-card">
                  <Search className="h-3.5 w-3.5 text-gold-dark" /> Search locality or project
                </div>
                <div className="mt-3 flex gap-1.5">
                  {['Buy', 'Rent', 'Plots', 'Villas'].map((t, i) => (
                    <span key={t} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${i === 0 ? 'bg-ink text-ivory' : 'bg-white text-ink/70'}`}>{t}</span>
                  ))}
                </div>
                {[a, b].filter(Boolean).map((p) => (
                  <div key={p.id} className="mt-3 overflow-hidden rounded-2xl bg-white text-ink shadow-card">
                    <div className="relative h-[120px] sm:h-[130px]">
                      <SmartImage src={p.images[0]} alt="" fill sizes="280px" className="object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[8px] font-extrabold uppercase text-ink">Featured</span>
                    </div>
                    <div className="p-2.5">
                      <p className="font-display text-[14px] font-bold">{startPrice(p)}</p>
                      <p className="truncate text-[11px] font-bold">{p.title}</p>
                      <p className="flex items-center gap-1 truncate text-[9.5px] text-muted"><MapPin className="h-2.5 w-2.5" />{p.locality} · {configLabel(p)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
