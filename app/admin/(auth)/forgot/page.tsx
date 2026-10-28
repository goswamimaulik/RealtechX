'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import AuthCard from '@/components/admin/AuthCard';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || 'Something went wrong');
      setMsg(d.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthCard title="Reset password" subtitle="Enter your admin email and we’ll send you a secure reset link.">
      {msg ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-[13.5px] leading-relaxed text-emerald-900">
          <MailCheck className="mb-2 h-6 w-6" />
          {msg}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="a-label">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="a-input !py-3" placeholder="you@company.com" />
          </label>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">{error}</p>}
          <button disabled={busy} className="a-btn a-btn-gold shine w-full !py-3.5">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-center text-[13px]"><Link href="/admin/login" className="font-semibold text-gold-dark hover:underline">← Back to login</Link></p>
    </AuthCard>
  );
}
