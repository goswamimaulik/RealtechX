'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cities } from '@/lib/data/cities';
import { navTypes } from '@/lib/site';

export default function SellForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get('phone') || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Please enter a valid 10-digit mobile number.');
    setError('');
    setState('loading');
    const details = ['purpose', 'role', 'type', 'city', 'locality', 'bhk', 'area', 'price']
      .map((k) => `${k}: ${fd.get(k) || '-'}`)
      .join(' | ');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          phone,
          email: fd.get('email') || '',
          message: `${details}\n${fd.get('message') || ''}`,
          source: 'Sell / Post Property',
          intent: `List property for ${fd.get('purpose')}`,
          page: window.location.href,
          website: fd.get('website') || '',
        }),
      });
      if (!res.ok) throw new Error();
      setState('done');
    } catch {
      setState('error');
      setError('Could not submit. Please call us directly.');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-gold" />
        <p className="mt-4 font-display text-3xl font-semibold">Property submitted!</p>
        <p className="mt-2 text-sm text-muted">Our listing team will call you within 24 hours to verify details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <Field label="I want to *">
        <select name="purpose" className="input" required><option value="sell">Sell</option><option value="rent">Rent out</option></select>
      </Field>
      <Field label="I am *">
        <select name="role" className="input" required><option>Owner</option><option>Builder / Developer</option><option>Channel Partner / Agent</option></select>
      </Field>
      <Field label="Property type *">
        <select name="type" className="input" required>{navTypes.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}</select>
      </Field>
      <Field label="City *">
        <select name="city" className="input" required>{cities.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}<option value="Other">Other</option></select>
      </Field>
      <Field label="Locality / Project *"><input name="locality" required className="input" placeholder="e.g. Baner, Aurum Vista" /></Field>
      <Field label="Configuration"><input name="bhk" className="input" placeholder="e.g. 3 BHK / Office / Plot" /></Field>
      <Field label="Area"><input name="area" className="input" placeholder="e.g. 1,250 sq.ft" /></Field>
      <Field label="Expected price / rent"><input name="price" className="input" placeholder="e.g. ₹1.2 Cr or ₹45K / month" /></Field>
      <Field label="Your name *"><input name="name" required className="input" autoComplete="name" /></Field>
      <Field label="Mobile number *"><input name="phone" required inputMode="numeric" maxLength={10} className="input" autoComplete="tel-national" /></Field>
      <div className="sm:col-span-2"><Field label="Email"><input name="email" type="email" className="input" autoComplete="email" /></Field></div>
      <div className="sm:col-span-2"><Field label="Additional details"><textarea name="message" rows={3} className="input" placeholder="Floor, furnishing, amenities, availability…" /></Field></div>
      {error && <p className="text-xs font-semibold text-red-500 sm:col-span-2">{error}</p>}
      <button disabled={state === 'loading'} className="btn-gold sm:col-span-2 !py-4">
        {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />} Submit Property
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
