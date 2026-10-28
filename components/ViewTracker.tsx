'use client';

import { useEffect } from 'react';

/** Counts one view per property per browser session (feeds Admin → Dashboard "Most viewed"). */
export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const key = `rtx-view-${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* private mode: still count */
    }
    const body = JSON.stringify({ id });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    else fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }, [id]);
  return null;
}
