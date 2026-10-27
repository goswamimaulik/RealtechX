'use client';

import { useEffect } from 'react';
import { openLead, type LeadModalDetail } from './LeadModal';

export function LeadButton({
  children,
  className = 'btn-gold',
  ...detail
}: LeadModalDetail & { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openLead(detail)}>
      {children}
    </button>
  );
}

/** Opens the enquiry popup automatically after `delay` ms, once per page per session. */
export function AutoLeadPopup({ delay = 3000, storageKey, ...detail }: LeadModalDetail & { delay?: number; storageKey: string }) {
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem('rtx-popup-' + storageKey) === '1';
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = window.setTimeout(() => {
      openLead({ source: 'Auto Popup', ...detail });
      try {
        window.sessionStorage.setItem('rtx-popup-' + storageKey, '1');
      } catch {
        /* ignore */
      }
    }, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, delay]);
  return null;
}
