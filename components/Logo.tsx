import Link from 'next/link';

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rtx-gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1E2BB" />
          <stop offset="0.5" stopColor="#C9A45C" />
          <stop offset="1" stopColor="#9C7A38" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="12" fill="#0B1020" />
      <rect x="1" y="1" width="46" height="46" rx="12" stroke="url(#rtx-gold)" strokeWidth="1.5" />
      {/* roofline */}
      <path d="M11 21 L24 11 L37 21" stroke="url(#rtx-gold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* X monogram */}
      <path d="M16 23 L32 38 M32 23 L16 38" stroke="url(#rtx-gold)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="RealtechX home">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className={`block font-display text-[26px] font-bold tracking-tight ${light ? 'text-ivory' : 'text-ink'}`}>
          Realtech<span className="gold-text">X</span>
        </span>
        <span className={`mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.34em] ${light ? 'text-ivory/60' : 'text-muted'}`}>
          Premium Properties
        </span>
      </span>
    </Link>
  );
}
