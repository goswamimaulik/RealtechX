'use client';

import { useEffect, useState } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { api } from '@/components/admin/api';
import { Card, Field, Loading, PageHeader, SaveButton, useAdmin, useApi } from '@/components/admin/ui';
import { roleLabels } from '@/lib/auth/permissions';

type Me = { user: { id: string; name: string; email: string; role: keyof typeof roleLabels; phone?: string } };

export default function Page() {
  const { toast } = useAdmin();
  const { data } = useApi<Me>('auth/me');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState<'p' | 'w' | ''>('');
  useEffect(() => {
    if (data) {
      setName(data.user.name);
      setPhone(data.user.phone ?? '');
    }
  }, [data]);
  if (!data) return <Loading />;

  const saveProfile = async () => {
    setBusy('p');
    try {
      const r = await api<{ message: string }>('auth/password', { body: { name, phone } });
      toast(r.message);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy('');
    }
  };
  const savePw = async () => {
    if (pw !== pw2) return toast('New passwords do not match', 'error');
    setBusy('w');
    try {
      const r = await api<{ message: string }>('auth/password', { body: { current: cur, password: pw } });
      toast(r.message);
      setCur('');
      setPw('');
      setPw2('');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={roleLabels[data.user.role]} title="Profile & password" subtitle={data.user.email} />
      <div className="space-y-5">
        <Card title={<span className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Profile</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input className="a-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Phone"><input className="a-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          </div>
          <div className="mt-4 flex justify-end"><SaveButton busy={busy === 'p'} onClick={saveProfile}>Save profile</SaveButton></div>
        </Card>
        <Card title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Change password</span>}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password"><input type="password" autoComplete="current-password" className="a-input" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
            <Field label="New password" hint="8+ characters, letters & a number"><input type="password" autoComplete="new-password" className="a-input" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
            <Field label="Confirm new password"><input type="password" autoComplete="new-password" className="a-input" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-ink/50">Changing your password signs you out on other devices.</p>
            <SaveButton busy={busy === 'w'} onClick={savePw}>Update password</SaveButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
