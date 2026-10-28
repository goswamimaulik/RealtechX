import Link from 'next/link';

/** Wordmark: "Realtech" + gold "X" (or an uploaded logo image from Admin → Settings). */
export default function Logo({ light = false, className = '', name = 'RealtechX', logoUrl = '' }: { light?: boolean; className?: string; name?: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <Link href="/" aria-label={`${name} home`} className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="h-9 w-auto max-w-[180px] object-contain lg:h-10" />
      </Link>
    );
  }
  const head = name.length > 1 ? name.slice(0, -1) : name;
  const tail = name.length > 1 ? name.slice(-1) : '';
  return (
    <Link href="/" aria-label={`${name} home`} className={`group inline-flex items-center font-display text-[23px] font-semibold leading-none tracking-[-0.03em] lg:text-[26px] ${className}`}>
      <span className={light ? 'text-ivory' : 'text-ink'}>{head}</span>
      {tail && (
        <span className="relative ml-px">
          <span className="gold-text font-bold">{tail}</span>
          <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gold-grad transition-transform duration-300 group-hover:scale-x-150" />
        </span>
      )}
    </Link>
  );
}
