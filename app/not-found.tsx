import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-8xl font-semibold gold-text">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">This address doesn’t exist</h1>
      <p className="mt-2 text-muted">The page you are looking for may have moved. Let’s find you a better one.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/properties" className="btn-gold">Search properties</Link>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </section>
  );
}
