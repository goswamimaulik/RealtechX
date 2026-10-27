'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Building2, ChevronDown, Heart, Home, KeyRound, Mail, Menu, MessageCircle, Phone, Plus, Tag, X,
} from 'lucide-react';
import Logo from './Logo';
import { navTypes, statuses, budgetBuy, site } from '@/lib/site';
import { cities } from '@/lib/data/cities';
import { developers } from '@/lib/data/developers';
import { allLocalities, properties } from '@/lib/data/properties';
import { useShortlist } from './useShortlist';
import { openLead } from './LeadModal';

type LinkT = { href: string; label: string; meta?: string };
type Col = { title: string; links: LinkT[] };
type NavItem = { label: string; href: string; cols?: Col[]; footer?: LinkT; small?: boolean };

const locs = allLocalities();
const count = (f: (p: (typeof properties)[number]) => boolean) => properties.filter(f).length;

const nav: NavItem[] = [
  {
    label: 'Buy',
    href: '/buy',
    cols: [
      { title: 'Property type', links: navTypes.map((t) => ({ href: `/properties?for=buy&type=${t.slug}`, label: t.label, meta: String(count((p) => p.type === t.slug && p.listingFor === 'buy')) })) },
      { title: 'Budget', links: budgetBuy.map((b) => ({ href: `/properties?for=buy&budget=${b.value}`, label: b.label })) },
      { title: 'Project status', links: statuses.map((s) => ({ href: `/status/${s.slug}`, label: s.label, meta: String(count((p) => p.status === s.slug)) })) },
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
      { title: 'Rent by city', links: cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: `Rent in ${c.name}` })) },
    ],
    footer: { href: '/rent', label: 'View all rentals' },
  },
  { label: 'Sell', href: '/sell' },
  {
    label: 'Developers',
    href: '/developers',
    cols: [{ title: 'Featured developers', links: developers.map((d) => ({ href: `/developers/${d.slug}`, label: d.name, meta: String(count((p) => p.developer === d.slug)) })) }],
    footer: { href: '/developers', label: `All ${developers.length} developers` },
  },
  {
    label: 'Localities',
    href: '/localities',
    cols: cities.map((c) => ({ title: c.name, links: locs.filter((l) => l.city === c.slug).map((l) => ({ href: `/city/${c.slug}/${l.slug}`, label: l.name })) })),
    footer: { href: '/localities', label: `All ${locs.length} localities` },
  },
  {
    label: 'Resources',
    href: '/blog',
    small: true,
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
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState<'closed' | 'open' | 'closing'>('closed');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const pathname = usePathname();
  const { items } = useShortlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeDrawer = () => {
    setDrawer('closing');
    window.setTimeout(() => setDrawer('closed'), 260);
  };

  useEffect(() => {
    setDrawer('closed');
    setHover(null);
  }, [pathname]);

  useEffect(() => {
    if (drawer === 'closed') return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawer]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0] + '/'));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background,box-shadow] duration-300 ${
        scrolled ? 'border-ink/5 bg-white/90 shadow-[0_12px_30px_-24px_rgba(11,16,32,.55)] backdrop-blur-xl' : 'border-ink/[0.06] bg-white'
      }`}
      onMouseLeave={() => setHover(null)}
    >
      <div className="container flex h-16 items-stretch justify-between gap-4 lg:h-[74px]">
        <div className="flex items-center"><Logo /></div>

        {/* ───── Desktop nav ───── */}
        <nav className="hidden items-stretch lg:flex" aria-label="Main">
          {nav.map((item) => {
            const open = hover === item.label;
            return (
              <div
                key={item.label}
                className={`flex items-center ${item.small ? 'relative' : ''}`}
                onMouseEnter={() => setHover(item.cols ? item.label : null)}
                onFocus={() => setHover(item.cols ? item.label : null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors xl:px-4 ${
                    open || isActive(item.href) ? 'bg-ivory text-ink' : 'text-ink/75 hover:bg-ivory hover:text-ink'
                  }`}
                  aria-expanded={item.cols ? open : undefined}
                >
                  {item.label}
                  {item.cols && <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />}
                </Link>

                {item.cols && (
                  <div
                    className={`absolute top-full z-50 transition-all duration-200 ${item.small ? 'right-0 w-60 pt-2' : 'inset-x-0'} ${
                      open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                    }`}
                  >
                    {item.small ? (
                      <div className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white p-2 shadow-luxe">
                        {item.cols[0].links.map((l) => (
                          <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-xl px-4 py-2.5 text-[14px] text-ink/80 transition hover:bg-ivory hover:text-ink">
                            {l.label} <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="border-t border-ink/[0.06] bg-white shadow-[0_30px_60px_-30px_rgba(11,16,32,.35)]">
                        <div className="container flex gap-10 py-8">
                          <div className={`grid flex-1 gap-x-10 gap-y-7 ${item.cols.length >= 6 ? 'grid-cols-6' : item.cols.length >= 4 ? 'grid-cols-4' : item.cols.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {item.cols.map((col) => (
                              <div key={col.title}>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">{col.title}</p>
                                <ul className={item.cols!.length === 1 ? 'grid grid-cols-3 gap-x-8 gap-y-1' : 'space-y-1'}>
                                  {col.links.map((l) => (
                                    <li key={l.href}>
                                      <Link href={l.href} className="group/l -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[14px] text-ink/75 transition hover:bg-ivory hover:text-ink">
                                        <span className="truncate">{l.label}</span>
                                        {l.meta && <span className="shrink-0 rounded-full bg-ivory-200 px-2 py-0.5 text-[11px] font-semibold text-muted group-hover/l:bg-white">{l.meta}</span>}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div className="flex w-64 shrink-0 flex-col justify-between rounded-2xl bg-ink p-6 text-ivory">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-light">Need help choosing?</p>
                              <p className="mt-2 font-display text-xl font-semibold leading-snug">Get a free shortlist from an advisor</p>
                            </div>
                            <div className="mt-6 space-y-3">
                              <button type="button" onClick={() => { setHover(null); openLead({ intent: 'Get Free Shortlist', source: `Mega menu (${item.label})` }); }} className="btn-gold w-full !py-2.5 text-[13px]">
                                Get my shortlist
                              </button>
                              {item.footer && (
                                <Link href={item.footer.href} className="flex items-center justify-center gap-2 text-[13px] font-semibold text-gold-light hover:text-white">
                                  {item.footer.label} <ArrowRight className="h-4 w-4" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shortlist" className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-gold hover:text-gold-dark lg:h-11 lg:w-11" aria-label={`Shortlist (${items.length})`}>
            <Heart className="h-[18px] w-[18px]" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">{items.length}</span>
            )}
          </Link>
          <Link href="/sell" className="btn-gold hidden !px-5 !py-2.5 sm:inline-flex">
            <Plus className="h-4 w-4" /> Post property
            <span className="rounded-md bg-ink px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-light">FREE</span>
          </Link>
          <button onClick={() => setDrawer('open')} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-ivory transition active:scale-95 lg:hidden" aria-label="Open menu" aria-expanded={drawer === 'open'}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ───── Mobile drawer (rendered only while open — nothing off-screen) ───── */}
      {drawer !== 'closed' && (
        <div className="fixed inset-0 z-[55] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className={`absolute inset-0 bg-ink/60 backdrop-blur-[2px] ${drawer === 'open' ? 'animate-fadeIn' : 'animate-fadeOut'}`} onClick={closeDrawer} />
          <aside className={`absolute inset-y-0 right-0 flex w-[88%] max-w-[400px] flex-col overflow-hidden bg-white shadow-2xl ${drawer === 'open' ? 'animate-slideInRight' : 'animate-slideOutRight'}`}>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/[0.06] px-5">
              <Logo />
              <button onClick={closeDrawer} className="grid h-10 w-10 place-items-center rounded-full bg-ivory transition active:scale-95" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <div className="grid grid-cols-2 gap-2 p-4">
                {[
                  { href: '/buy', label: 'Buy', Icon: Home },
                  { href: '/rent', label: 'Rent', Icon: KeyRound },
                  { href: '/sell', label: 'Sell', Icon: Tag },
                  { href: '/developers', label: 'Developers', Icon: Building2 },
                ].map(({ href, label, Icon }) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl border p-3 transition active:scale-[.98] ${isActive(href) ? 'border-gold/50 bg-gold-50' : 'border-ink/[0.06] bg-ivory/70'}`}>
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink"><Icon className="h-4 w-4 text-gold-light" /></span>
                    <span className="text-[14px] font-semibold">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="px-4">
                {nav.filter((n) => n.cols).map((item) => {
                  const open = openSection === item.label;
                  return (
                    <div key={item.label} className="border-b border-ink/[0.06]">
                      <button onClick={() => setOpenSection(open ? null : item.label)} className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold" aria-expanded={open}>
                        {item.label === 'Buy' ? 'Buy property' : item.label === 'Rent' ? 'Rent property' : item.label}
                        <span className={`grid h-7 w-7 place-items-center rounded-full transition ${open ? 'rotate-180 bg-gold-50 text-gold-dark' : 'bg-ivory'}`}>
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </button>
                      {open && (
                        <div className="animate-fadeIn space-y-4 pb-5">
                          {item.cols!.map((col) => (
                            <div key={col.title}>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-dark">{col.title}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {col.links.map((l) => (
                                  <Link key={l.href} href={l.href} className="max-w-full truncate rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[13px] text-ink/80 active:bg-ivory">
                                    {l.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                          {item.footer && (
                            <Link href={item.footer.href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-dark">
                              {item.footer.label} <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <Link href="/shortlist" className="flex items-center justify-between border-b border-ink/[0.06] py-4 text-[15px] font-semibold">
                  My shortlist <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-xs font-semibold text-gold-dark">{items.length}</span>
                </Link>
              </div>

              <div className="space-y-2 p-4 text-[13px] text-ink/70">
                <a href={`tel:${site.phoneRaw}`} className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold-dark" />{site.phone}</a>
                <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-gold-dark" />WhatsApp us</a>
                <a href={`mailto:${site.email}`} className="flex min-w-0 items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-gold-dark" /><span className="truncate">{site.email}</span></a>
              </div>
            </div>

            <div className="shrink-0 border-t border-ink/[0.06] p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <Link href="/sell" className="btn-gold w-full !py-3.5">
                <Plus className="h-4 w-4" /> Post property — free
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
