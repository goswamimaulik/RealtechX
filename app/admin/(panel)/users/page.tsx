'use client';

import { Check, Minus, ShieldCheck } from 'lucide-react';
import Crud from '@/components/admin/Crud';
import { Badge, Card, PageHeader } from '@/components/admin/ui';
import { when } from '@/components/admin/api';
import { roleDescriptions, roleLabels, roles, permsOf, type Perm } from '@/lib/auth/permissions';

const permLabels: [Perm, string][] = [
  ['properties', 'Properties & projects'],
  ['developers', 'Developers'],
  ['locations', 'Locations'],
  ['taxonomy', 'Categories & types'],
  ['leads', 'Leads & enquiries'],
  ['content', 'Pages & content'],
  ['blogs', 'Blogs'],
  ['media', 'Media library'],
  ['seo', 'SEO'],
  ['settings', 'Settings'],
  ['users', 'Users & roles'],
  ['activity', 'Activity log'],
  ['backup', 'Backup & restore'],
];
const roleTone = { super_admin: 'ink', property_manager: 'gold', content_editor: 'violet', lead_manager: 'blue' } as const;

export default function Page() {
  return (
    <div>
      <PageHeader eyebrow="System" title="Admin Users & Roles" subtitle="Give every team member their own login with only the access they need." />
      <Crud
        resource="users"
        noun="User"
        defaults={{ role: 'lead_manager', active: true }}
        searchPlaceholder="Search name or email…"
        filters={[{ key: 'role', label: 'All roles', options: roles.map((r) => ({ value: r, label: roleLabels[r] })) }]}
        fields={[
          { key: 'name', label: 'Full name', required: true },
          { key: 'email', label: 'Email (login)', type: 'email', required: true },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role', type: 'select', options: roles.map((r) => ({ value: r, label: roleLabels[r] })), hint: 'See the permission table below.' },
          { key: 'password', label: 'Password', type: 'password', required: true, when: (_d, isNew) => isNew, hint: 'At least 8 characters with letters and a number. Share it privately.' },
          { key: 'password', label: 'Set a new password', type: 'password', when: (_d, isNew) => !isNew, hint: 'Leave empty to keep the current password. Changing it logs the user out everywhere.' },
          { key: 'active', label: 'Account active', type: 'toggle', hint: 'Disabled users cannot log in.' },
          { key: 'logoutEverywhere', label: 'Log out of all devices on save', type: 'toggle', when: (_d, isNew) => !isNew },
        ]}
        columns={[
          {
            label: 'User',
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-gold-light">{r.name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join('')}</span>
                <span className="min-w-0"><span className="block truncate font-semibold">{r.name}</span><span className="block truncate text-[12px] text-ink/50">{r.email}</span></span>
              </span>
            ),
          },
          { label: 'Role', render: (r) => <Badge tone={roleTone[r.role as keyof typeof roleTone] ?? 'gray'}>{roleLabels[r.role as keyof typeof roleLabels] ?? r.role}</Badge> },
          { label: 'Status', render: (r) => (r.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>) },
          { label: 'Last login', hideSm: true, render: (r) => <span className="text-[12.5px] text-ink/55">{when(r.lastLogin)}</span> },
        ]}
      />

      <Card title="What each role can do" className="mt-8" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-ink/[0.06] bg-ivory/50">
              <tr>
                <th className="a-th">Module</th>
                {roles.map((r) => <th key={r} className="a-th text-center">{roleLabels[r]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.05]">
              {permLabels.map(([p, l]) => (
                <tr key={p}>
                  <td className="a-td font-medium">{l}</td>
                  {roles.map((r) => (
                    <td key={r} className="a-td text-center">{permsOf(r).includes(p) ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <Minus className="mx-auto h-4 w-4 text-ink/20" />}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 border-t border-ink/[0.06] p-5 sm:grid-cols-2">
          {roles.map((r) => (
            <p key={r} className="flex gap-2 text-[12.5px] text-ink/60"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" /><span><b className="text-ink">{roleLabels[r]}:</b> {roleDescriptions[r]}</span></p>
          ))}
        </div>
      </Card>
    </div>
  );
}
