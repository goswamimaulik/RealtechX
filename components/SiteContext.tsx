'use client';

import { createContext, useContext } from 'react';
import { site as fallback } from '@/lib/site';

export type PublicSite = { name: string; phone: string; phoneRaw: string; whatsapp: string; email: string; enquiryCta: string; logoUrl: string };

const Ctx = createContext<PublicSite>({
  name: fallback.name,
  phone: fallback.phone,
  phoneRaw: fallback.phoneRaw,
  whatsapp: fallback.whatsapp,
  email: fallback.email,
  enquiryCta: 'Get Best Price',
  logoUrl: '',
});

/** Provides admin-managed contact settings to client components. */
export function SiteProvider({ value, children }: { value: PublicSite; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
