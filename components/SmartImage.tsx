'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/** next/image with an elegant fallback if a remote photo fails to load. */
export default function SmartImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`absolute inset-0 grid place-items-center bg-ink-grad ${props.className ?? ''}`}>
        <span className="font-display text-2xl font-semibold text-gold-light/70">RealtechX</span>
      </div>
    );
  }
  const src = typeof props.src === 'string' ? props.src : '';
  // Cloudinary already serves optimised images (f_auto,q_auto) — skip Vercel's optimiser to save quota.
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    const w = typeof props.width === 'number' ? props.width : 1600;
    const tuned = /\/upload\/(?:[a-z]_[^/]+,?)+\//.test(src) ? src : src.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${Math.min(w * 2, 2000)}/`);
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...props} src={tuned} unoptimized onError={() => setFailed(true)} />;
  }
  if (src.startsWith('http://')) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...props} unoptimized onError={() => setFailed(true)} />;
  }
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} onError={() => setFailed(true)} />;
}
