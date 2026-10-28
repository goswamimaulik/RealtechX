import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { getStore } from '@/lib/server/store';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getStore();
  return {
    metadataBase: new URL(s.url),
    title: { default: s.seo.defaultTitle, template: s.seo.titleTemplate || '%s' },
    description: s.seo.defaultDescription || s.description,
    keywords: s.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    openGraph: { type: 'website', siteName: s.name, locale: 'en_IN', url: s.url, images: s.seo.ogImage ? [{ url: s.seo.ogImage }] : undefined },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: '/' },
    robots: s.seo.indexing ? { index: true, follow: true } : { index: false, follow: false },
    verification: s.analytics.gscVerification ? { google: s.analytics.gscVerification } : undefined,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: '#0B1020',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings: s } = await getStore();
  const ga = s.analytics.gaId?.trim();
  return (
    <html lang="en-IN" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        {ga && /^G-[A-Z0-9]+$/i.test(ga) && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
