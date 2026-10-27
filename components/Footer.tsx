import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Logo from './Logo';
import { site, navTypes } from '@/lib/site';
import { cities } from '@/lib/data/cities';
import { allLocalities } from '@/lib/data/properties';

export default function Footer() {
  const localities = allLocalities();
  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl" />

      {/* CTA band */}
      <div className="container relative">
        <div className="-mb-px flex flex-col items-start justify-between gap-6 border-b border-white/10 py-14 md:flex-row md:items-center">
          <div>
            <p className="eyebrow !text-gold-light">Talk to an advisor</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight md:text-4xl">
              Looking for the right property? Let’s find it together.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${site.phoneRaw}`} className="btn-gold">
              <Phone className="h-4 w-4" /> Call {site.phone}
            </a>
            <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi RealtechX, I am looking for a property.')}`} target="_blank" rel="noopener" className="btn-ghost-light">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <div className="container relative grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">{site.description}</p>
          <ul className="mt-6 space-y-3 text-sm text-ivory/80">
            <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-gold" /><a href={`tel:${site.phoneRaw}`}>{site.phone}</a></li>
            <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-gold" /><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-gold" />{site.address}</li>
          </ul>
          <div className="mt-6 flex gap-2">
            {[
              { Icon: Instagram, href: site.social.instagram, label: 'Instagram' },
              { Icon: Facebook, href: site.social.facebook, label: 'Facebook' },
              { Icon: Linkedin, href: site.social.linkedin, label: 'LinkedIn' },
              { Icon: Youtube, href: site.social.youtube, label: 'YouTube' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-gold hover:text-gold">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          className="lg:col-span-2"
          title="Property Types"
          links={navTypes
            .map((t): { href: string; label: string } => ({ href: `/property-type/${t.slug}`, label: t.label }))
            .concat([{ href: '/buy', label: 'Buy Property' }, { href: '/rent', label: 'Rent Property' }, { href: '/sell', label: 'Sell Property' }])}
        />
        <FooterCol className="lg:col-span-2" title="Top Cities" links={cities.map((c) => ({ href: `/city/${c.slug}`, label: c.name }))} />
        <FooterCol
          className="lg:col-span-2"
          title="Company"
          links={[
            { href: '/about', label: 'About Us' },
            { href: '/services', label: 'Services' },
            { href: '/developers', label: 'Developers' },
            { href: '/blog', label: 'Blog' },
            { href: '/home-loan', label: 'EMI & Home Loan' },
            { href: '/contact', label: 'Contact' },
          ]}
        />
        <FooterCol
          className="lg:col-span-2"
          title="Legal"
          links={[
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms-and-conditions', label: 'Terms & Conditions' },
            { href: '/disclaimer', label: 'Disclaimer' },
            { href: '/rera-disclaimer', label: 'RERA Disclaimer' },
            { href: '/cookie-policy', label: 'Cookie Policy' },
            { href: '/sitemap.xml', label: 'Sitemap' },
          ]}
        />
      </div>

      {/* SEO locality links */}
      <div className="container relative border-t border-white/10 py-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-light">Popular Localities</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ivory/50">
          {localities.map((l) => (
            <Link key={l.city + l.slug} href={`/city/${l.city}/${l.slug}`} className="hover:text-gold-light">
              Property in {l.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/50 md:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="text-center">Preview portal for demonstration. Not a RERA-registered agent. Verify every project on the respective RERA website.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className = '' }: { title: string; links: { href: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-light">{title}</p>
      <ul className="space-y-2.5 text-sm text-ivory/70">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition hover:text-gold-light">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
