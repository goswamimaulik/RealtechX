'use client';

import { useState, useRef } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import PhoneField, { validatePhone } from './PhoneField';

export interface LeadFormProps {
  source: string; // e.g. "Property Popup", "Contact Page"
  property?: string;
  intent?: string; // e.g. "Get Best Price", "Download Brochure"
  cta?: string;
  showEmail?: boolean;
  showMessage?: boolean;
  dark?: boolean;
  onSuccess?: () => void;
}

export default function LeadForm({
  source,
  property,
  intent,
  cta = 'Get a Call Back',
  showEmail = true,
  showMessage = false,
  dark = false,
  onSuccess,
}: LeadFormProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const mountedAt = useRef(Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const countryCode = String(fd.get('countryCode') || '+91');
    const check = validatePhone(countryCode, String(fd.get('phone') || ''));
    if (!check.ok) {
      setError(check.error);
      return;
    }
    const phone = check.number;
    setError('');
    setState('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          countryCode,
          phone,
          email: fd.get('email') || '',
          message: fd.get('message') || '',
          website: fd.get('website') || '', // honeypot
          source,
          property: property || '',
          intent: intent || cta,
          page: typeof window !== 'undefined' ? window.location.href : '',
          elapsed: Date.now() - (mountedAt.current ?? 0),
        }),
      });
      if (res.status === 429 || res.status === 422) {
        const j = await res.json().catch(() => ({}));
        setState('idle');
        setError(j.error || 'Please check your details and try again.');
        return;
      }
      if (!res.ok) throw new Error();
      setState('done');
      onSuccess?.();
    } catch {
      setState('error');
      setError('Something went wrong. Please call us directly.');
    }
  }

  const inputCls = dark ? 'input !border-white/15 !bg-white/5 !text-ivory placeholder:!text-ivory/40' : 'input';

  if (state === 'done') {
    return (
      <div className={`flex flex-col items-center py-6 text-center ${dark ? 'text-ivory' : ''}`}>
        <CheckCircle2 className="h-14 w-14 text-gold" />
        <p className="mt-4 font-display text-2xl font-semibold">Thank you!</p>
        <p className={`mt-1 text-sm ${dark ? 'text-ivory/70' : 'text-muted'}`}>
          Our property advisor will call you shortly{property ? ` with details of ${property}` : ''}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="name" required placeholder="Full name *" className={inputCls} autoComplete="name" />
      <PhoneField dark={dark} inputCls={inputCls} />
      {showEmail && <input name="email" type="email" placeholder="Email (optional)" className={inputCls} autoComplete="email" />}
      {showMessage && <textarea name="message" rows={3} placeholder="Tell us what you are looking for" className={inputCls} />}
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      <button type="submit" disabled={state === 'loading'} className="btn-gold shine w-full !py-3.5">
        {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {cta}
      </button>
      <p className={`flex items-start gap-1.5 text-[11px] leading-snug ${dark ? 'text-ivory/50' : 'text-muted'}`}>
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-gold" />
        By submitting, you agree to be contacted by RealtechX via call, SMS or WhatsApp. Your details are never shared without consent.
      </p>
    </form>
  );
}
