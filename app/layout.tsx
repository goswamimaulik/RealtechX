import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCTA from '@/components/FloatingCTA';
import LeadModalHost from '@/components/LeadModal';
import { site } from '@/lib/site';

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
  icons: { icon: '/favicon.svg' },
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
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body>
        <div className="bg-ink text-ivory">
          <div className="container flex items-center justify-center gap-2 py-2 text-center text-[11.5px] leading-snug sm:text-xs">
            <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-ink">Preview</span>
            <span className="text-ivory/80">{site.previewNotice}</span>
          </div>
        </div>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <FloatingCTA />
        <LeadModalHost />
      </body>
    </html>
  );
}
