import type { Developer } from '../types';
import { img } from './images';

// Sample developer profiles for the preview portal.
export const developers: Developer[] = [
  {
    slug: 'skyline-crest-developers',
    name: 'Skyline Crest Developers',
    city: 'mumbai',
    established: 2004,
    tagline: 'Landmark sky residences on the Mumbai skyline',
    about:
      'Skyline Crest Developers builds high-rise luxury residences in South and Central Mumbai. The group is known for sea-facing floor plates, double-height lobbies and concierge-led living, with a design team that works with international architecture studios.',
    specialties: ['Luxury high-rise', 'Sea-facing residences', 'Concierge living'],
    cover: img.apartment[0],
  },
  {
    slug: 'coastal-estates',
    name: 'Coastal Estates',
    city: 'mumbai',
    established: 2009,
    tagline: 'Offices, plotted communities and land across the MMR coast',
    about:
      'Coastal Estates develops Grade-A commercial assets in the Bandra Kurla Complex and curated plotted and land opportunities in Alibaug, Karjat and the wider Mumbai Metropolitan Region.',
    specialties: ['Grade-A offices', 'Plotted developments', 'Weekend homes'],
    cover: img.commercial[0],
  },
  {
    slug: 'aurum-realty',
    name: 'Aurum Realty',
    city: 'pune',
    established: 2011,
    tagline: 'Thoughtful homes for Pune’s IT corridors',
    about:
      'Aurum Realty creates mid-to-premium residences, business parks and villa communities in West and East Pune. Projects focus on efficient layouts, large open spaces and walkable access to employment hubs.',
    specialties: ['Premium apartments', 'Business parks', 'Villa communities'],
    cover: img.apartment[2],
  },
  {
    slug: 'verdant-habitats',
    name: 'Verdant Habitats',
    city: 'bangalore',
    established: 2007,
    tagline: 'Green-certified living and workspaces in Bangalore',
    about:
      'Verdant Habitats is a Bangalore developer with a focus on IGBC green-rated design, rainwater harvesting and low-density planning. Its portfolio spans rental residences, tech parks, villas and plotted layouts near the airport.',
    specialties: ['Green buildings', 'Tech parks', 'Villas & plots'],
    cover: img.villa[3],
  },
  {
    slug: 'deccan-heights-group',
    name: 'Deccan Heights Group',
    city: 'hyderabad',
    established: 2006,
    tagline: 'Hyderabad’s skyline, reimagined',
    about:
      'Deccan Heights Group develops premium high-rise residences in Kokapet and the Financial District, office towers in HITEC City and plotted communities on Hyderabad’s growth corridors.',
    specialties: ['Sky residences', 'Office towers', 'HMDA plots'],
    cover: img.apartment[1],
  },
  {
    slug: 'sabarmati-spaces',
    name: 'Sabarmati Spaces',
    city: 'ahmedabad',
    established: 2012,
    tagline: 'Contemporary Gujarat living, crafted in Ahmedabad',
    about:
      'Sabarmati Spaces builds luxury residences on Sindhu Bhavan Road, corporate parks on SG Highway and plotted townships around Sanand. The group is known for clean architecture, on-time delivery and transparent pricing.',
    specialties: ['Luxury residences', 'Corporate parks', 'Plotted townships'],
    cover: img.apartment[6],
  },
  {
    slug: 'tapi-riverfront-builders',
    name: 'Tapi Riverfront Builders',
    city: 'surat',
    established: 2010,
    tagline: 'Riverfront villas and land in South Gujarat',
    about:
      'Tapi Riverfront Builders develops villa communities in Vesu and land parcels in Olpad and the Hazira belt, combining private gardens, smart-home features and strong appreciation potential.',
    specialties: ['Luxury villas', 'Land parcels', 'Smart homes'],
    cover: img.villa[1],
  },
];

export const getDeveloper = (slug: string) => developers.find((d) => d.slug === slug);
