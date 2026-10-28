import { Suspense } from 'react';
import AuthCard from '@/components/admin/AuthCard';
import LoginForm from './LoginForm';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Log in to manage properties, leads and website content.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
