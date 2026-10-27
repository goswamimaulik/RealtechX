import Link from 'next/link';

/** Text wordmark: "Realtech" + gold "X". */
export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="RealtechX home" className={`group inline-flex items-center font-display text-[23px] font-semibold leading-none tracking-[-0.03em] lg:text-[26px] ${className}`}>
      <span className={light ? 'text-ivory' : 'text-ink'}>Realtech</span>
      <span className="relative ml-px">
        <span className="gold-text font-bold">X</span>
        <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gold-grad transition-transform duration-300 group-hover:scale-x-150" />
      </span>
    </Link>
  );
}
