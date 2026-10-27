import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PopularSearches from '@/components/PopularSearches';
import LeadModalHost from '@/components/LeadModal';
import { site } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'RealtechX — Premium Real Estate Portal | Buy, Rent & Sell Property in India',
    template: '%s | RealtechX',
  },
  description: site.description,
  keywords: [
    'real estate portal', 'property in Mumbai', 'flats in Pune', 'villas in Bangalore', 'plots in Hyderabad',
    'property in Ahmedabad', 'villas in Surat', 'commercial property', 'new launch projects', 'ready to move flats',
  ],
  openGraph: { type: 'website', siteName: site.name, locale: 'en_IN', url: site.url },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0B1020',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: site.name,
    url: site.url,
    telephone: site.phoneRaw,
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Surat', addressRegion: 'Gujarat', addressCountry: 'IN' },
  };
  return (
    <html lang="en-IN" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body>
        <div className="bg-ink text-ivory">
          <div className="container flex items-center justify-center gap-2 py-1.5 text-center text-[11px] leading-snug sm:py-2 sm:text-xs">
            <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink">Preview</span>
            <span className="truncate text-ivory/80 sm:hidden">{site.previewNoticeShort}</span>
            <span className="hidden text-ivory/80 sm:inline">{site.previewNotice}</span>
          </div>
        </div>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <PopularSearches />
        <Footer />
        <LeadModalHost />
      </body>
    </html>
  );
}
