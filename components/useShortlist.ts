'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'rtx-shortlist';
const EVT = 'rtx-shortlist-change';

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useShortlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setItems(next);
    window.dispatchEvent(new Event(EVT));
  }, []);

  return { items, toggle, has: (id: string) => items.includes(id) };
}
