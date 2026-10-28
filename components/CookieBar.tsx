'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const KEY = 'rtx-cookie-ok';

export default function CookieBar({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== '1');
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  const close = (v: string) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-gold/25 bg-ink/95 p-4 text-ivory shadow-luxe backdrop-blur md:inset-x-6 md:flex md:items-center md:gap-5 md:p-5">
      <p className="text-[13px] leading-relaxed text-ivory/80">
        {text} <Link href="/cookie-policy" className="text-gold-light underline underline-offset-2">Learn more</Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
        <button onClick={() => close('0')} className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-semibold hover:border-gold">Decline</button>
        <button onClick={() => close('1')} className="btn-gold !px-5 !py-2 text-[13px]">Accept</button>
      </div>
    </div>
  );
}
