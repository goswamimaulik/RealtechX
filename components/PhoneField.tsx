'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const COUNTRIES = [
  { code: '+91', iso: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+971', iso: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+966', iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', iso: 'QA', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', iso: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+968', iso: 'OM', flag: '🇴🇲', name: 'Oman' },
  { code: '+973', iso: 'BH', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+65', iso: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', iso: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+64', iso: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+60', iso: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+852', iso: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+49', iso: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', iso: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+31', iso: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+27', iso: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+254', iso: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+977', iso: 'NP', flag: '🇳🇵', name: 'Nepal' },
];

/** Returns the cleaned national number, or an error message. */
export function validatePhone(code: string, raw: string): { ok: true; number: string } | { ok: false; error: string } {
  const digits = raw.replace(/\D/g, '');
  if (code === '+91') {
    const n = digits.slice(-10);
    return /^[6-9]\d{9}$/.test(n) ? { ok: true, number: n } : { ok: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }
  return /^\d{6,14}$/.test(digits) ? { ok: true, number: digits } : { ok: false, error: 'Please enter a valid mobile number.' };
}

/** Country-code select + mobile number input. Field names: `countryCode`, `phone`. */
export default function PhoneField({ dark = false, inputCls = 'input' }: { dark?: boolean; inputCls?: string }) {
  const [code, setCode] = useState('+91');
  const c = COUNTRIES.find((x) => x.code === code) ?? COUNTRIES[0];
  return (
    <div className="flex">
      <label className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-xl border border-r-0 pl-3 pr-7 text-[14px] font-semibold ${dark ? 'border-white/15 bg-white/10 text-ivory' : 'border-ink/10 bg-ivory-200 text-ink'}`}>
        <span aria-hidden="true" className="text-base leading-none">{c.flag}</span>
        <span>{c.code}</span>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60" />
        <select
          name="countryCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Country code"
        >
          {COUNTRIES.map((x) => (
            <option key={x.iso} value={x.code}>{x.flag} {x.name} ({x.code})</option>
          ))}
        </select>
      </label>
      <input
        name="phone"
        required
        type="tel"
        inputMode="numeric"
        maxLength={code === '+91' ? 10 : 14}
        placeholder="Mobile number *"
        className={`${inputCls} min-w-0 !rounded-l-none`}
        autoComplete="tel-national"
      />
    </div>
  );
}
