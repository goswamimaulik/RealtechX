import { Suspense } from 'react';
import PropertyList from '@/components/admin/PropertyList';

export const metadata = { title: 'Projects' };

export default function Page() {
  return (
    <Suspense>
      <PropertyList kind="project" />
    </Suspense>
  );
}
