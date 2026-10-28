import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PopularSearches from '@/components/PopularSearches';
import LeadModalHost from '@/components/LeadModal';
import CookieBar from '@/components/CookieBar';
import { SiteProvider } from '@/components/SiteContext';
import { buildNav, buildPopularSearches } from '@/lib/nav';
import { getStore, publicSettings } from '@/lib/server/store';

// Pages are cached and refreshed at most every 5 minutes; admin saves refresh them instantly.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getStore();
  const st = s.settings;
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: st.name,
    url: st.url,
    telephone: st.phoneRaw,
    email: st.email,
    address: { '@type': 'PostalAddress', streetAddress: st.address, addressCountry: 'IN' },
    ...(st.logoUrl ? { logo: st.logoUrl } : {}),
  };
  return (
    <SiteProvider value={publicSettings(s)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      {st.showPreviewBar && (st.previewNotice || st.previewNoticeShort) && (
        <div className="bg-ink text-ivory">
          <div className="container flex items-center justify-center gap-2 py-1.5 text-center text-[11px] leading-snug sm:py-2 sm:text-xs">
            <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink">Preview</span>
            <span className="truncate text-ivory/80 sm:hidden">{st.previewNoticeShort || st.previewNotice}</span>
            <span className="hidden text-ivory/80 sm:inline">{st.previewNotice || st.previewNoticeShort}</span>
          </div>
        </div>
      )}
      <Header nav={buildNav(s)} />
      <main className="min-h-[60vh]">{children}</main>
      <PopularSearches groups={buildPopularSearches(s)} />
      <Footer store={s} />
      <LeadModalHost />
      {st.cookie.enabled && st.cookie.text && <CookieBar text={st.cookie.text} />}
    </SiteProvider>
  );
}
