'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert, Info } from 'lucide-react';

type Status = { database: 'mongo' | 'memory'; needsSetup: boolean; demo: { email: string; password: string } | null };

export default function LoginForm() {
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d.ok && setStatus(d))
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || 'Login failed');
      const next = sp.get('next');
      window.location.href = next && next.startsWith('/admin') ? next : '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {sp.get('expired') && !error && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] text-amber-800"><Info className="mt-0.5 h-4 w-4 shrink-0" />Your session timed out. Please log in again.</p>
      )}
      {status?.needsSetup && status.database === 'mongo' && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No admin account yet. Add <b>ADMIN_EMAIL</b> and <b>ADMIN_PASSWORD</b> in Vercel → Settings → Environment Variables, redeploy, then log in with them.</span>
        </p>
      )}
      {status?.demo && (
        <div className="rounded-xl border border-gold/30 bg-gold-50 px-3.5 py-3 text-[13px] leading-relaxed text-ink/80">
          <p className="font-semibold text-gold-dark">Demo mode (no database connected)</p>
          <p className="mt-1">Email: <code className="font-semibold">{status.demo.email}</code><br />Password: <code className="font-semibold">{status.demo.password}</code></p>
          <button type="button" onClick={() => { setEmail(status.demo!.email); setPassword(status.demo!.password); }} className="mt-2 text-[12.5px] font-semibold text-gold-dark underline underline-offset-2">Fill demo login</button>
        </div>
      )}
      <label className="block">
        <span className="a-label">Email</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="a-input !py-3 !pl-10" placeholder="you@company.com" />
        </span>
      </label>
      <label className="block">
        <span className="a-label flex items-center justify-between">
          Password
          <Link href="/admin/forgot" className="normal-case tracking-normal text-gold-dark hover:underline">Forgot password?</Link>
        </span>
        <span className="relative block">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="a-input !py-3 !pl-10 !pr-11" placeholder="••••••••" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/45 hover:text-ink">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">{error}</p>}
      <button disabled={busy} className="a-btn a-btn-gold shine w-full !py-3.5 !text-[14px]">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Log in securely
      </button>
      <p className="pt-2 text-center text-[12px] text-ink/45">Protected area · attempts are limited and logged</p>
    </form>
  );
}
