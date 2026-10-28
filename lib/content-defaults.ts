import { img } from './data/images';

/* Editable website content. Admin → Pages & Content edits these; the values below are the defaults. */

export interface HomeContent {
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  heroDesktop: string;
  heroMobile: string;
  popularChips: { label: string; href: string }[];
  trustPoints: string[];
  categoriesTitle: string;
  categoriesText: string;
  featuredTitle: string;
  featuredText: string;
  featuredIds: string[]; // empty = listings marked "featured"
  whyTitle: string;
  whyText: string;
  whyQuote: string;
  whyImage: string;
  whyItems: { title: string; text: string }[];
  sellEyebrow: string;
  sellTitle: string;
  sellAccent: string;
  sellText: string;
  showcaseTitle: string;
  showcaseText: string;
  popularLocalities: string[]; // "city/locality" — empty = automatic
}

export interface AboutContent {
  heroTitle: string;
  heroText: string;
  heroImage: string;
  storyTitle: string;
  story: string[];
  image: string;
  values: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
}

export interface ContactContent {
  heroTitle: string;
  heroText: string;
  heroImage: string;
  mapQuery: string;
  faqs: { q: string; a: string }[];
}

export interface FooterContent {
  description: string;
  bottomNote: string;
}

export const defaultHome: HomeContent = {
  eyebrow: 'India’s premium property portal',
  title: 'Find a home that matches your',
  accent: 'ambition',
  subtitle: 'Apartments, villas, offices, plots and land across 10 of India’s fastest-growing cities — with complete details and real advisors.',
  heroDesktop: img.hero,
  heroMobile: img.heroMobile,
  popularChips: [
    { label: 'Worli', href: '/city/mumbai/worli' },
    { label: 'Baner', href: '/city/pune/baner' },
    { label: 'Kokapet', href: '/city/hyderabad/kokapet' },
    { label: 'Devanahalli', href: '/city/bangalore/devanahalli' },
    { label: 'Sindhu Bhavan Rd', href: '/city/ahmedabad/sindhu-bhavan-road' },
    { label: 'Vesu', href: '/city/surat/vesu' },
  ],
  trustPoints: ['Complete project details', 'Zero brokerage enquiries', 'Real advisors, quick call back'],
  categoriesTitle: 'Every kind of property, one address',
  categoriesText: 'From sea-facing sky residences to farmland in the Sahyadris — start with what you are looking for.',
  featuredTitle: 'Featured projects',
  featuredText: 'Our advisors’ pick of the most promising launches and ready homes this month.',
  featuredIds: [],
  whyTitle: 'A calmer, clearer way to buy property',
  whyText: 'Every listing is presented with complete pricing, configurations, amenities and location insights — so you spend less time chasing details and more time deciding.',
  whyQuote: '“We help you decide — not just discover.”',
  whyImage: img.why,
  whyItems: [
    { title: 'Complete details', text: 'Prices, plans & possession on one page.' },
    { title: 'Zero brokerage', text: 'Enquire and book visits at no cost.' },
    { title: 'Market insight', text: 'Locality guides & investment analysis.' },
    { title: 'Loan support', text: 'Compare offers, calculate EMI instantly.' },
  ],
  sellEyebrow: 'For owners, builders & channel partners',
  sellTitle: 'Sell or rent out your property',
  sellAccent: 'faster',
  sellText: 'List on RealtechX and reach serious buyers and tenants searching every day — with a premium listing page your property deserves.',
  showcaseTitle: 'RealtechX, your partner in finding the right property',
  showcaseText: 'Tell us your budget, city and configuration. Our advisor sends you 3 handpicked projects on WhatsApp within 24 hours — with price sheets and floor plans.',
  popularLocalities: [],
};

export const defaultAbout: AboutContent = {
  heroTitle: 'Real estate, presented the way it deserves',
  heroText: 'RealtechX brings premium design, complete information and genuine advice to property discovery in India.',
  heroImage: img.villa[1],
  storyTitle: 'Built for buyers who value clarity',
  story: [
    'Searching for property in India often means incomplete listings, hidden prices and endless follow-up calls. RealtechX was created to change that — with a portal where every project is presented with full pricing, configurations, amenities and location insights on a single, beautiful page.',
    'We cover residential apartments, commercial spaces, plots, land and luxury villas across 10 of India’s fastest-growing cities, and we are expanding city by city.',
    'Behind the portal is a team that understands real estate websites, search and lead management — so developers and channel partners get qualified enquiries, and buyers get answers.',
  ],
  image: img.apartment[7],
  values: [
    { title: 'Transparency', text: 'Complete details, upfront. No hidden surprises.' },
    { title: 'Premium experience', text: 'Design and speed that respect your time.' },
    { title: 'Responsibility', text: 'We encourage every buyer to verify on RERA.' },
    { title: 'Guidance', text: 'Advisors who help you decide, not just discover.' },
  ],
  faqs: [
    { q: 'What is RealtechX?', a: 'RealtechX is a premium real estate portal for discovering residential apartments, commercial spaces, plots, land and luxury villas — for sale and rent — across India’s top cities.' },
    { q: 'Does RealtechX charge buyers any brokerage?', a: 'No. Searching, shortlisting, enquiring and booking site visits through RealtechX is free for buyers and tenants.' },
    { q: 'Are the listings on RealtechX RERA verified?', a: 'RealtechX shows real projects with details as their developers publish them, alongside sample listings. Always verify any project on the respective state RERA website before booking.' },
    { q: 'I am a developer or channel partner — can I list my projects?', a: 'Yes. Use the Post Property page or contact our team. We create premium project pages with complete pricing, floor plans and lead capture.' },
    { q: 'How does RealtechX handle my personal data?', a: 'Your details are used only to respond to your enquiry and share relevant property information. Read our Privacy Policy for the full details.' },
  ],
};

export const defaultContact: ContactContent = {
  heroTitle: 'Let’s talk property',
  heroText: 'Questions about a listing, selling your property or a portal for your business — we respond quickly.',
  heroImage: img.commercial[3],
  mapQuery: 'Surat, Gujarat',
  faqs: [
    { q: 'How quickly will someone respond to my enquiry?', a: 'During working hours we usually call back within an hour. Enquiries received late in the evening are answered the next morning.' },
    { q: 'Can I book a site visit through RealtechX?', a: 'Yes. Mention the project and your preferred date in the form, or tap “Book site visit” on any property page. We confirm the slot with you by call or WhatsApp.' },
    { q: 'Can you help me with a home loan?', a: 'We can help you estimate EMI and eligibility and connect you with lenders. Visit the Home Loan page or share your requirement in the form.' },
    { q: 'I want to list my property — whom do I contact?', a: 'Use the Post Property page or send us a message here with the property details. Our listing team will get in touch within 24 hours.' },
    { q: 'Do you offer virtual site visits?', a: 'Yes, for many projects we can arrange a live video walkthrough — ideal for NRI buyers or anyone who cannot visit in person.' },
  ],
};

export const defaultFooter: FooterContent = {
  description:
    'RealtechX is a premium real estate portal to discover residential apartments, commercial spaces, plots, land and luxury villas across India’s top cities.',
  bottomNote: 'Preview portal · Not a RERA-registered agent · Verify every project on the state RERA website.',
};

/** Static pages whose SEO can be edited in Admin → SEO. */
export const seoRoutes: { route: string; label: string; title: string; description: string }[] = [
  { route: '/', label: 'Home', title: 'RealtechX — Premium Real Estate Portal | Buy, Rent & Sell Property in India', description: '' },
  { route: '/properties', label: 'Property search', title: 'Search Properties — Flats, Offices, Plots, Land & Villas', description: '' },
  { route: '/buy', label: 'Buy', title: 'Buy Property — Flats, Villas, Plots, Land & Offices for Sale', description: '' },
  { route: '/rent', label: 'Rent', title: 'Rent Property — Furnished Homes, Villas & Offices for Lease', description: '' },
  { route: '/sell', label: 'Sell / Post property', title: 'Sell or Rent Out Your Property — Post Property Free', description: '' },
  { route: '/developers', label: 'Developers', title: 'Real Estate Developers & Builders', description: '' },
  { route: '/localities', label: 'Localities', title: 'Localities — Explore Property by Locality', description: '' },
  { route: '/home-loan', label: 'Home loan', title: 'Home Loan & EMI Calculator — Check Eligibility & Compare Offers', description: '' },
  { route: '/blog', label: 'Blog', title: 'Real Estate Blog — Buying Guides, Home Loans & Market Insights', description: '' },
  { route: '/about', label: 'About', title: 'About RealtechX — Premium Real Estate Portal', description: '' },
  { route: '/contact', label: 'Contact', title: 'Contact RealtechX', description: '' },
];
