'use client';

import { useEffect } from 'react';
import { openLead, type LeadModalDetail } from './LeadModal';

export function LeadButton({
  children,
  className = 'btn-gold',
  ...detail
}: LeadModalDetail & { children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openLead(detail);
      }}
    >
      {children}
    </button>
  );
}

/** Opens the enquiry popup automatically after `delay` ms, once per page per session. */
export function AutoLeadPopup({ delay = 3000, storageKey, ...detail }: LeadModalDetail & { delay?: number; storageKey: string }) {
  useEffect(() => {
    const key = 'rtx-popup-' + storageKey;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(key) === '1';
    } catch {
      /* storage unavailable */
    }
    if (seen) return;
    const t = window.setTimeout(() => {
      // don't stack on top of a dialog the visitor already opened
      if (document.querySelector('[role="dialog"]')) return;
      openLead({ source: 'Auto Popup', ...detail });
      try {
        window.sessionStorage.setItem(key, '1');
      } catch {
        /* ignore */
      }
    }, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, delay]);
  return null;
}
