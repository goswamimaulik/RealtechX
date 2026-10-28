import { Suspense } from 'react';
import LeadsView from './LeadsView';

export const metadata = { title: 'Leads & Enquiries' };

export default function Page() {
  return (
    <Suspense>
      <LeadsView />
    </Suspense>
  );
}
