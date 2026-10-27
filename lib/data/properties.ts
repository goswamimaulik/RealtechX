import type { Property, PropertyType } from '../types';
import { img, pick } from './images';
import { slugify } from '../format';

const amenitiesByType: Record<PropertyType, string[]> = {
  residential: [
    'Clubhouse', 'Swimming Pool', 'Gymnasium', 'Kids Play Area', 'Landscaped Gardens', 'Jogging Track',
    '24x7 Security', 'Power Backup', 'Multipurpose Hall', 'Indoor Games', 'Covered Parking', 'EV Charging',
  ],
  commercial: [
    'Double-height Lobby', 'High-speed Elevators', '100% Power Backup', 'Central HVAC', 'Food Court',
    'Multi-level Parking', 'Access Control', 'Fire Safety Systems', 'Conference Centre', 'EV Charging',
  ],
  plot: [
    'Gated Entrance', 'Internal Tar Roads', 'Underground Drainage', 'Street Lighting', 'Water Connection',
    'Electricity Connection', 'Landscaped Parks', 'Clubhouse', 'Jogging Track', 'CCTV Surveillance',
  ],
  land: [
    'Clear Title', 'Road Access', 'Water Source', 'Electricity Nearby', 'Fencing Available',
    'Highway Connectivity', 'Scenic Views', 'Mutation Ready',
  ],
  villa: [
    'Private Garden', 'Private Pool (select units)', 'Home Automation', 'Clubhouse', 'Spa & Sauna',
    'Gymnasium', 'Tennis Court', '24x7 Security', 'Landscaped Avenues', 'Servant Quarters', 'EV Charging',
  ],
};

type Seed = Omit<Property, 'id' | 'slug' | 'localitySlug' | 'amenities' | 'mapQuery' | 'rera'> &
  Partial<Pick<Property, 'amenities' | 'rera'>>;

let n = 0;
function make(s: Seed): Property {
  n += 1;
  return {
    ...s,
    id: 'RTX' + String(1000 + n),
    slug: slugify(`${s.title} ${s.locality} ${s.city}`),
    localitySlug: slugify(s.locality),
    amenities: s.amenities ?? amenitiesByType[s.type],
    mapQuery: `${s.locality}, ${s.city}`,
    rera: s.rera ?? 'Awaiting verification',
  };
}

export const properties: Property[] = [
  // ───────────────────────────── MUMBAI ─────────────────────────────
  make({
    title: 'Skyline Crest Aria',
    tagline: 'Sea-facing 3 & 4 BHK sky residences in Worli',
    type: 'residential', listingFor: 'buy', status: 'new-launch',
    city: 'mumbai', locality: 'Worli', developer: 'skyline-crest-developers',
    priceMin: 68000000, priceMax: 115000000, areaMin: 1650, areaMax: 2600, areaUnit: 'sq.ft', bhk: [3, 4],
    configurations: [
      { label: '3 BHK', area: '1,650 sq.ft', price: '₹6.8 Cr onwards' },
      { label: '3 BHK Grande', area: '1,980 sq.ft', price: '₹8.2 Cr onwards' },
      { label: '4 BHK', area: '2,600 sq.ft', price: '₹11.5 Cr onwards' },
    ],
    possession: 'Dec 2030', landParcel: '2.1 Acres', totalUnits: '186 Residences', images: pick(img.apartment, 0),
    highlights: ['Uninterrupted Arabian Sea views', 'Two residences per floor', 'Sky lounge on the 58th level', '5 minutes to Worli Sea Face'],
    description: [
      'Skyline Crest Aria is a 60-storey residential tower in the heart of Worli designed around the sea. Every home has a private deck and floor-to-ceiling glazing that frames the Arabian Sea and the Bandra–Worli Sea Link.',
      'With only two residences per floor, a dedicated concierge, and a 40,000 sq.ft amenity podium, Aria brings resort-style living to Mumbai’s most connected address — minutes from Lower Parel, BKC and the Coastal Road.',
    ],
    nearby: [{ name: 'Worli Sea Face', distance: '0.5 km' }, { name: 'Coastal Road access', distance: '1 km' }, { name: 'Lower Parel', distance: '3 km' }, { name: 'BKC', distance: '7 km' }],
    featured: true, postedOn: '2026-10-20',
  }),
  make({
    title: 'Coastal One BKC',
    tagline: 'Grade-A office floors for lease in Bandra Kurla Complex',
    type: 'commercial', listingFor: 'rent', status: 'ready-to-move',
    city: 'mumbai', locality: 'Bandra Kurla Complex', developer: 'coastal-estates',
    priceMin: 450000, priceMax: 1200000, areaMin: 1800, areaMax: 5200, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Office Suite', area: '1,800 sq.ft', price: '₹4.5 L /month' },
      { label: 'Office Floor (Half)', area: '3,400 sq.ft', price: '₹8.2 L /month' },
      { label: 'Office Floor (Full)', area: '5,200 sq.ft', price: '₹12 L /month' },
    ],
    possession: 'Immediate', landParcel: '1.4 Acres', totalUnits: '22 Floors', images: pick(img.commercial, 0),
    highlights: ['LEED Gold certified', 'Plug-and-play & warm-shell options', 'Walk to BKC metro', '1:800 parking ratio'],
    description: [
      'Coastal One is a 22-storey Grade-A office building in G Block, Bandra Kurla Complex — Mumbai’s premier financial district. Floor plates are column-free and flexible, ideal for corporate headquarters, financial firms and consulting practices.',
      'Choose fully furnished plug-and-play suites or warm-shell floors for custom fit-outs, with central HVAC, 100% power backup and a business lounge for client meetings.',
    ],
    nearby: [{ name: 'BKC Metro Station', distance: '0.6 km' }, { name: 'Jio World Centre', distance: '1.2 km' }, { name: 'Bandra Station', distance: '3.5 km' }, { name: 'Mumbai Airport (T2)', distance: '6 km' }],
    featured: true, postedOn: '2026-10-18',
  }),
  make({
    title: 'Coastal Greens',
    tagline: 'Gated villa plots near the beach in Alibaug',
    type: 'plot', listingFor: 'buy', status: 'under-construction',
    city: 'mumbai', locality: 'Alibaug', developer: 'coastal-estates',
    priceMin: 6500000, priceMax: 19000000, areaMin: 2000, areaMax: 6000, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Garden Plot', area: '2,000 sq.ft', price: '₹65 L onwards' },
      { label: 'Premium Plot', area: '3,500 sq.ft', price: '₹1.1 Cr onwards' },
      { label: 'Estate Plot', area: '6,000 sq.ft', price: '₹1.9 Cr onwards' },
    ],
    possession: 'Mar 2028', landParcel: '18 Acres', totalUnits: '142 Plots', images: [img.land[0], img.villa[1], img.land[3], img.villa[5], img.land[6]],
    highlights: ['15 min from Mandwa jetty', 'Clubhouse with infinity pool', 'Build your own villa', 'Clear-title NA plots'],
    description: [
      'Coastal Greens is an 18-acre gated plotted community in Alibaug, a short ferry ride from South Mumbai. Plots come with internal roads, underground utilities and landscaped parks — ready for you to build a weekend villa.',
      'With the Mumbai Trans Harbour Link and the Mandwa ferry, Alibaug has become Mumbai’s favourite second-home destination, and plotted developments here continue to see steady appreciation.',
    ],
    nearby: [{ name: 'Mandwa Jetty', distance: '9 km' }, { name: 'Kihim Beach', distance: '3 km' }, { name: 'Alibaug Town', distance: '6 km' }, { name: 'MTHL (Chirle)', distance: '55 km' }],
    featured: false, postedOn: '2026-10-11',
  }),
  make({
    title: 'Karjat Riverside Estates',
    tagline: 'Riverside land parcels in the Sahyadri foothills',
    type: 'land', listingFor: 'buy', status: 'ready-to-move',
    city: 'mumbai', locality: 'Karjat', developer: 'coastal-estates',
    priceMin: 4500000, priceMax: 42000000, areaMin: 0.5, areaMax: 5, areaUnit: 'acre', bhk: [],
    configurations: [
      { label: 'Half-acre Parcel', area: '0.5 acre', price: '₹45 L onwards' },
      { label: '2-acre Parcel', area: '2 acres', price: '₹1.7 Cr onwards' },
      { label: '5-acre Estate', area: '5 acres', price: '₹4.2 Cr onwards' },
    ],
    possession: 'Immediate', landParcel: '60 Acres', totalUnits: '28 Parcels', images: pick(img.land, 1),
    highlights: ['River frontage on select parcels', '2 hours from South Mumbai', 'Ideal for farmhouse or retreat', 'Clear 7/12 extracts'],
    description: [
      'Karjat Riverside Estates offers clear-title land parcels along the Ulhas river, surrounded by the Sahyadri hills. Parcels range from half an acre to five acres — ideal for farmhouses, wellness retreats or long-term land banking.',
      'Karjat is well connected via the Mumbai–Pune Expressway and the Central Railway suburban line, making it one of the most popular land markets in the MMR.',
    ],
    nearby: [{ name: 'Karjat Station', distance: '7 km' }, { name: 'Mumbai–Pune Expressway', distance: '18 km' }, { name: 'Matheran', distance: '25 km' }, { name: 'Navi Mumbai Airport', distance: '45 km' }],
    featured: false, postedOn: '2026-10-05',
  }),
  make({
    title: 'Skyline Crest Bay Villas',
    tagline: 'Sea-front 5 BHK villas on Madh Island',
    type: 'villa', listingFor: 'buy', status: 'ready-to-move',
    city: 'mumbai', locality: 'Madh Island', developer: 'skyline-crest-developers',
    priceMin: 140000000, priceMax: 220000000, areaMin: 5200, areaMax: 8400, areaUnit: 'sq.ft', bhk: [5],
    configurations: [
      { label: '5 BHK Villa', area: '5,200 sq.ft', price: '₹14 Cr onwards' },
      { label: '5 BHK Sea-front Villa', area: '8,400 sq.ft', price: '₹22 Cr onwards' },
    ],
    possession: 'Ready', landParcel: '6 Acres', totalUnits: '14 Villas', images: pick(img.villa, 0),
    highlights: ['Direct beach access', 'Private pool in every villa', 'Only 14 villas', 'Smart home automation'],
    description: [
      'Skyline Crest Bay Villas is an exclusive enclave of 14 sea-front villas on Madh Island. Each villa has a private pool, landscaped garden and a rooftop terrace overlooking the Arabian Sea.',
      'A rare ready-to-move opportunity for families seeking privacy and space within city limits, with quick access to Malad, Versova and the Western Express Highway.',
    ],
    nearby: [{ name: 'Madh Jetty', distance: '3 km' }, { name: 'Malad West', distance: '9 km' }, { name: 'Versova', distance: '10 km' }, { name: 'Mumbai Airport', distance: '20 km' }],
    featured: true, postedOn: '2026-10-22',
  }),

  // ───────────────────────────── PUNE ─────────────────────────────
  make({
    title: 'Aurum Vista',
    tagline: 'Premium 2 & 3 BHK homes in Baner',
    type: 'residential', listingFor: 'buy', status: 'under-construction',
    city: 'pune', locality: 'Baner', developer: 'aurum-realty',
    priceMin: 11500000, priceMax: 21000000, areaMin: 850, areaMax: 1450, areaUnit: 'sq.ft', bhk: [2, 3],
    configurations: [
      { label: '2 BHK', area: '850 sq.ft', price: '₹1.15 Cr onwards' },
      { label: '3 BHK', area: '1,180 sq.ft', price: '₹1.6 Cr onwards' },
      { label: '3 BHK Premium', area: '1,450 sq.ft', price: '₹2.1 Cr onwards' },
    ],
    possession: 'Jun 2028', landParcel: '4.5 Acres', totalUnits: '420 Homes', images: pick(img.apartment, 2),
    highlights: ['Hill views from every home', '70% open space', '5 min to Baner–Balewadi High Street', 'Near Hinjewadi IT Park'],
    description: [
      'Aurum Vista brings four elegant towers to Baner, one of Pune’s most sought-after neighbourhoods. Homes are Vastu-friendly with wide balconies, and 70% of the land is dedicated to open green spaces.',
      'Walk to cafés on Baner–Balewadi High Street and reach Hinjewadi IT Park in under 20 minutes, with schools, hospitals and the upcoming metro line all close by.',
    ],
    nearby: [{ name: 'Balewadi High Street', distance: '1.5 km' }, { name: 'Hinjewadi Phase 1', distance: '7 km' }, { name: 'Mumbai–Bangalore Highway', distance: '2 km' }, { name: 'Pune University', distance: '6 km' }],
    featured: true, postedOn: '2026-10-19',
  }),
  make({
    title: 'Aurum Business Bay',
    tagline: 'Offices & high-street retail in Kharadi',
    type: 'commercial', listingFor: 'buy', status: 'new-launch',
    city: 'pune', locality: 'Kharadi', developer: 'aurum-realty',
    priceMin: 8500000, priceMax: 45000000, areaMin: 600, areaMax: 3500, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Office Space', area: '600 sq.ft', price: '₹85 L onwards' },
      { label: 'Retail Shop', area: '900 sq.ft', price: '₹1.6 Cr onwards' },
      { label: 'Large Office', area: '3,500 sq.ft', price: '₹4.5 Cr onwards' },
    ],
    possession: 'Dec 2029', landParcel: '3 Acres', totalUnits: '310 Units', images: pick(img.commercial, 1),
    highlights: ['Opposite EON IT Park', 'High-street retail frontage', 'Pre-leased options', 'Strong rental yields'],
    description: [
      'Aurum Business Bay is a mixed commercial development in Kharadi’s business district, offering small and large office spaces along with double-height high-street retail.',
      'Kharadi’s IT parks bring a large daily workforce, making it one of Pune’s strongest markets for office leasing and retail footfall.',
    ],
    nearby: [{ name: 'EON IT Park', distance: '0.3 km' }, { name: 'World Trade Center Pune', distance: '1 km' }, { name: 'Pune Airport', distance: '9 km' }, { name: 'Magarpatta City', distance: '7 km' }],
    featured: false, postedOn: '2026-10-14',
  }),
  make({
    title: 'Aurum Meadows',
    tagline: 'NA bungalow plots near Hinjewadi',
    type: 'plot', listingFor: 'buy', status: 'ready-to-move',
    city: 'pune', locality: 'Maan', developer: 'aurum-realty',
    priceMin: 3800000, priceMax: 9200000, areaMin: 1500, areaMax: 3500, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Plot', area: '1,500 sq.ft', price: '₹38 L onwards' },
      { label: 'Plot', area: '2,500 sq.ft', price: '₹64 L onwards' },
      { label: 'Corner Plot', area: '3,500 sq.ft', price: '₹92 L onwards' },
    ],
    possession: 'Ready for construction', landParcel: '12 Acres', totalUnits: '160 Plots', images: [img.land[3], img.villa[6], img.land[0], img.villa[4], img.land[4]],
    highlights: ['PMRDA approved layout', '5 min to Hinjewadi Phase 3', 'Bank loan available', 'Clubhouse & gardens'],
    description: [
      'Aurum Meadows is a 12-acre gated plotted layout in Maan, right next to Hinjewadi Phase 3. Plots are ready for construction with internal roads, drainage and electricity in place.',
      'Ideal for IT professionals planning to build their own bungalow close to work, or for investors looking at West Pune’s growth.',
    ],
    nearby: [{ name: 'Hinjewadi Phase 3', distance: '2 km' }, { name: 'Wakad', distance: '12 km' }, { name: 'Mumbai–Pune Expressway', distance: '14 km' }, { name: 'Pune Metro Line 3', distance: '3 km' }],
    featured: false, postedOn: '2026-10-08',
  }),
  make({
    title: 'Mulshi Valley Farmland',
    tagline: 'Lake-view farmland parcels in Mulshi',
    type: 'land', listingFor: 'buy', status: 'ready-to-move',
    city: 'pune', locality: 'Mulshi', developer: 'aurum-realty',
    priceMin: 3500000, priceMax: 28000000, areaMin: 0.25, areaMax: 3, areaUnit: 'acre', bhk: [],
    configurations: [
      { label: 'Quarter-acre Parcel', area: '0.25 acre', price: '₹35 L onwards' },
      { label: '1-acre Parcel', area: '1 acre', price: '₹1.1 Cr onwards' },
      { label: '3-acre Estate', area: '3 acres', price: '₹2.8 Cr onwards' },
    ],
    possession: 'Immediate', landParcel: '40 Acres', totalUnits: '36 Parcels', images: pick(img.land, 4),
    highlights: ['Views of Mulshi lake', '45 min from Hinjewadi', 'Perfect for farmhouse', 'Clear title & demarcated'],
    description: [
      'Mulshi Valley Farmland offers demarcated land parcels overlooking the Mulshi lake and the Western Ghats — one of Pune’s most scenic getaways.',
      'Parcels come with road access and fencing options, ideal for a weekend farmhouse, homestay or long-term land investment.',
    ],
    nearby: [{ name: 'Mulshi Dam', distance: '4 km' }, { name: 'Hinjewadi', distance: '30 km' }, { name: 'Tamhini Ghat', distance: '12 km' }, { name: 'Lavasa', distance: '25 km' }],
    featured: false, postedOn: '2026-10-02',
  }),
  make({
    title: 'Aurum Estate Villas',
    tagline: 'Hillside 4 & 5 BHK villas in Bavdhan',
    type: 'villa', listingFor: 'buy', status: 'under-construction',
    city: 'pune', locality: 'Bavdhan', developer: 'aurum-realty',
    priceMin: 42000000, priceMax: 68000000, areaMin: 3800, areaMax: 5600, areaUnit: 'sq.ft', bhk: [4, 5],
    configurations: [
      { label: '4 BHK Villa', area: '3,800 sq.ft', price: '₹4.2 Cr onwards' },
      { label: '5 BHK Villa', area: '5,600 sq.ft', price: '₹6.8 Cr onwards' },
    ],
    possession: 'Sep 2028', landParcel: '9 Acres', totalUnits: '48 Villas', images: pick(img.villa, 3),
    highlights: ['Hillside location with valley views', 'Private lift in every villa', 'Clubhouse with spa', '10 min to Kothrud & Baner'],
    description: [
      'Aurum Estate Villas is a gated community of 48 contemporary villas set on the slopes of Bavdhan, overlooking the NDA hills.',
      'Each villa has a private lift, double-height living room and landscaped garden — combining the privacy of a bungalow with the security of a managed community.',
    ],
    nearby: [{ name: 'Chandni Chowk', distance: '2 km' }, { name: 'Kothrud', distance: '5 km' }, { name: 'Baner', distance: '8 km' }, { name: 'Mumbai–Bangalore Highway', distance: '2 km' }],
    featured: true, postedOn: '2026-10-16',
  }),

  // ───────────────────────────── BANGALORE ─────────────────────────────
  make({
    title: 'Verdant Residences',
    tagline: 'Fully furnished 2 & 3 BHK for rent in Indiranagar',
    type: 'residential', listingFor: 'rent', status: 'ready-to-move',
    city: 'bangalore', locality: 'Indiranagar', developer: 'verdant-habitats',
    priceMin: 85000, priceMax: 160000, areaMin: 1250, areaMax: 2100, areaUnit: 'sq.ft', bhk: [2, 3],
    configurations: [
      { label: '2 BHK Furnished', area: '1,250 sq.ft', price: '₹85K /month' },
      { label: '3 BHK Furnished', area: '1,750 sq.ft', price: '₹1.25 L /month' },
      { label: '3 BHK Penthouse', area: '2,100 sq.ft', price: '₹1.6 L /month' },
    ],
    possession: 'Immediate', landParcel: '1.2 Acres', totalUnits: '64 Homes', images: pick(img.apartment, 4),
    highlights: ['Fully furnished & move-in ready', 'Walk to 100 Feet Road', 'Pet friendly', 'Managed maintenance'],
    description: [
      'Verdant Residences offers fully furnished rental apartments in a quiet lane of Indiranagar, steps from the cafés and boutiques of 100 Feet Road and 12th Main.',
      'Ideal for working professionals and expat families — every home comes with modular kitchens, wardrobes, air-conditioning and dedicated parking.',
    ],
    nearby: [{ name: 'Indiranagar Metro', distance: '0.8 km' }, { name: '100 Feet Road', distance: '0.4 km' }, { name: 'MG Road', distance: '5 km' }, { name: 'Embassy GolfLinks', distance: '4 km' }],
    featured: true, postedOn: '2026-10-21',
  }),
  make({
    title: 'Verdant Tech Park',
    tagline: 'Green-certified office spaces in Whitefield',
    type: 'commercial', listingFor: 'buy', status: 'under-construction',
    city: 'bangalore', locality: 'Whitefield', developer: 'verdant-habitats',
    priceMin: 12000000, priceMax: 80000000, areaMin: 1000, areaMax: 6500, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Office Space', area: '1,000 sq.ft', price: '₹1.2 Cr onwards' },
      { label: 'Office Space', area: '2,800 sq.ft', price: '₹3.4 Cr onwards' },
      { label: 'Full Floor', area: '6,500 sq.ft', price: '₹8 Cr onwards' },
    ],
    possession: 'Mar 2029', landParcel: '5 Acres', totalUnits: '2 Towers', images: pick(img.commercial, 2),
    highlights: ['IGBC Platinum pre-certified', 'Near Whitefield metro', 'Lease assistance', 'Tech-ready infrastructure'],
    description: [
      'Verdant Tech Park is a twin-tower office campus in Whitefield designed for technology companies and startups. The campus is pre-certified IGBC Platinum, with solar generation and smart energy management.',
      'Investors can buy strata office units with lease-assistance programmes, while end users get flexible floor plates close to Whitefield metro and ITPL.',
    ],
    nearby: [{ name: 'Whitefield Metro', distance: '1 km' }, { name: 'ITPL', distance: '2 km' }, { name: 'Phoenix Marketcity', distance: '6 km' }, { name: 'Outer Ring Road', distance: '8 km' }],
    featured: false, postedOn: '2026-10-12',
  }),
  make({
    title: 'Verdant Airport Plots',
    tagline: 'BIAAPA-approved plots near Kempegowda Airport',
    type: 'plot', listingFor: 'buy', status: 'new-launch',
    city: 'bangalore', locality: 'Devanahalli', developer: 'verdant-habitats',
    priceMin: 4800000, priceMax: 13500000, areaMin: 1200, areaMax: 4000, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Plot (30x40)', area: '1,200 sq.ft', price: '₹48 L onwards' },
      { label: 'Plot (40x60)', area: '2,400 sq.ft', price: '₹92 L onwards' },
      { label: 'Plot (50x80)', area: '4,000 sq.ft', price: '₹1.35 Cr onwards' },
    ],
    possession: 'Dec 2027', landParcel: '25 Acres', totalUnits: '310 Plots', images: [img.land[6], img.villa[2], img.land[1], img.villa[7], img.land[5]],
    highlights: ['15 min to the airport', 'Near Aerospace SEZ', 'Clubhouse & sports courts', 'Launch pricing'],
    description: [
      'Verdant Airport Plots is a 25-acre gated plotted layout in Devanahalli — North Bangalore’s fastest-growing corridor, anchored by Kempegowda International Airport and the Aerospace SEZ.',
      'Standard Bangalore plot sizes, wide internal roads and a clubhouse make it ideal for building your home or investing ahead of the region’s infrastructure growth.',
    ],
    nearby: [{ name: 'Kempegowda Airport', distance: '10 km' }, { name: 'Aerospace SEZ', distance: '6 km' }, { name: 'Hebbal', distance: '28 km' }, { name: 'Nandi Hills', distance: '22 km' }],
    featured: true, postedOn: '2026-10-23',
  }),
  make({
    title: 'Kanakapura Greens',
    tagline: 'Agricultural land parcels on Kanakapura Road',
    type: 'land', listingFor: 'buy', status: 'ready-to-move',
    city: 'bangalore', locality: 'Kanakapura Road', developer: 'verdant-habitats',
    priceMin: 6000000, priceMax: 75000000, areaMin: 1, areaMax: 10, areaUnit: 'acre', bhk: [],
    configurations: [
      { label: '1-acre Parcel', area: '1 acre', price: '₹60 L onwards' },
      { label: '4-acre Parcel', area: '4 acres', price: '₹2.8 Cr onwards' },
      { label: '10-acre Estate', area: '10 acres', price: '₹7.5 Cr onwards' },
    ],
    possession: 'Immediate', landParcel: '120 Acres', totalUnits: '40 Parcels', images: pick(img.land, 2),
    highlights: ['Near Art of Living ashram', 'Metro extension corridor', 'Fertile red soil', 'Borewell available'],
    description: [
      'Kanakapura Greens offers agricultural land parcels on Bangalore’s scenic Kanakapura Road — a popular corridor for farmhouses and managed farmland.',
      'With the metro now reaching Silk Institute and continued residential growth along the road, land here is a strong long-term hold.',
    ],
    nearby: [{ name: 'Silk Institute Metro', distance: '14 km' }, { name: 'Art of Living Ashram', distance: '6 km' }, { name: 'NICE Road', distance: '12 km' }, { name: 'Bannerghatta National Park', distance: '18 km' }],
    featured: false, postedOn: '2026-09-30',
  }),
  make({
    title: 'Verdant Villas',
    tagline: 'Contemporary 4 BHK villas on Sarjapur Road',
    type: 'villa', listingFor: 'buy', status: 'under-construction',
    city: 'bangalore', locality: 'Sarjapur Road', developer: 'verdant-habitats',
    priceMin: 34000000, priceMax: 52000000, areaMin: 3400, areaMax: 4600, areaUnit: 'sq.ft', bhk: [4],
    configurations: [
      { label: '4 BHK Villa', area: '3,400 sq.ft', price: '₹3.4 Cr onwards' },
      { label: '4 BHK Villa + Study', area: '4,600 sq.ft', price: '₹5.2 Cr onwards' },
    ],
    possession: 'Dec 2028', landParcel: '14 Acres', totalUnits: '96 Villas', images: pick(img.villa, 5),
    highlights: ['Near Wipro & RGA Tech Park', 'International schools nearby', '25,000 sq.ft clubhouse', 'IGBC green-rated'],
    description: [
      'Verdant Villas is a 14-acre villa community on Sarjapur Road surrounded by tech parks and some of Bangalore’s best international schools.',
      'Each villa is designed with a private garden, a home office and a terrace lounge — perfect for families who want space without leaving the city’s job hubs.',
    ],
    nearby: [{ name: 'Wipro Corporate Office', distance: '4 km' }, { name: 'RGA Tech Park', distance: '5 km' }, { name: 'Outer Ring Road', distance: '9 km' }, { name: 'Electronic City', distance: '15 km' }],
    featured: false, postedOn: '2026-10-09',
  }),

  // ───────────────────────────── HYDERABAD ─────────────────────────────
  make({
    title: 'Deccan Skyvue',
    tagline: 'Ultra-luxury 3 & 4 BHK sky residences in Kokapet',
    type: 'residential', listingFor: 'buy', status: 'new-launch',
    city: 'hyderabad', locality: 'Kokapet', developer: 'deccan-heights-group',
    priceMin: 26000000, priceMax: 49000000, areaMin: 2400, areaMax: 4500, areaUnit: 'sq.ft', bhk: [3, 4],
    configurations: [
      { label: '3 BHK', area: '2,400 sq.ft', price: '₹2.6 Cr onwards' },
      { label: '4 BHK', area: '3,400 sq.ft', price: '₹3.7 Cr onwards' },
      { label: '4 BHK Sky Villa', area: '4,500 sq.ft', price: '₹4.9 Cr onwards' },
    ],
    possession: 'Jun 2030', landParcel: '7 Acres', totalUnits: '520 Residences', images: pick(img.apartment, 6),
    highlights: ['55-storey towers', 'Views of Gandipet lake', 'Near Financial District', '1 lakh sq.ft amenities'],
    description: [
      'Deccan Skyvue rises 55 storeys in Kokapet’s Neopolis layout, with sweeping views of Gandipet lake and the Financial District skyline.',
      'Spacious 3 and 4 BHK homes with private decks, a 1-lakh sq.ft amenity zone and quick access to the Outer Ring Road make Skyvue one of Hyderabad’s most premium addresses.',
    ],
    nearby: [{ name: 'Financial District', distance: '3 km' }, { name: 'Outer Ring Road', distance: '1.5 km' }, { name: 'Gandipet Lake', distance: '4 km' }, { name: 'Rajiv Gandhi Intl Airport', distance: '28 km' }],
    featured: true, postedOn: '2026-10-24',
  }),
  make({
    title: 'Deccan Square',
    tagline: 'Furnished office spaces for lease in HITEC City',
    type: 'commercial', listingFor: 'rent', status: 'ready-to-move',
    city: 'hyderabad', locality: 'HITEC City', developer: 'deccan-heights-group',
    priceMin: 110000, priceMax: 900000, areaMin: 1500, areaMax: 12000, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Office Suite', area: '1,500 sq.ft', price: '₹1.1 L /month' },
      { label: 'Office Floor', area: '6,000 sq.ft', price: '₹4.6 L /month' },
      { label: 'Large Floor', area: '12,000 sq.ft', price: '₹9 L /month' },
    ],
    possession: 'Immediate', landParcel: '2.5 Acres', totalUnits: '18 Floors', images: pick(img.commercial, 3),
    highlights: ['Walk to HITEC City metro', 'Furnished & bare-shell options', 'Food court & crèche', '24x7 operations ready'],
    description: [
      'Deccan Square is an 18-floor office tower in the heart of HITEC City, built for technology and GCC operations that run around the clock.',
      'Lease a furnished suite for a growing team or a full floor for an enterprise campus, with metro, malls and hotels all within walking distance.',
    ],
    nearby: [{ name: 'HITEC City Metro', distance: '0.5 km' }, { name: 'Inorbit Mall', distance: '1.5 km' }, { name: 'Gachibowli', distance: '4 km' }, { name: 'Jubilee Hills', distance: '6 km' }],
    featured: false, postedOn: '2026-10-13',
  }),
  make({
    title: 'Deccan Meadows',
    tagline: 'HMDA-approved plots in Shadnagar',
    type: 'plot', listingFor: 'buy', status: 'new-launch',
    city: 'hyderabad', locality: 'Shadnagar', developer: 'deccan-heights-group',
    priceMin: 3200000, priceMax: 8500000, areaMin: 1800, areaMax: 4500, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Plot (200 sq.yd)', area: '1,800 sq.ft', price: '₹32 L onwards' },
      { label: 'Plot (300 sq.yd)', area: '2,700 sq.ft', price: '₹51 L onwards' },
      { label: 'Plot (500 sq.yd)', area: '4,500 sq.ft', price: '₹85 L onwards' },
    ],
    possession: 'Sep 2027', landParcel: '30 Acres', totalUnits: '380 Plots', images: [img.land[1], img.villa[0], img.land[4], img.villa[3], img.land[2]],
    highlights: ['On Bangalore Highway (NH-44)', 'Near Pharma City & industrial hub', '40-ft internal roads', 'Easy bank loans'],
    description: [
      'Deccan Meadows is a 30-acre HMDA-approved plotted venture in Shadnagar, on the Hyderabad–Bangalore highway and close to the city’s new industrial and logistics clusters.',
      'An affordable entry point into Hyderabad real estate with full infrastructure and a clubhouse planned within the layout.',
    ],
    nearby: [{ name: 'NH-44', distance: '1 km' }, { name: 'Rajiv Gandhi Intl Airport', distance: '35 km' }, { name: 'Shamshabad', distance: '30 km' }, { name: 'Shadnagar Town', distance: '4 km' }],
    featured: false, postedOn: '2026-10-07',
  }),
  make({
    title: 'Shamshabad Highway Land',
    tagline: 'Highway-facing land parcels near the airport',
    type: 'land', listingFor: 'buy', status: 'ready-to-move',
    city: 'hyderabad', locality: 'Shamshabad', developer: 'deccan-heights-group',
    priceMin: 12000000, priceMax: 90000000, areaMin: 1, areaMax: 8, areaUnit: 'acre', bhk: [],
    configurations: [
      { label: '1-acre Parcel', area: '1 acre', price: '₹1.2 Cr onwards' },
      { label: '3-acre Parcel', area: '3 acres', price: '₹3.4 Cr onwards' },
      { label: '8-acre Parcel', area: '8 acres', price: '₹9 Cr onwards' },
    ],
    possession: 'Immediate', landParcel: '45 Acres', totalUnits: '12 Parcels', images: pick(img.land, 5),
    highlights: ['Highway frontage', 'Suitable for warehousing', '10 min to airport', 'Clear Dharani records'],
    description: [
      'Highway-facing land parcels near Shamshabad, minutes from Rajiv Gandhi International Airport — suitable for warehousing, hospitality or long-term investment.',
      'The airport and logistics ecosystem around Shamshabad continue to drive land demand in this corridor.',
    ],
    nearby: [{ name: 'Rajiv Gandhi Intl Airport', distance: '6 km' }, { name: 'Outer Ring Road', distance: '4 km' }, { name: 'Financial District', distance: '30 km' }, { name: 'Shamshabad Town', distance: '3 km' }],
    featured: false, postedOn: '2026-09-28',
  }),
  make({
    title: 'Deccan Manor',
    tagline: '5 BHK luxury villa for rent in Jubilee Hills',
    type: 'villa', listingFor: 'rent', status: 'ready-to-move',
    city: 'hyderabad', locality: 'Jubilee Hills', developer: 'deccan-heights-group',
    priceMin: 350000, priceMax: 500000, areaMin: 6000, areaMax: 8500, areaUnit: 'sq.ft', bhk: [5],
    configurations: [
      { label: '5 BHK Villa', area: '6,000 sq.ft', price: '₹3.5 L /month' },
      { label: '5 BHK Villa + Pool', area: '8,500 sq.ft', price: '₹5 L /month' },
    ],
    possession: 'Immediate', landParcel: '1,000 sq.yd plots', totalUnits: '4 Villas', images: pick(img.villa, 6),
    highlights: ['Prime Road No. 36 address', 'Private pool & home theatre', 'Semi-furnished', 'Staff quarters & 4-car parking'],
    description: [
      'Deccan Manor offers four architect-designed villas for lease in Jubilee Hills, Hyderabad’s most prestigious residential neighbourhood.',
      'Ideal for CXOs, diplomats and families relocating to Hyderabad, with private pools, landscaped gardens and full staff quarters.',
    ],
    nearby: [{ name: 'Jubilee Hills Checkpost', distance: '1 km' }, { name: 'KBR Park', distance: '2 km' }, { name: 'HITEC City', distance: '6 km' }, { name: 'Banjara Hills', distance: '3 km' }],
    featured: true, postedOn: '2026-10-17',
  }),

  // ───────────────────────────── GUJARAT ─────────────────────────────
  make({
    title: 'Sabarmati Elysium',
    tagline: 'Luxury 3 & 4 BHK on Sindhu Bhavan Road',
    type: 'residential', listingFor: 'buy', status: 'under-construction',
    city: 'ahmedabad', locality: 'Sindhu Bhavan Road', developer: 'sabarmati-spaces',
    priceMin: 16000000, priceMax: 32000000, areaMin: 2100, areaMax: 3600, areaUnit: 'sq.ft', bhk: [3, 4],
    configurations: [
      { label: '3 BHK', area: '2,100 sq.ft', price: '₹1.6 Cr onwards' },
      { label: '4 BHK', area: '2,900 sq.ft', price: '₹2.3 Cr onwards' },
      { label: '4 BHK Penthouse', area: '3,600 sq.ft', price: '₹3.2 Cr onwards' },
    ],
    possession: 'Mar 2029', landParcel: '3.8 Acres', totalUnits: '168 Residences', images: pick(img.apartment, 8),
    highlights: ['Ahmedabad’s premium address', 'Only 2 homes per floor', 'Rooftop infinity pool', '5 min to SG Highway'],
    description: [
      'Sabarmati Elysium is a collection of luxury residences on Sindhu Bhavan Road — Ahmedabad’s most premium dining and lifestyle boulevard.',
      'With only two homes per floor, private lift lobbies and a rooftop infinity pool, Elysium is designed for families who value space and privacy.',
    ],
    nearby: [{ name: 'SG Highway', distance: '1.5 km' }, { name: 'Bodakdev', distance: '2 km' }, { name: 'Thaltej Metro', distance: '3 km' }, { name: 'Ahmedabad Airport', distance: '18 km' }],
    featured: true, postedOn: '2026-10-25',
  }),
  make({
    title: 'Sabarmati Corporate Park',
    tagline: 'Office spaces for lease on SG Highway',
    type: 'commercial', listingFor: 'rent', status: 'ready-to-move',
    city: 'ahmedabad', locality: 'SG Highway', developer: 'sabarmati-spaces',
    priceMin: 55000, priceMax: 420000, areaMin: 800, areaMax: 7000, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Office Space', area: '800 sq.ft', price: '₹55K /month' },
      { label: 'Office Space', area: '2,500 sq.ft', price: '₹1.6 L /month' },
      { label: 'Full Floor', area: '7,000 sq.ft', price: '₹4.2 L /month' },
    ],
    possession: 'Immediate', landParcel: '2 Acres', totalUnits: '14 Floors', images: pick(img.commercial, 4),
    highlights: ['SG Highway frontage', 'Furnished options available', 'Ample visitor parking', 'Near Iscon Cross Roads'],
    description: [
      'Sabarmati Corporate Park is a 14-storey office building with direct SG Highway frontage — Ahmedabad’s main business corridor.',
      'Choose from compact furnished offices to full floors, with high-speed lifts, central air-conditioning and dedicated parking.',
    ],
    nearby: [{ name: 'Iscon Cross Roads', distance: '1 km' }, { name: 'Prahlad Nagar', distance: '2 km' }, { name: 'Sindhu Bhavan Road', distance: '3 km' }, { name: 'GIFT City', distance: '28 km' }],
    featured: false, postedOn: '2026-10-15',
  }),
  make({
    title: 'Sabarmati Greens',
    tagline: 'Gated township plots in Sanand',
    type: 'plot', listingFor: 'buy', status: 'new-launch',
    city: 'ahmedabad', locality: 'Sanand', developer: 'sabarmati-spaces',
    priceMin: 2800000, priceMax: 7500000, areaMin: 1500, areaMax: 4000, areaUnit: 'sq.ft', bhk: [],
    configurations: [
      { label: 'Plot', area: '1,500 sq.ft', price: '₹28 L onwards' },
      { label: 'Plot', area: '2,500 sq.ft', price: '₹46 L onwards' },
      { label: 'Plot', area: '4,000 sq.ft', price: '₹75 L onwards' },
    ],
    possession: 'Jun 2027', landParcel: '35 Acres', totalUnits: '420 Plots', images: [img.land[2], img.villa[4], img.land[6], img.villa[1], img.land[0]],
    highlights: ['AUDA approved', 'Near Sanand industrial estate', 'Clubhouse & sports zone', 'Bank loan eligible'],
    description: [
      'Sabarmati Greens is a 35-acre gated township of residential plots in Sanand — the growth engine west of Ahmedabad with major automobile and electronics manufacturing.',
      'Strong job creation, the ring road and planned infrastructure make Sanand one of Gujarat’s most promising plot markets.',
    ],
    nearby: [{ name: 'Sanand GIDC', distance: '6 km' }, { name: 'SP Ring Road', distance: '12 km' }, { name: 'SG Highway', distance: '18 km' }, { name: 'Ahmedabad Airport', distance: '35 km' }],
    featured: false, postedOn: '2026-10-10',
  }),
  make({
    title: 'Tapi Riverfront Land',
    tagline: 'Land parcels in Olpad, Surat',
    type: 'land', listingFor: 'buy', status: 'ready-to-move',
    city: 'surat', locality: 'Olpad', developer: 'tapi-riverfront-builders',
    priceMin: 5500000, priceMax: 60000000, areaMin: 1, areaMax: 12, areaUnit: 'acre', bhk: [],
    configurations: [
      { label: '1-acre Parcel', area: '1 acre', price: '₹55 L onwards' },
      { label: '5-acre Parcel', area: '5 acres', price: '₹2.6 Cr onwards' },
      { label: '12-acre Parcel', area: '12 acres', price: '₹6 Cr onwards' },
    ],
    possession: 'Immediate', landParcel: '90 Acres', totalUnits: '18 Parcels', images: pick(img.land, 0),
    highlights: ['Close to Hazira industrial belt', 'Coastal highway access', 'Clear title', 'Ideal for farmhouse or industrial use'],
    description: [
      'Tapi Riverfront Land offers clear-title land parcels in Olpad, north-west of Surat, with access to the coastal highway and the Hazira industrial region.',
      'Suitable for farmhouses, warehousing or long-term investment in one of India’s fastest-growing cities.',
    ],
    nearby: [{ name: 'Surat City Centre', distance: '22 km' }, { name: 'Hazira', distance: '30 km' }, { name: 'Surat Airport', distance: '28 km' }, { name: 'Dumas Beach', distance: '32 km' }],
    featured: false, postedOn: '2026-10-04',
  }),
  make({
    title: 'Tapi Riverfront Villas',
    tagline: 'Smart 4 & 5 BHK villas in Vesu',
    type: 'villa', listingFor: 'buy', status: 'under-construction',
    city: 'surat', locality: 'Vesu', developer: 'tapi-riverfront-builders',
    priceMin: 31000000, priceMax: 54000000, areaMin: 3600, areaMax: 5200, areaUnit: 'sq.ft', bhk: [4, 5],
    configurations: [
      { label: '4 BHK Villa', area: '3,600 sq.ft', price: '₹3.1 Cr onwards' },
      { label: '5 BHK Villa', area: '5,200 sq.ft', price: '₹5.4 Cr onwards' },
    ],
    possession: 'Dec 2028', landParcel: '11 Acres', totalUnits: '62 Villas', images: pick(img.villa, 2),
    highlights: ['Surat’s most premium locality', 'Home automation in every villa', 'Riverfront promenade nearby', 'Private gardens & terraces'],
    description: [
      'Tapi Riverfront Villas is a gated community of 62 smart villas in Vesu, Surat’s premier residential neighbourhood close to the Tapi riverfront and VR Mall.',
      'Every villa features home automation, private gardens and expansive terraces, with a clubhouse, spa and sports facilities within the community.',
    ],
    nearby: [{ name: 'VR Mall', distance: '2 km' }, { name: 'Surat Airport', distance: '7 km' }, { name: 'Tapi Riverfront', distance: '3 km' }, { name: 'Dumas Road', distance: '1 km' }],
    featured: true, postedOn: '2026-10-26',
  }),
];

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);

export function filterProperties(f: {
  type?: string;
  city?: string;
  locality?: string;
  status?: string;
  developer?: string;
  listingFor?: string;
}) {
  return properties.filter(
    (p) =>
      (!f.type || p.type === f.type) &&
      (!f.city || p.city === f.city) &&
      (!f.locality || p.localitySlug === f.locality) &&
      (!f.status || p.status === f.status) &&
      (!f.developer || p.developer === f.developer) &&
      (!f.listingFor || p.listingFor === f.listingFor),
  );
}

export function localitiesOf(city: string) {
  const map = new Map<string, string>();
  properties.filter((p) => p.city === city).forEach((p) => map.set(p.localitySlug, p.locality));
  return Array.from(map, ([slug, name]) => ({ slug, name }));
}

export function allLocalities() {
  const map = new Map<string, { city: string; slug: string; name: string }>();
  properties.forEach((p) => map.set(p.city + '/' + p.localitySlug, { city: p.city, slug: p.localitySlug, name: p.locality }));
  return Array.from(map.values());
}
