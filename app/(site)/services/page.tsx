import { permanentRedirect } from 'next/navigation';

// The Services page has been retired — send any old links to About.
export default function ServicesPage() {
  permanentRedirect('/about');
}
