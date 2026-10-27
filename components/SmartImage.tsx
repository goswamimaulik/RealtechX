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
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} onError={() => setFailed(true)} />;
}
