'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import AuthCard from '@/components/admin/AuthCard';

function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setError('Passwords do not match.');
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || 'Could not reset password');
      setDone(d.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setBusy(false);
    }
  };
  if (!token) return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13.5px] text-rose-700">This reset link is incomplete. Please request a new one.</p>;
  if (done)
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-[13.5px] text-emerald-900">
        <CheckCircle2 className="mb-2 h-6 w-6" />
        {done}
        <Link href="/admin/login" className="a-btn a-btn-ink mt-4 w-full">Go to login</Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="a-label">New password</span>
        <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="a-input !py-3" />
        <span className="mt-1.5 block text-[11.5px] text-ink/45">At least 8 characters with letters and a number.</span>
      </label>
      <label className="block">
        <span className="a-label">Confirm password</span>
        <input type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="a-input !py-3" />
      </label>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">{error}</p>}
      <button disabled={busy} className="a-btn a-btn-gold shine w-full !py-3.5">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Set new password</button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <AuthCard title="Choose a new password" subtitle="For your security, all other sessions will be signed out.">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthCard>
  );
}
