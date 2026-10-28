import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { adminDb, currentUser } from '@/lib/server/auth';
import { permsOf } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const db = await adminDb();
  const user = await currentUser(db);
  if (!user) redirect('/admin/login');
  const settings = await db.coll('settings').findOne({ _id: 'site' });
  return (
    <AdminShell user={user} perms={permsOf(user.role)} siteName={settings?.name || 'RealtechX'} database={db.kind}>
      {children}
    </AdminShell>
  );
}
