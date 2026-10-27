'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { site } from '@/lib/site';

export default function FloatingCTA() {
  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 md:bottom-6 md:right-6">
      <a
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi RealtechX, I would like to know more about a property.')}`}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a href={`tel:${site.phoneRaw}`} aria-label="Call us" className="grid h-14 w-14 place-items-center rounded-full bg-gold-grad text-ink shadow-gold transition hover:scale-105">
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
