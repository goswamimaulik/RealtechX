'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Menu, Plus, X } from 'lucide-react';
import Logo from './Logo';
import { navTypes, statuses, budgetBuy } from '@/lib/site';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { allLocalities } from '@/lib/data/properties';
import { useShortlist } from './useShortlist';

type MenuCol = { title: string; links: { href: string; label: string }[] };
type NavItem = { label: string; href: string; cols?: MenuCol[]; footer?: { href: string; label: string } };

const locs = allLocalities();

const nav: NavItem[] = [
  {
    label: 'Buy',
    href: '/buy',
    cols: [
      { title: 'Property type', links: navTypes.map((t) => ({ href: `/properties?for=buy&type=${t.slug}`, label: t.label })) },
      { title: 'Budget', links: budgetBuy.map((b) => ({ href: `/properties?for=buy&budget=${b.value}`, label: b.label })) },
      { title: 'Project status', links: statuses.map((s) => ({ href: `/status/${s.slug}`, label: s.label })) },
      { title: 'Top cities', links: cities.map((c) => ({ href: `/properties?for=buy&city=${c.slug}`, label: c.name })) },
    ],
    footer: { href: '/buy', label: 'View all properties for sale' },
  },
  {
    label: 'Rent',
    href: '/rent',
    cols: [
      {
        title: 'For rent',
        links: [
          { href: '/properties?for=rent&type=residential', label: 'Homes for rent' },
          { href: '/properties?for=rent&type=villa', label: 'Villas for rent' },
          { href: '/properties?for=rent&type=commercial', label: 'Offices for lease' },
        ],
      },
      { title: 'Rent by city', links: cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: c.name })) },
    ],
    footer: { href: '/rent', label: 'View all rentals' },
  },
  { label: 'Sell', href: '/sell' },
  {
    label: 'Developers',
    href: '/developers',
    cols: [{ title: 'Featured developers', links: developers.map((d) => ({ href: `/developers/${d.slug}`, label: d.name })) }],
    footer: { href: '/developers', label: `All ${developers.length} developers` },
  },
  {
    label: 'Localities',
    href: '/localities',
    cols: cities.map((c) => ({
      title: c.name,
      links: locs.filter((l) => l.city === c.slug).map((l) => ({ href: `/city/${c.slug}/${l.slug}`, label: l.name })),
    })),
    footer: { href: '/localities', label: `All ${locs.length} localities` },
  },
  {
    label: 'Resources',
    href: '/blog',
    cols: [
      {
        title: 'Resources',
        links: [
          { href: '/blog', label: 'Blog & guides' },
          { href: '/home-loan#emi-calculator', label: 'EMI calculator' },
          { href: '/home-loan', label: 'Home loan guide' },
          { href: '/about', label: 'About RealtechX' },
          { href: '/contact', label: 'Contact us' },
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

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'border-ink/5 bg-white/90 shadow-[0_10px_30px_-22px_rgba(11,16,32,.45)] backdrop-blur-xl' : 'border-ink/5 bg-white'
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-[76px]">
        <Logo />

        <nav className="hidden items-center lg:flex" aria-label="Main">
          {nav.map((item, idx) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className={`flex items-center gap-1 px-3 py-2 text-[14px] font-semibold transition hover:text-gold-dark xl:px-4 ${isActive(item.href) ? 'text-gold-dark' : 'text-ink/85'}`}
              >
                {item.label}
                {item.cols && <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180" />}
              </Link>
              {item.cols && (
                <div className={`invisible absolute top-full z-50 pt-3 opacity-0 ${idx >= nav.length - 2 ? 'right-0' : idx === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'} transition-all duration-200 group-hover:visible group-hover:opacity-100`}>
                  <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-luxe">
                    <div
                      className="grid gap-x-8 gap-y-6 p-7"
                      style={{ gridTemplateColumns: `repeat(${Math.min(item.cols.length, 4)}, minmax(170px, 1fr))` }}
                    >
                      {item.cols.map((col) => (
                        <div key={col.title}>
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-dark">{col.title}</p>
                          <ul className="space-y-2">
                            {col.links.map((l) => (
                              <li key={l.href}>
                                <Link href={l.href} className="block whitespace-nowrap text-[13.5px] text-ink/75 transition hover:translate-x-0.5 hover:text-ink">
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {item.footer && (
                      <Link href={item.footer.href} className="flex items-center justify-between bg-ivory px-7 py-3.5 text-[13px] font-bold text-ink hover:text-gold-dark">
                        {item.footer.label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shortlist" className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-gold md:h-11 md:w-11" aria-label="Shortlist">
            <Heart className="h-[18px] w-[18px]" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">{items.length}</span>
            )}
          </Link>
          <Link href="/sell" className="btn-gold hidden !px-5 !py-2.5 sm:inline-flex">
            <Plus className="h-4 w-4" /> Post Property <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-gold-light">FREE</span>
          </Link>
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-ivory md:h-11 md:w-11 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <aside className={`absolute right-0 top-0 flex h-[100dvh] w-[86%] max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between border-b border-ink/5 px-5">
            <Logo />
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-ivory" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2">
            {nav.map((item) => (
              <div key={item.label} className="border-b border-ink/5">
                {item.cols ? (
                  <>
                    <button
                      onClick={() => setOpenSection(openSection === item.label ? null : item.label)}
                      className="flex w-full items-center justify-between py-4 text-left text-[15px] font-bold"
                      aria-expanded={openSection === item.label}
                    >
                      {item.label}
                      <span className={`grid h-7 w-7 place-items-center rounded-full bg-ivory transition ${openSection === item.label ? 'rotate-180 bg-gold-50' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ${openSection === item.label ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]'}`}>
                      <div className="space-y-4 overflow-hidden">
                        {item.cols.map((col) => (
                          <div key={col.title}>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">{col.title}</p>
                            <div className="flex flex-wrap gap-2">
                              {col.links.map((l) => (
                                <Link key={l.href} href={l.href} className="rounded-full border border-ink/10 px-3 py-1.5 text-[13px] text-ink/80">
                                  {l.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                        {item.footer && (
                          <Link href={item.footer.href} className="flex items-center gap-1 text-[13px] font-bold text-gold-dark">
                            {item.footer.label} <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className="block py-4 text-[15px] font-bold">{item.label}</Link>
                )}
              </div>
            ))}
            <Link href="/shortlist" className="flex items-center justify-between border-b border-ink/5 py-4 text-[15px] font-bold">
              My shortlist <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-xs text-gold-dark">{items.length}</span>
            </Link>
          </div>

          <div className="border-t border-ink/5 p-5">
            <Link href="/sell" className="btn-gold w-full !py-3.5">
              <Plus className="h-4 w-4" /> Post Property — Free
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
