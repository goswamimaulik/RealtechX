import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Thank You', robots: { index: false } };

export default function ThankYouPage() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="h-20 w-20 text-gold" />
      <h1 className="mt-6 font-display text-5xl font-semibold">Thank you!</h1>
      <p className="mt-3 max-w-md text-muted">We have received your enquiry. A RealtechX advisor will contact you shortly. For anything urgent call {site.phone}.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/properties" className="btn-gold">Continue browsing</Link>
        <Link href="/" className="btn-outline">Home</Link>
      </div>
    </section>
  );
}
