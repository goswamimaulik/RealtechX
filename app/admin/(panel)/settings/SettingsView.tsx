'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Cloud, Database, DownloadCloud, Globe, Image as ImageIcon, KeyRound, Mail, Phone, Search, Settings2, Share2, ShieldCheck, Upload, XCircle, Cookie } from 'lucide-react';
import { api, download } from '@/components/admin/api';
import { Badge, Card, ErrorBox, Field, Loading, PageHeader, SaveButton, Toggle, useAdmin, useApi, useUnsaved } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';

type State = {
  settings: any;
  smtp: { host: string; port: number; user: string; from: string; hasPass: boolean; fromEnv: boolean; active: boolean; activeUser: string };
  cloudinary: { cloudName: string; apiKey: string; hasSecret: boolean; fromEnv: boolean; active: boolean; activeCloud: string };
  env: { database: 'mongo' | 'memory'; authSecret: boolean; adminEmail: boolean };
};

const tabs = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'contact', label: 'Contact & CTA', icon: Phone },
  { id: 'social', label: 'Social links', icon: Share2 },
  { id: 'email', label: 'Notifications & email', icon: Mail },
  { id: 'integrations', label: 'Analytics & maps', icon: Globe },
  { id: 'media', label: 'Media & uploads', icon: ImageIcon },
  { id: 'seo', label: 'SEO defaults', icon: Search },
  { id: 'privacy', label: 'Privacy & cookies', icon: Cookie },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'backup', label: 'Backup & restore', icon: Database },
] as const;
type Tab = (typeof tabs)[number]['id'];

const Status = ({ ok, on, off }: { ok: boolean; on: string; off: string }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${ok ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>
    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {ok ? on : off}
  </span>
);

const SCtx = createContext<{ s: any; set: (k: string, v: any) => void }>({ s: {}, set: () => {} });

/** Text input bound to a settings path (stable component — keeps focus while typing). */
function I({ k, label, hint, placeholder, type = 'text' }: { k: string; label: string; hint?: string; placeholder?: string; type?: string }) {
  const { s, set } = useContext(SCtx);
  const [a, b] = k.split('.');
  const v = b ? s[a]?.[b] : s[a];
  return (
    <Field label={label} hint={hint}>
      <input className="a-input" type={type} value={v ?? ''} placeholder={placeholder} onChange={(e) => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} />
    </Field>
  );
}

export default function SettingsView() {
  const sp = useSearchParams();
  const { toast, confirm } = useAdmin();
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'general');
  const { data, error, reload } = useApi<State>('settings');
  const [s, setS] = useState<any>(null);
  const [smtp, setSmtp] = useState<any>({});
  const [cloud, setCloud] = useState<any>({});
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState('');
  const loaded = useRef(false);

  const hydrate = (d: State) => {
    setS(d.settings);
    setSmtp({ host: d.smtp.host, port: d.smtp.port, user: d.smtp.user, from: d.smtp.from, pass: '' });
    setCloud({ cloudName: d.cloudinary.cloudName, apiKey: d.cloudinary.apiKey, apiSecret: '' });
    setSaved(JSON.stringify([d.settings, { host: d.smtp.host, port: d.smtp.port, user: d.smtp.user, from: d.smtp.from, pass: '' }, { cloudName: d.cloudinary.cloudName, apiKey: d.cloudinary.apiKey, apiSecret: '' }]));
  };
  useEffect(() => {
    if (data && !loaded.current) {
      loaded.current = true;
      hydrate(data);
    }
  }, [data]);

  const dirty = !!s && JSON.stringify([s, smtp, cloud]) !== saved;
  useUnsaved(dirty);
  const set = (path: string, v: any) =>
    setS((p: any) => {
      const [a, b] = path.split('.');
      return b ? { ...p, [a]: { ...p[a], [b]: v } } : { ...p, [a]: v };
    });

  const save = async () => {
    setBusy(true);
    try {
      const r = await api<State>('settings', { method: 'PUT', body: { settings: s, smtp, cloudinary: cloud } });
      hydrate(r);
      toast('Settings saved');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };

  const testEmail = async () => {
    if (dirty) await save();
    try {
      const r = await api<{ message: string }>('settings', { body: { action: 'test-email', to: testTo } });
      toast(r.message);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  if (error) return <ErrorBox error={error} retry={reload} />;
  if (!s || !data) return <Loading rows={8} />;

  return (
    <SCtx.Provider value={{ s, set }}>
    <div>
      <PageHeader eyebrow="System" title="Settings" subtitle="Site identity, contact details, notifications, integrations and security." actions={<SaveButton busy={busy} onClick={save}>{dirty ? 'Save settings' : 'Saved'}</SaveButton>} />
      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-0.5 lg:px-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition lg:w-full ${tab === t.id ? 'bg-white text-ink shadow-card' : 'text-ink/55 hover:text-ink'}`}>
              <t.icon className={`h-4 w-4 ${tab === t.id ? 'text-gold-dark' : ''}`} /> {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          {tab === 'general' && (
            <Card title="Site identity">
              <div className="grid gap-4 sm:grid-cols-2">
                <I k="name" label="Site name" hint="Used in titles, emails and the text logo (last letter in gold)." />
                <I k="tagline" label="Tagline" />
                <div className="sm:col-span-2"><Field label="Short description" hint="Default meta description and footer fallback."><textarea className="a-input min-h-[80px]" value={s.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field></div>
                <I k="url" label="Website address" hint="Your live domain, e.g. https://www.realtechx.in — used for the sitemap & emails." />
                <Field label="Currency"><input className="a-input" value="INR (₹)" disabled /></Field>
                <Field label="Logo" hint="Optional. Without a logo the elegant text wordmark is used."><ImageField value={s.logoUrl ?? ''} onChange={(v) => set('logoUrl', v)} folder="logos" aspect="aspect-[3/1] max-w-xs" contain /></Field>
                <Field label="Favicon" hint="Square PNG/SVG, at least 64×64."><ImageField value={s.faviconUrl ?? ''} onChange={(v) => set('faviconUrl', v)} folder="logos" aspect="aspect-square max-w-[110px]" contain /></Field>
              </div>
            </Card>
          )}

          {tab === 'contact' && (
            <>
              <Card title="Contact details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <I k="phone" label="Phone number" placeholder="+91 97730 69318" hint="Shown on the website and used for all “Call” buttons." />
                  <I k="whatsapp" label="WhatsApp number" placeholder="919773069318" hint="Digits only, with country code." />
                  <I k="email" label="Email" type="email" />
                  <div className="sm:col-span-2"><I k="address" label="Office address" /></div>
                  <I k="hours" label="Working hours" placeholder="Mon–Sat, 10 am – 7 pm" />
                  <I k="enquiryCta" label="Main enquiry button text" placeholder="Get Best Price" />
                </div>
              </Card>
              <Card title="Preview notice bar">
                <div className="grid gap-4">
                  <Toggle checked={!!s.showPreviewBar} onChange={(v) => set('showPreviewBar', v)} label="Show the notice bar above the header" hint="Useful while the portal is a demo / preview." />
                  <I k="previewNotice" label="Notice (desktop)" />
                  <I k="previewNoticeShort" label="Notice (mobile)" />
                </div>
              </Card>
            </>
          )}

          {tab === 'social' && (
            <Card title="Social media">
              <div className="grid gap-4 sm:grid-cols-2">
                <I k="social.instagram" label="Instagram" placeholder="https://instagram.com/…" />
                <I k="social.facebook" label="Facebook" placeholder="https://facebook.com/…" />
                <I k="social.linkedin" label="LinkedIn" placeholder="https://linkedin.com/company/…" />
                <I k="social.youtube" label="YouTube" placeholder="https://youtube.com/@…" />
                <I k="social.twitter" label="X / Twitter" placeholder="https://x.com/…" />
              </div>
              <p className="mt-4 text-[12.5px] text-ink/50">Empty links are hidden from the footer.</p>
            </Card>
          )}

          {tab === 'email' && (
            <>
              <Card title="Lead notifications">
                <div className="grid gap-4">
                  <Toggle checked={!!s.notify?.enabled} onChange={(v) => set('notify.enabled', v)} label="Email me every new lead" hint="Instant email with name, phone, property and a button to open the lead in the admin." />
                  <Field label="Send to" hint="One or more emails, comma separated."><input className="a-input" value={s.notify?.emails ?? ''} onChange={(e) => set('notify.emails', e.target.value)} placeholder="maulikgoswami202@gmail.com" /></Field>
                </div>
              </Card>
              <Card title="Email sending (SMTP)" action={<Status ok={data.smtp.active} on={`Working via ${data.smtp.fromEnv ? 'Vercel env' : 'settings'}`} off="Not configured" />}>
                {data.smtp.fromEnv ? (
                  <p className="text-[13px] text-ink/65">SMTP is set with environment variables on Vercel (<code>SMTP_USER</code> = {data.smtp.activeUser}). Those take priority over the fields below.</p>
                ) : (
                  <p className="mb-4 text-[13px] leading-relaxed text-ink/65">Free option: use your Gmail with an <b>App Password</b> (Google Account → Security → 2-Step Verification → App passwords). Host <code>smtp.gmail.com</code>, port <code>465</code>.</p>
                )}
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="SMTP host"><input className="a-input" value={smtp.host ?? ''} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} /></Field>
                  <Field label="Port"><input className="a-input" inputMode="numeric" value={smtp.port ?? ''} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} /></Field>
                  <Field label="Username (email)"><input className="a-input" autoComplete="off" value={smtp.user ?? ''} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} /></Field>
                  <Field label="Password / App password" hint={data.smtp.hasPass ? 'A password is saved. Leave empty to keep it.' : undefined}><input className="a-input" type="password" autoComplete="new-password" value={smtp.pass ?? ''} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} placeholder={data.smtp.hasPass ? '•••••••• (saved)' : ''} /></Field>
                  <div className="sm:col-span-2"><Field label="From name & address (optional)" hint='e.g. "RealtechX" <leads@realtechx.in>'><input className="a-input" value={smtp.from ?? ''} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} /></Field></div>
                </div>
                <div className="mt-5 flex flex-col gap-2 border-t border-ink/[0.06] pt-4 sm:flex-row">
                  <input className="a-input sm:max-w-xs" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Send test to (default: your email)" />
                  <button className="a-btn a-btn-ink" onClick={testEmail}><Mail className="h-4 w-4" /> Send test email</button>
                </div>
              </Card>
            </>
          )}

          {tab === 'integrations' && (
            <>
              <Card title="Google Analytics & Search Console">
                <div className="grid gap-4 sm:grid-cols-2">
                  <I k="analytics.gaId" label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" hint="Analytics → Admin → Data streams." />
                  <I k="analytics.gscVerification" label="Search Console verification" placeholder="content value or full meta tag" hint="Search Console → Add property → HTML tag." />
                </div>
              </Card>
              <Card title="Google Maps">
                <div className="grid gap-4 sm:grid-cols-2">
                  <I k="maps.apiKey" label="Maps API key (optional)" hint="Not needed — the free embedded map works without a key." />
                  <I k="maps.defaultZoom" label="Default map zoom" type="number" hint="3 (country) … 20 (building). 13–15 works well." />
                </div>
              </Card>
            </>
          )}

          {tab === 'media' && (
            <>
              <Card title="Cloudinary (free image hosting)" action={<Status ok={data.cloudinary.active} on={`Connected · ${data.cloudinary.activeCloud}`} off="Not connected" />}>
                <p className="mb-4 text-[13px] leading-relaxed text-ink/65">
                  Uploads go straight from your browser to Cloudinary’s free plan (25 GB) and are served fast & optimised. Create a free account at <a href="https://cloudinary.com" target="_blank" rel="noopener" className="font-semibold text-gold-dark hover:underline">cloudinary.com</a>, then copy the values from the Dashboard → API Keys.
                  {data.cloudinary.fromEnv && ' (Currently using Vercel environment variables.)'}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Cloud name"><input className="a-input" value={cloud.cloudName ?? ''} onChange={(e) => setCloud({ ...cloud, cloudName: e.target.value })} /></Field>
                  <Field label="API key"><input className="a-input" autoComplete="off" value={cloud.apiKey ?? ''} onChange={(e) => setCloud({ ...cloud, apiKey: e.target.value })} /></Field>
                  <Field label="API secret" hint={data.cloudinary.hasSecret ? 'Saved — leave empty to keep.' : undefined}><input className="a-input" type="password" autoComplete="new-password" value={cloud.apiSecret ?? ''} onChange={(e) => setCloud({ ...cloud, apiSecret: e.target.value })} placeholder={data.cloudinary.hasSecret ? '•••••••• (saved)' : ''} /></Field>
                </div>
              </Card>
              <Card title="Upload rules">
                <div className="grid gap-4 sm:grid-cols-2">
                  <I k="uploads.maxMb" label="Max file size (MB)" type="number" />
                  <I k="uploads.types" label="Allowed file types" hint="Comma separated, e.g. jpg,jpeg,png,webp,pdf,mp4" />
                </div>
              </Card>
            </>
          )}

          {tab === 'seo' && (
            <Card title="Default SEO">
              <div className="grid gap-4">
                <I k="seo.defaultTitle" label="Home page title" />
                <I k="seo.titleTemplate" label="Title template" hint="%s is replaced by the page title, e.g. “%s | RealtechX”." />
                <Field label="Default meta description"><textarea className="a-input min-h-[80px]" value={s.seo?.defaultDescription ?? ''} onChange={(e) => set('seo.defaultDescription', e.target.value)} /></Field>
                <Field label="Default keywords" hint="Comma separated"><textarea className="a-input min-h-[70px]" value={s.seo?.keywords ?? ''} onChange={(e) => set('seo.keywords', e.target.value)} /></Field>
                <Field label="Default social share image" hint="1200×630 recommended"><ImageField value={s.seo?.ogImage ?? ''} onChange={(v) => set('seo.ogImage', v)} folder="banners" aspect="aspect-[1200/630] max-w-md" /></Field>
                <Toggle checked={!!s.seo?.indexing} onChange={(v) => set('seo.indexing', v)} label="Allow search engines to index the website" hint="Turn off only while testing — it hides the whole site from Google." />
              </div>
            </Card>
          )}

          {tab === 'privacy' && (
            <Card title="Cookie banner">
              <div className="grid gap-4">
                <Toggle checked={!!s.cookie?.enabled} onChange={(v) => set('cookie.enabled', v)} label="Show cookie consent banner" />
                <Field label="Banner text"><textarea className="a-input min-h-[70px]" value={s.cookie?.text ?? ''} onChange={(e) => set('cookie.text', e.target.value)} /></Field>
                <p className="text-[12.5px] text-ink/55">Privacy Policy, Terms, Disclaimer and Cookie Policy are edited in <a className="font-semibold text-gold-dark hover:underline" href="/admin/content">Pages & Content → Legal pages</a>.</p>
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <>
              <Card title="Login security">
                <div className="grid gap-4 sm:grid-cols-2">
                  <I k="security.sessionMinutes" label="Auto-logout after inactivity (minutes)" type="number" hint="5 – 1440. Applies from the next login." />
                  <I k="security.maxLoginAttempts" label="Failed attempts before 15-min lock" type="number" hint="3 – 20" />
                </div>
                <ul className="mt-5 grid gap-2 text-[13px] text-ink/65 sm:grid-cols-2">
                  {['Passwords hashed with scrypt', 'Signed, http-only session cookie', 'Role-based permissions on every API', 'Login attempts limited & logged', 'Spam protection on website forms', 'Admin pages hidden from Google'].map((t) => (
                    <li key={t} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />{t}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Server environment">
                <div className="space-y-3 text-[13px]">
                  <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Database className="h-4 w-4 text-ink/45" /> Database</span>{data.env.database === 'mongo' ? <Badge tone="green">MongoDB connected</Badge> : <Badge tone="amber">Demo memory — not saved</Badge>}</p>
                  <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-ink/45" /> AUTH_SECRET</span>{data.env.authSecret ? <Badge tone="green">Set</Badge> : <Badge tone="amber">Not set (derived key in use)</Badge>}</p>
                  <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Cloud className="h-4 w-4 text-ink/45" /> Cloudinary</span>{data.cloudinary.active ? <Badge tone="green">Connected</Badge> : <Badge>Not connected</Badge>}</p>
                  <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink/45" /> Email (SMTP)</span>{data.smtp.active ? <Badge tone="green">Configured</Badge> : <Badge>Not configured</Badge>}</p>
                </div>
              </Card>
            </>
          )}

          {tab === 'backup' && <Backup confirm={confirm} toast={toast} />}
        </div>
      </div>
    </div>
    </SCtx.Provider>
  );
}

function Backup({ confirm, toast }: { confirm: ReturnType<typeof useAdmin>['confirm']; toast: ReturnType<typeof useAdmin>['toast'] }) {
  const sum = useApi<{ counts: Record<string, number> }>('backup?summary=1');
  const [file, setFile] = useState<File | null>(null);
  const [withUsers, setWithUsers] = useState(false);
  const [busy, setBusy] = useState(false);

  const restore = async () => {
    if (!file) return;
    if (!(await confirm({ title: 'Restore this backup?', text: 'Current listings, leads, content and settings will be REPLACED by the backup file. Download a fresh backup first if you are unsure.', confirm: 'Restore now', danger: true }))) return;
    setBusy(true);
    try {
      const json = JSON.parse(await file.text());
      if (withUsers) json.only = Object.keys(json.collections ?? {}).filter((c) => c !== 'activity');
      const r = await api<{ restored: Record<string, number> }>('backup', { body: json });
      toast(`Restored ${Object.values(r.restored).reduce((a, b) => a + b, 0)} records`);
      sum.reload();
      setFile(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Restore failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card title="Database backup" action={<button className="a-btn a-btn-gold shine" onClick={() => download('/api/admin/backup')}><DownloadCloud className="h-4 w-4" /> Download backup</button>}>
        <p className="text-[13px] leading-relaxed text-ink/65">Downloads everything — listings, leads, content, settings, users and media links — as one JSON file. Keep it somewhere safe (Google Drive). Secret keys and passwords for SMTP/Cloudinary are never included.</p>
        {sum.data && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(sum.data.counts).filter(([, n]) => n > 0).map(([k, n]) => (
              <div key={k} className="rounded-xl bg-ivory px-3 py-2"><p className="text-[11px] uppercase tracking-wider text-ink/45">{k.replace('_', ' ')}</p><p className="font-display text-[22px] font-semibold">{n.toLocaleString('en-IN')}</p></div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[12.5px] text-ink/50">Media files themselves live safely on Cloudinary. MongoDB Atlas free tier also keeps its own copy of your data.</p>
      </Card>
      <Card title="Restore from backup">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-ivory/40 px-6 py-8 text-center hover:border-gold">
          <Upload className="h-6 w-6 text-ink/45" />
          <span className="text-[13.5px] font-semibold">{file ? file.name : 'Choose a backup .json file'}</span>
          <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <div className="mt-4"><Toggle checked={withUsers} onChange={setWithUsers} label="Also restore admin users" hint="Off = keep current logins. On = users & passwords from the file replace current users." /></div>
        <div className="mt-4 flex justify-end"><SaveButton busy={busy} onClick={restore}>Restore backup</SaveButton></div>
      </Card>
    </>
  );
}
