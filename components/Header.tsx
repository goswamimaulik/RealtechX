'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Heart, Menu, Phone, X } from 'lucide-react';
import Logo from './Logo';
import { site, navTypes, statuses } from '@/lib/site';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { useShortlist } from './useShortlist';

type MenuCol = { title: string; links: { href: string; label: string }[] };
type NavItem = { label: string; href: string; cols?: MenuCol[] };

const nav: NavItem[] = [
  {
    label: 'Buy',
    href: '/buy',
    cols: [
      { title: 'Property Type', links: navTypes.map((t) => ({ href: `/properties?for=buy&type=${t.slug}`, label: t.label })) },
      { title: 'Top Cities', links: cities.map((c) => ({ href: `/properties?for=buy&city=${c.slug}`, label: `Property in ${c.name}` })) },
      { title: 'Project Status', links: statuses.map((s) => ({ href: `/status/${s.slug}`, label: s.label })) },
    ],
  },
  {
    label: 'Rent',
    href: '/rent',
    cols: [
      {
        title: 'For Rent',
        links: [
          { href: '/properties?for=rent&type=residential', label: 'Homes for Rent' },
          { href: '/properties?for=rent&type=commercial', label: 'Offices for Lease' },
          { href: '/properties?for=rent&type=villa', label: 'Villas for Rent' },
        ],
      },
      { title: 'Rent by City', links: cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: `Rent in ${c.name}` })) },
    ],
  },
  { label: 'Sell', href: '/sell' },
  {
    label: 'Projects',
    href: '/properties',
    cols: [
      { title: 'By Type', links: navTypes.map((t) => ({ href: `/property-type/${t.slug}`, label: `${t.label} Projects` })) },
      { title: 'By City', links: cities.map((c) => ({ href: `/city/${c.slug}`, label: `Projects in ${c.name}` })) },
      { title: 'By Developer', links: developers.slice(0, 6).map((d) => ({ href: `/developers/${d.slug}`, label: d.name })) },
    ],
  },
  { label: 'Developers', href: '/developers' },
  { label: 'Home Loan', href: '/home-loan' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Company',
    href: '/about',
    cols: [
      {
        title: 'RealtechX',
        links: [
          { href: '/about', label: 'About Us' },
          { href: '/services', label: 'Our Services' },
          { href: '/contact', label: 'Contact Us' },
          { href: '/shortlist', label: 'My Shortlist' },
        ],
      },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();
  const { items } = useShortlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'border-ink/5 bg-ivory/90 shadow-[0_8px_30px_-20px_rgba(11,16,32,.35)] backdrop-blur-xl' : 'border-transparent bg-ivory'
      }`}
    >
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
          {nav.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition hover:text-gold-dark ${
                  pathname === item.href ? 'text-gold-dark' : 'text-ink/85'
                }`}
              >
                {item.label}
                {item.cols && <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />}
              </Link>
              {item.cols && (
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div
                    className="grid gap-8 rounded-2xl border border-ink/5 bg-white p-7 shadow-luxe"
                    style={{ gridTemplateColumns: `repeat(${item.cols.length}, minmax(190px, 1fr))` }}
                  >
                    {item.cols.map((col) => (
                      <div key={col.title}>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-dark">{col.title}</p>
                        <ul className="space-y-2">
                          {col.links.map((l) => (
                            <li key={l.href}>
                              <Link href={l.href} className="text-sm text-ink/75 transition hover:pl-1 hover:text-ink">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shortlist" className="relative hidden h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white sm:grid" aria-label="Shortlist">
            <Heart className="h-[18px] w-[18px]" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                {items.length}
              </span>
            )}
          </Link>
          <a href={`tel:${site.phoneRaw}`} className="hidden items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold lg:flex">
            <Phone className="h-4 w-4 text-gold-dark" /> {site.phone}
          </a>
          <Link href="/sell" className="btn-gold hidden !px-5 !py-2.5 md:inline-flex">
            Post Property <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-gold-light">FREE</span>
          </Link>
          <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory xl:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 xl:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-ivory shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink/5 p-5">
            <Logo size={34} />
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {nav.map((item) => (
              <div key={item.label} className="border-b border-ink/5">
                {item.cols ? (
                  <>
                    <button
                      onClick={() => setOpenSection(openSection === item.label ? null : item.label)}
                      className="flex w-full items-center justify-between py-4 text-left text-base font-semibold"
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition ${openSection === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openSection === item.label && (
                      <div className="space-y-4 pb-4">
                        {item.cols.map((col) => (
                          <div key={col.title}>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">{col.title}</p>
                            <div className="grid grid-cols-1 gap-2">
                              {col.links.map((l) => (
                                <Link key={l.href} href={l.href} className="text-sm text-ink/75">
                                  {l.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} className="block py-4 text-base font-semibold">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-ink/5 p-5">
            <Link href="/sell" className="btn-gold w-full">Post Property Free</Link>
            <a href={`tel:${site.phoneRaw}`} className="btn-outline w-full">
              <Phone className="h-4 w-4" /> {site.phone}
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}
