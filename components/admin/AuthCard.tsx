import Link from 'next/link';

/** Split-screen luxury frame used by login / forgot / reset. */
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-ivory lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=70" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(11,16,32,.55)_0%,rgba(11,16,32,.92)_75%)]" />
        <div className="pointer-events-none absolute inset-6 rounded-[28px] border border-gold/25" />
        <div className="relative flex h-full flex-col justify-between p-14 text-ivory">
          <Link href="/" className="font-display text-[30px] font-semibold tracking-[-0.03em]">
            Realtech<span className="gold-text font-bold">X</span>
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-light">Portal control room</p>
            <p className="mt-4 max-w-md font-display text-[44px] font-semibold leading-[1.05]">Every listing, lead and page — managed in one elegant place.</p>
            <div className="mt-8 flex gap-8 text-[13px] text-ivory/60">
              <span>Properties & projects</span>
              <span>Leads CRM</span>
              <span>SEO & content</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-10 inline-block font-display text-[28px] font-semibold tracking-[-0.03em] lg:hidden">
            Realtech<span className="gold-text font-bold">X</span>
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-dark">Admin panel</p>
          <h1 className="mt-2 font-display text-[38px] font-semibold leading-[1.05]">{title}</h1>
          {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
