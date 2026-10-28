import { Suspense } from 'react';
import SettingsView from './SettingsView';

export const metadata = { title: 'Settings' };

export default function Page() {
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
