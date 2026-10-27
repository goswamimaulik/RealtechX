import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Logo from './Logo';
import { site, navTypes } from '@/lib/site';
import { cities } from '@/lib/data/cities';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl" />

      <div className="container relative grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 lg:grid-cols-12 lg:py-16">
        <div className="col-span-2 md:col-span-4 lg:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">{site.description}</p>
          <ul className="mt-6 space-y-3 text-sm text-ivory/80">
            <li><a href={`tel:${site.phoneRaw}`} className="flex items-center gap-3 hover:text-gold-light"><Phone className="h-4 w-4 text-gold" />{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="flex items-center gap-3 break-all hover:text-gold-light"><Mail className="h-4 w-4 shrink-0 text-gold" />{site.email}</a></li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" />{site.address}</li>
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
          title="Explore"
          links={[
            { href: '/buy', label: 'Buy property' },
            { href: '/rent', label: 'Rent property' },
            { href: '/sell', label: 'Sell / Post property' },
            ...navTypes.map((t) => ({ href: `/property-type/${t.slug}`, label: t.label })),
          ]}
        />
        <FooterCol className="lg:col-span-2" title="Cities" links={cities.map((c) => ({ href: `/city/${c.slug}`, label: `Property in ${c.name}` }))} />
        <FooterCol
          className="lg:col-span-2"
          title="Company"
          links={[
            { href: '/about', label: 'About us' },
            { href: '/developers', label: 'Developers' },
            { href: '/localities', label: 'Localities' },
            { href: '/blog', label: 'Blog & guides' },
            { href: '/home-loan', label: 'EMI & home loan' },
            { href: '/contact', label: 'Contact' },
          ]}
        />
        <FooterCol
          className="lg:col-span-2"
          title="Legal"
          links={[
            { href: '/privacy-policy', label: 'Privacy policy' },
            { href: '/terms-and-conditions', label: 'Terms & conditions' },
            { href: '/disclaimer', label: 'Disclaimer' },
            { href: '/rera-disclaimer', label: 'RERA disclaimer' },
            { href: '/cookie-policy', label: 'Cookie policy' },
            { href: '/sitemap.xml', label: 'Sitemap' },
          ]}
        />
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-center text-[11px] text-ivory/50 md:flex-row md:text-left md:text-xs">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Preview portal for demonstration · Not a RERA-registered agent · Verify every project on the state RERA website.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className = '' }: { title: string; links: { href: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-light">{title}</p>
      <ul className="space-y-2.5 text-[13.5px] text-ivory/70">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition hover:text-gold-light">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
