import { navTypes, statuses, budgetBuy } from './site';
import { cities, getCity } from './data/cities';
import { developers } from './data/developers';
import { allLocalities, properties } from './data/properties';
import { configLabel, startPrice } from './format';

/* Server-side builders for data used by client components — keeps the big
   property list out of the browser bundle. */

export type NavLink = { href: string; label: string; meta?: string };
export type NavCol = { title: string; links: NavLink[] };
export type NavItem = { label: string; href: string; cols?: NavCol[]; footer?: NavLink; small?: boolean };

const count = (f: (p: (typeof properties)[number]) => boolean) => properties.filter(f).length;

export function buildNav(): NavItem[] {
  const locs = allLocalities();
  const topDevs = [...developers].sort((a, b) => count((p) => p.developer === b.slug) - count((p) => p.developer === a.slug)).slice(0, 18);
  return [
    {
      label: 'Buy',
      href: '/buy',
      cols: [
        { title: 'Property type', links: navTypes.map((t) => ({ href: `/properties?for=buy&type=${t.slug}`, label: t.label, meta: String(count((p) => p.type === t.slug && p.listingFor === 'buy')) })) },
        { title: 'Budget', links: budgetBuy.map((b) => ({ href: `/properties?for=buy&budget=${b.value}`, label: b.label })) },
        { title: 'Project status', links: statuses.map((s) => ({ href: `/status/${s.slug}`, label: s.label, meta: String(count((p) => p.status === s.slug)) })) },
        { title: 'Top cities', links: cities.map((c) => ({ href: `/properties?for=buy&city=${c.slug}`, label: c.name })) },
      ],
      footer: { href: '/buy', label: 'View all properties for sale' },
    },
    {
      label: 'Rent',
      href: '/rent',
      cols: [
        {
          title: 'For rent',
          links: [
            { href: '/properties?for=rent&type=residential', label: 'Homes for rent', meta: String(count((p) => p.listingFor === 'rent' && p.type === 'residential')) },
            { href: '/properties?for=rent&type=villa', label: 'Villas for rent', meta: String(count((p) => p.listingFor === 'rent' && p.type === 'villa')) },
            { href: '/properties?for=rent&type=commercial', label: 'Offices for lease', meta: String(count((p) => p.listingFor === 'rent' && p.type === 'commercial')) },
          ],
        },
        { title: 'Rent by city', links: cities.map((c) => ({ href: `/properties?for=rent&city=${c.slug}`, label: `Rent in ${c.name}` })) },
      ],
      footer: { href: '/rent', label: 'View all rentals' },
    },
    { label: 'Sell', href: '/sell' },
    {
      label: 'Developers',
      href: '/developers',
      cols: [{ title: 'Top developers', links: topDevs.map((d) => ({ href: `/developers/${d.slug}`, label: d.name, meta: String(count((p) => p.developer === d.slug)) })) }],
      footer: { href: '/developers', label: `All ${developers.length} developers` },
    },
    {
      label: 'Localities',
      href: '/localities',
      cols: cities.map((c) => ({
        title: c.name,
        links: locs.filter((l) => l.city === c.slug).slice(0, 6).map((l) => ({ href: `/city/${c.slug}/${l.slug}`, label: l.name })),
      })),
      footer: { href: '/localities', label: `All ${locs.length} localities` },
    },
    {
      label: 'Resources',
      href: '/blog',
      small: true,
      cols: [
        {
          title: 'Resources',
          links: [
            { href: '/blog', label: 'Blog & guides' },
            { href: '/home-loan#emi-calculator', label: 'EMI calculator' },
            { href: '/home-loan', label: 'Home loan guide' },
            { href: '/about', label: 'About RealtechX' },
            { href: '/contact', label: 'Contact us' },
          ],
        },
      ],
    },
  ];
}

export type SearchIndex = {
  locs: { name: string; slug: string; city: string; cityName: string; count: number }[];
  projects: { title: string; slug: string; locality: string; city: string; cityName: string; config: string }[];
  devs: { name: string; slug: string; cityName: string }[];
};

export function buildSearchIndex(): SearchIndex {
  return {
    locs: allLocalities().map((l) => ({ name: l.name, slug: l.slug, city: l.city, cityName: getCity(l.city)?.name ?? '', count: count((p) => p.city === l.city && p.localitySlug === l.slug) })),
    projects: properties.map((p) => ({ title: p.title, slug: p.slug, locality: p.locality, city: p.city, cityName: getCity(p.city)?.name ?? '', config: configLabel(p) })),
    devs: developers.map((d) => ({ name: d.name, slug: d.slug, cityName: getCity(d.city)?.name ?? '' })),
  };
}

export type SearchGroup = { title: string; links: { href: string; label: string }[] };

export function buildPopularSearches(): SearchGroup[] {
  return [
    { title: 'Localities', links: allLocalities().map((l) => ({ href: `/city/${l.city}/${l.slug}`, label: `Property in ${l.name}, ${getCity(l.city)?.name}` })) },
    { title: 'Developers', links: developers.map((d) => ({ href: `/developers/${d.slug}`, label: `${d.name} projects` })) },
    {
      title: 'Budget',
      links: cities.flatMap((c) => budgetBuy.slice(1, 3).map((b) => ({ href: `/properties?city=${c.slug}&budget=${b.value}`, label: `Property ${b.label} in ${c.name}` }))),
    },
    { title: 'Configuration', links: cities.flatMap((c) => [2, 3, 4].map((b) => ({ href: `/properties?city=${c.slug}&bhk=${b}`, label: `${b} BHK in ${c.name}` }))) },
    {
      title: 'Property type',
      links: cities.flatMap((c) =>
        navTypes.filter((t) => properties.some((p) => p.city === c.slug && p.type === t.slug)).map((t) => ({ href: `/properties?city=${c.slug}&type=${t.slug}`, label: `${t.label} in ${c.name}` })),
      ),
    },
  ];
}

export type CityExplorerData = {
  slug: string;
  name: string;
  state: string;
  image: string;
  blurb: string;
  total: number;
  locs: { slug: string; name: string; count: number; from: string; top: { slug: string; title: string; config: string; price: string }[] }[];
}[];

export function buildCityExplorer(): CityExplorerData {
  return cities.map((c) => {
    const cityProps = properties.filter((p) => p.city === c.slug);
    const locs = allLocalities()
      .filter((l) => l.city === c.slug)
      .map((l) => {
        const list = cityProps.filter((p) => p.localitySlug === l.slug).sort((a, b) => (a.priceMin || Infinity) - (b.priceMin || Infinity));
        return {
          slug: l.slug,
          name: l.name,
          count: list.length,
          from: list[0] ? startPrice(list[0]) : 'On request',
          top: list.slice(0, 3).map((p) => ({ slug: p.slug, title: p.title, config: configLabel(p), price: startPrice(p) })),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return { slug: c.slug, name: c.name, state: c.state, image: c.image, blurb: c.blurb, total: cityProps.length, locs };
  });
}
