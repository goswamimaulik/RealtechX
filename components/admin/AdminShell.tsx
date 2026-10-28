'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Activity, Building, Building2, ChevronDown, ExternalLink, FileText, FolderTree, Gauge, Image as ImageIcon, Inbox, KeyRound, LogOut, MapPinned, Menu, Newspaper, Plus, Search, Settings, ShieldCheck, Users, X, Home,
} from 'lucide-react';
import { AdminProviders } from './ui';
import { api } from './api';
import type { Perm } from '@/lib/auth/permissions';
import { roleLabels } from '@/lib/auth/permissions';
import type { Role } from '@/lib/types';

export interface ShellUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

type Item = { href: string; label: string; icon: React.ElementType; perm: Perm; exact?: boolean };
const groups: { title: string; items: Item[] }[] = [
  { title: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: Gauge, perm: 'dashboard', exact: true }] },
  {
    title: 'Listings',
    items: [
      { href: '/admin/properties', label: 'Properties', icon: Home, perm: 'properties' },
      { href: '/admin/projects', label: 'Projects', icon: Building2, perm: 'properties' },
      { href: '/admin/developers', label: 'Builders / Developers', icon: Building, perm: 'developers' },
    ],
  },
  { title: 'CRM', items: [{ href: '/admin/leads', label: 'Leads & Enquiries', icon: Inbox, perm: 'leads' }] },
  {
    title: 'Catalogue',
    items: [
      { href: '/admin/locations', label: 'Locations', icon: MapPinned, perm: 'locations' },
      { href: '/admin/taxonomy', label: 'Categories & Types', icon: FolderTree, perm: 'taxonomy' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/content', label: 'Pages & Content', icon: FileText, perm: 'content' },
      { href: '/admin/blogs', label: 'Blogs', icon: Newspaper, perm: 'blogs' },
      { href: '/admin/media', label: 'Media Library', icon: ImageIcon, perm: 'media' },
      { href: '/admin/seo', label: 'SEO Management', icon: Search, perm: 'seo' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings, perm: 'settings' },
      { href: '/admin/users', label: 'Admin Users & Roles', icon: Users, perm: 'users' },
      { href: '/admin/activity', label: 'Activity Log', icon: Activity, perm: 'activity' },
    ],
  },
];

export default function AdminShell({ user, perms, siteName, database, children }: { user: ShellUser; perms: Perm[]; siteName: string; database: 'mongo' | 'memory'; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
  }, [drawer]);

  const active = (it: Item) => (it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + '/'));
  const visible = groups.map((g) => ({ ...g, items: g.items.filter((i) => perms.includes(i.perm)) })).filter((g) => g.items.length);
  const initials = user.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  const logout = async () => {
    await api('auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/admin/login';
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="font-display text-[24px] font-semibold leading-none tracking-[-0.03em] text-ivory">
            {siteName.slice(0, -1)}
            <span className="gold-text font-bold">{siteName.slice(-1)}</span>
          </span>
          <span className="rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-gold-light">Admin</span>
        </Link>
        <button className="grid h-9 w-9 place-items-center rounded-xl text-ivory/70 hover:bg-white/10 lg:hidden" onClick={() => setDrawer(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {visible.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-ivory/35">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const on = active(it);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${on ? 'bg-white/[0.07] text-gold-light' : 'text-ivory/65 hover:bg-white/[0.04] hover:text-ivory'}`}
                    >
                      {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold-grad" />}
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${on ? 'text-gold' : 'text-ivory/45 group-hover:text-ivory/80'}`} />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="shrink-0 space-y-2 border-t border-white/[0.06] p-3">
        {database === 'memory' && (
          <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11.5px] leading-snug text-amber-200">
            Demo mode — changes are not saved permanently. Connect MongoDB to go live.
          </p>
        )}
        <a href="/" target="_blank" rel="noopener" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-ivory/65 hover:bg-white/[0.04] hover:text-ivory">
          View website <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </nav>
  );

  return (
    <AdminProviders>
      <div className="min-h-dvh bg-[#F6F3EC]">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] bg-ink-grad lg:block">{nav}</aside>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <div className="absolute inset-0 animate-fadeIn bg-ink/60" onClick={() => setDrawer(false)} />
            <aside className="absolute inset-y-0 left-0 w-[86%] max-w-[300px] animate-slideInLeft bg-ink-grad shadow-2xl">{nav}</aside>
          </div>
        )}

        <div className="lg:pl-[264px]">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-[#F6F3EC]/85 backdrop-blur-md">
            <div className="flex h-[60px] items-center gap-3 px-4 md:h-[68px] md:px-8">
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
              <Link href="/admin" className="font-display text-[21px] font-semibold lg:hidden">
                {siteName.slice(0, -1)}<span className="gold-text font-bold">{siteName.slice(-1)}</span>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                {perms.includes('properties') && (
                  <Link href="/admin/properties/new" className="a-btn a-btn-ink hidden sm:inline-flex"><Plus className="h-4 w-4" /> Add property</Link>
                )}
                {perms.includes('leads') && (
                  <Link href="/admin/leads" className="a-btn a-btn-ghost hidden md:inline-flex"><Inbox className="h-4 w-4" /> Leads</Link>
                )}
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white py-1 pl-1 pr-2 transition hover:border-gold/50" aria-haspopup="menu" aria-expanded={menu}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[12px] font-bold text-gold-light">{initials}</span>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block max-w-[140px] truncate text-[12.5px] font-semibold">{user.name}</span>
                      <span className="block text-[10.5px] text-ink/50">{roleLabels[user.role]}</span>
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-ink/40" />
                  </button>
                  {menu && (
                    <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-zoomIn overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-luxe">
                      <div className="border-b border-ink/[0.06] px-4 py-3">
                        <p className="truncate text-[13.5px] font-semibold">{user.name}</p>
                        <p className="truncate text-[12px] text-ink/50">{user.email}</p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10.5px] font-semibold text-gold-dark"><ShieldCheck className="h-3 w-3" />{roleLabels[user.role]}</span>
                      </div>
                      <Link href="/admin/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-ivory"><KeyRound className="h-4 w-4 text-ink/50" /> Profile & password</Link>
                      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-ivory"><ExternalLink className="h-4 w-4 text-ink/50" /> View website</a>
                      <button onClick={logout} className="flex w-full items-center gap-2.5 border-t border-ink/[0.06] px-4 py-2.5 text-left text-[13px] text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Log out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8 md:pt-8">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
