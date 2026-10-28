'use client';

import { useState } from 'react';
import { Check, Link2, Linkedin, MessageCircle } from 'lucide-react';

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window !== 'undefined' ? window.location.href : '');
  const btn = 'grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink/70 transition hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark';
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[12px] font-medium uppercase tracking-wider text-muted">Share</span>
      <button type="button" className={btn} aria-label="Share on WhatsApp" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`, '_blank', 'noopener')}>
        <MessageCircle className="h-4 w-4" />
      </button>
      <button type="button" className={btn} aria-label="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`, '_blank', 'noopener')}>
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard blocked */
          }
        }}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
