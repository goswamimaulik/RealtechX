import Link from 'next/link';

/** Text-only wordmark: "Realtech" in the base colour with a gold serif X. */
export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="RealtechX home" className={`group inline-flex items-baseline leading-none ${className}`}>
      <span className={`font-display text-[24px] font-bold tracking-[-0.02em] md:text-[28px] ${light ? 'text-ivory' : 'text-ink'}`}>
        Realtech
      </span>
      <span className="relative ml-[1px] font-display text-[28px] font-bold italic leading-none md:text-[33px]">
        <span className="gold-text">X</span>
        <span className="absolute -bottom-[3px] left-0 h-[2px] w-full rounded-full bg-gold-grad transition-all duration-300 group-hover:w-[140%]" />
      </span>
    </Link>
  );
}
