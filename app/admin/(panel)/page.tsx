'use client';

import Link from 'next/link';
import { ArrowUpRight, Building2, CalendarClock, Eye, FileEdit, Home, Inbox, MapPinned, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Badge, Card, ErrorBox, Loading, PageHeader, leadTone, publishTone, useApi } from '@/components/admin/ui';
import { MonthlyBars, MonthlyLine, SplitBars } from '@/components/admin/charts';
import { inr, when } from '@/components/admin/api';
import { thumb } from '@/components/admin/media';

type P = { _id: string; id: string; slug: string; title: string; image: string; city: string; locality: string; views: number; publish: string; kind: string; type: string; priceMin: number; priceMax: number; listingFor: string; at: string; publishedAt?: string };
type D = {
  user: { name: string };
  show: { properties: boolean; leads: boolean };
  totals: Record<string, number>;
  leadStatus: { status: string; count: number }[];
  sources: { source: string; count: number }[];
  monthly: { month: string; leads: number; views: number }[];
  recentLeads: { _id: string; leadId: string; name: string; phone: string; property: string; source: string; status: string; createdAt: string }[];
  recentProperties: P[];
  mostViewed: P[];
  latestProjects: P[];
};

const statusColor: Record<string, string> = { new: '#0EA5E9', contacted: '#F59E0B', qualified: '#8B5CF6', closed: '#10B981', lost: '#F43F5E' };
const srcColors = ['#0B1020', '#C9A45C', '#24304F', '#E7D3A4', '#6B7280', '#A8843F'];

function greeting() {
  const h = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Stat({ icon: Icon, label, value, sub, href, accent = false }: { icon: React.ElementType; label: string; value: number | string; sub?: React.ReactNode; href?: string; accent?: boolean }) {
  const body = (
    <div className={`group relative h-full overflow-hidden rounded-2xl border p-5 transition ${accent ? 'border-transparent bg-ink text-ivory' : 'a-card hover:-translate-y-0.5 hover:shadow-luxe'}`}>
      {accent && <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/25 blur-2xl" />}
      <div className="relative flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? 'bg-gold/15 text-gold-light' : 'bg-gold-50 text-gold-dark ring-1 ring-gold/20'}`}><Icon className="h-[18px] w-[18px]" /></span>
        {href && <ArrowUpRight className={`h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${accent ? 'text-ivory/40' : 'text-ink/30'}`} />}
      </div>
      <p className={`relative mt-4 font-display text-[36px] font-semibold leading-none ${accent ? 'text-gold-light' : ''}`}>{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      <p className={`relative mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.1em] ${accent ? 'text-ivory/60' : 'text-ink/50'}`}>{label}</p>
      {sub && <div className={`relative mt-3 border-t pt-3 text-[12px] ${accent ? 'border-white/10 text-ivory/60' : 'border-ink/[0.06] text-ink/55'}`}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

function PropRow({ p, right }: { p: P; right: React.ReactNode }) {
  return (
    <Link href={`/admin/properties/${p._id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-ivory">
      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ivory-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.image && <img src={thumb(p.image, 160)} alt="" className="h-full w-full object-cover" loading="lazy" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold">{p.title}</span>
        <span className="block truncate text-[12px] text-ink/50">{p.locality} · {inr(p.priceMin)}{p.listingFor === 'rent' && p.priceMin ? '/mo' : ''}</span>
      </span>
      <span className="shrink-0 text-right">{right}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useApi<D>('dashboard');
  if (error) return <ErrorBox error={error} retry={reload} />;
  if (loading || !data)
    return (
      <div>
        <div className="mb-8 h-16 w-72 animate-pulse rounded-xl bg-ink/5" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink/5" />)}</div>
        <div className="mt-6"><Loading rows={4} /></div>
      </div>
    );

  const t = data.totals;
  const { show } = data;
  return (
    <div>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })}
        title={<>{greeting()}, <span className="italic text-gold-dark">{data.user.name.split(' ')[0]}</span></>}
        subtitle="Here’s how your portal is performing."
        actions={
          <>
            {show.properties && <Link href="/admin/properties/new" className="a-btn a-btn-gold shine"><Plus className="h-4 w-4" /> Add property</Link>}
            {show.properties && <Link href="/admin/properties/new?kind=project" className="a-btn a-btn-ink"><Building2 className="h-4 w-4" /> Add project</Link>}
            {show.leads && <Link href="/admin/leads" className="a-btn a-btn-ghost"><Inbox className="h-4 w-4" /> View leads</Link>}
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat
          accent
          icon={Home}
          label="Total properties"
          value={t.properties}
          href={show.properties ? '/admin/properties?kind=' : undefined}
          sub={<span className="flex flex-wrap gap-x-3 gap-y-1"><span><b className="text-ivory">{t.published}</b> published</span><span><b className="text-ivory">{t.draft}</b> draft</span><span><b className="text-ivory">{t.pending}</b> pending</span></span>}
        />
        {show.leads ? (
          <Stat icon={Inbox} label="Total enquiries" value={t.leads} href="/admin/leads" sub={<span><b className="text-ink">{t.leadsToday}</b> today · <b className="text-ink">{t.leadsMonth}</b> this month · <b className="text-sky-700">{t.newLeads}</b> new</span>} />
        ) : (
          <Stat icon={Building2} label="Projects" value={t.projects} href={show.properties ? '/admin/projects' : undefined} sub={<span>{t.featured} featured</span>} />
        )}
        <Stat icon={Eye} label="Property views" value={t.views} sub={<span>Counted once per visitor session</span>} />
        <Stat icon={MapPinned} label="Locations" value={t.cities} href={show.properties ? '/admin/locations' : undefined} sub={<span><b className="text-ink">{t.localities}</b> localities · <b className="text-ink">{t.developers}</b> developers</span>} />
      </div>

      {show.leads && t.followUpsDue > 0 && (
        <Link href="/admin/leads?followup=due" className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900 transition hover:bg-amber-100">
          <CalendarClock className="h-5 w-5 shrink-0" />
          <span className="flex-1"><b>{t.followUpsDue}</b> follow-up{t.followUpsDue === 1 ? ' is' : 's are'} due today or overdue.</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {show.leads && (
          <Card title="Monthly leads" action={<span className="text-[12px] text-ink/45">Last 12 months</span>}>
            <MonthlyBars label="Leads per month" data={data.monthly.map((m) => ({ month: m.month, value: m.leads }))} />
          </Card>
        )}
        <Card title="Monthly property views" action={<span className="text-[12px] text-ink/45">Last 12 months</span>} className={show.leads ? '' : 'lg:col-span-2'}>
          <MonthlyLine label="Property views per month" data={data.monthly.map((m) => ({ month: m.month, value: m.views }))} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {show.leads && (
          <Card
            title="Recent enquiries"
            className="xl:col-span-2"
            pad={false}
            action={<Link href="/admin/leads" className="text-[12.5px] font-semibold text-gold-dark hover:underline">All leads →</Link>}
          >
            {data.recentLeads.length ? (
              <ul className="divide-y divide-ink/[0.05]">
                {data.recentLeads.map((l) => (
                  <li key={l._id}>
                    <Link href={`/admin/leads?open=${encodeURIComponent(l._id)}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-ivory/60">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ivory-200 text-[13px] font-bold text-ink/70">{l.name.slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><span className="truncate text-[13.5px] font-semibold">{l.name}</span><span className="hidden text-[11.5px] text-ink/40 sm:inline">{l.leadId}</span></span>
                        <span className="block truncate text-[12px] text-ink/50">{l.property || l.source}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <Badge tone={leadTone(l.status)}>{l.status}</Badge>
                        <span className="text-[11px] text-ink/40">{when(l.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-[13.5px] text-ink/50">No enquiries yet — they’ll appear here as soon as a visitor submits a form.</p>
            )}
          </Card>
        )}
        {show.leads && (
          <Card title="Lead status">
            <SplitBars rows={data.leadStatus.map((s) => ({ label: s.status, value: s.count, color: statusColor[s.status] }))} />
            {data.sources.length > 0 && (
              <div className="mt-6 border-t border-ink/[0.06] pt-5">
                <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink/50">Top sources</p>
                <SplitBars rows={data.sources.map((s, i) => ({ label: s.source, value: s.count, color: srcColors[i % srcColors.length] }))} />
              </div>
            )}
          </Card>
        )}
      </div>

      {show.properties && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Recently added" pad={false} action={<FileEdit className="h-4 w-4 text-ink/30" />}>
            <div className="p-2">{data.recentProperties.map((p) => <PropRow key={p._id} p={p} right={<Badge tone={publishTone(p.publish)}>{p.publish}</Badge>} />)}</div>
          </Card>
          <Card title="Most viewed" pad={false} action={<TrendingUp className="h-4 w-4 text-ink/30" />}>
            <div className="p-2">{data.mostViewed.map((p) => <PropRow key={p._id} p={p} right={<span className="flex items-center gap-1 text-[12.5px] font-semibold tabular-nums"><Eye className="h-3.5 w-3.5 text-ink/40" />{p.views.toLocaleString('en-IN')}</span>} />)}</div>
          </Card>
          <Card title="Latest published projects" pad={false} action={<Sparkles className="h-4 w-4 text-gold" />}>
            <div className="p-2">{data.latestProjects.map((p) => <PropRow key={p._id} p={p} right={<span className="text-[11.5px] text-ink/45">{when(p.publishedAt || p.at)}</span>} />)}</div>
          </Card>
        </div>
      )}

      {show.properties && (
        <Card title="Status summary" className="mt-4">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <SplitBars rows={[{ label: 'published', value: t.published, color: '#10B981' }, { label: 'draft', value: t.draft, color: '#9CA3AF' }, { label: 'pending review', value: t.pending, color: '#F59E0B' }]} />
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { k: 'Projects', v: t.projects, href: '/admin/projects' },
                { k: 'Featured', v: t.featured, href: '/admin/properties?featured=1&kind=' },
                { k: 'Blog posts', v: t.blogs, href: '/admin/blogs' },
              ].map((x) => (
                <Link key={x.k} href={x.href} className="rounded-xl border border-ink/[0.07] bg-ivory/50 p-3 transition hover:border-gold/50">
                  <p className="font-display text-[28px] font-semibold">{x.v}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/50">{x.k}</p>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
