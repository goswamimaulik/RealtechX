import { Suspense } from 'react';
import PropertyList from '@/components/admin/PropertyList';

export const metadata = { title: 'Properties' };

export default function Page() {
  return (
    <Suspense>
      <PropertyList kind="property" />
    </Suspense>
  );
}
