import { getImageProps } from 'next/image';

/**
 * Art-directed responsive image: a portrait crop on phones and a landscape image on larger screens,
 * rendered as a single <picture> so the browser downloads only one of them.
 */
export default function ArtImage({
  mobile,
  desktop,
  alt,
  className = '',
  priority = false,
  breakpoint = 768,
}: {
  mobile: string;
  desktop: string;
  alt: string;
  className?: string;
  priority?: boolean;
  breakpoint?: number;
}) {
  const common = { alt, fill: true, priority, quality: 80 } as const;
  const { props: { srcSet: desktopSet } } = getImageProps({ ...common, src: desktop, sizes: '100vw' });
  const { props: mobileProps } = getImageProps({ ...common, src: mobile, sizes: '100vw' });
  return (
    <picture>
      <source media={`(min-width: ${breakpoint}px)`} srcSet={desktopSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...mobileProps} className={className} />
    </picture>
  );
}
