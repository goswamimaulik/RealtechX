'use client';

import { useState } from 'react';
import { Check, Heart, Share2 } from 'lucide-react';
import { useShortlist } from './useShortlist';

export default function PropertyActions({ id, title }: { id: string; title: string }) {
  const { has, toggle } = useShortlist();
  const [copied, setCopied] = useState(false);
  const saved = has(id);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => toggle(id)} className={`btn !px-4 !py-2.5 border ${saved ? 'border-gold bg-gold text-ink' : 'border-ink/10 bg-white'}`}>
        <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /> {saved ? 'Shortlisted' : 'Shortlist'}
      </button>
      <button onClick={share} className="btn !px-4 !py-2.5 border border-ink/10 bg-white">
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? 'Copied' : 'Share'}
      </button>
    </div>
  );
}
