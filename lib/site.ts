export const site = {
  name: 'RealtechX',
  tagline: 'Premium Real Estate Portal',
  description:
    'RealtechX is a premium real estate portal to discover residential apartments, commercial spaces, plots, land and luxury villas across Mumbai, Navi Mumbai, Pune, Bangalore, Hyderabad, Gurugram, Noida, Kolkata, Ahmedabad and Surat.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://realtechx.vercel.app',
  phone: '+91 97730 69318',
  phoneRaw: '+919773069318',
  whatsapp: '919773069318',
  email: 'maulikgoswami202@gmail.com',
  address: 'Surat, Gujarat, India',
  hours: 'Mon – Sat, 10:00 AM – 7:00 PM',
  previewNotice:
    'Preview portal — real projects with details as their developers publish them, plus sample listings. Not all are verified on RERA yet.',
  previewNoticeShort: 'Real & sample listings · verify on RERA',
  social: {
    instagram: '#',
    facebook: '#',
    linkedin: '#',
    youtube: '#',
  },
};

export const navTypes = [
  { slug: 'residential', label: 'Residential' },
  { slug: 'commercial', label: 'Commercial' },
  { slug: 'plot', label: 'Plots' },
  { slug: 'land', label: 'Land' },
  { slug: 'villa', label: 'Villas' },
] as const;

export const statuses = [
  { slug: 'new-launch', label: 'New Launch' },
  { slug: 'under-construction', label: 'Under Construction' },
  { slug: 'ready-to-move', label: 'Ready to Move' },
] as const;

export const budgetBuy = [
  { value: '0-5000000', label: 'Under ₹50 L' },
  { value: '5000000-10000000', label: '₹50 L – ₹1 Cr' },
  { value: '10000000-20000000', label: '₹1 Cr – ₹2 Cr' },
  { value: '20000000-50000000', label: '₹2 Cr – ₹5 Cr' },
  { value: '50000000-999999999999', label: 'Above ₹5 Cr' },
];

export const budgetRent = [
  { value: '0-100000', label: 'Under ₹1 L / month' },
  { value: '100000-300000', label: '₹1 L – ₹3 L / month' },
  { value: '300000-999999999', label: 'Above ₹3 L / month' },
];

export const reraPortals: Record<string, { name: string; url: string }> = {
  Maharashtra: { name: 'MahaRERA', url: 'https://maharera.maharashtra.gov.in' },
  Karnataka: { name: 'K-RERA', url: 'https://rera.karnataka.gov.in' },
  Telangana: { name: 'TS-RERA', url: 'https://rera.telangana.gov.in' },
  Gujarat: { name: 'GujRERA', url: 'https://gujrera.gujarat.gov.in' },
  Haryana: { name: 'HRERA', url: 'https://haryanarera.gov.in' },
  'Uttar Pradesh': { name: 'UP RERA', url: 'https://www.up-rera.in' },
  'West Bengal': { name: 'WBRERA', url: 'https://rera.wb.gov.in' },
};
