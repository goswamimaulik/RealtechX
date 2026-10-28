import type { Property, PropertyType } from '../types';
import { slugify } from '../format';

export const amenitiesByType: Record<PropertyType, string[]> = {
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

export type Seed = Omit<Property, 'id' | 'slug' | 'localitySlug' | 'amenities' | 'mapQuery' | 'rera' | 'source'> &
  Partial<Pick<Property, 'amenities' | 'rera' | 'source'>>;

let n = 0;
export function make(s: Seed): Property {
  n += 1;
  return {
    ...s,
    id: 'RTX' + String(1000 + n),
    slug: slugify(`${s.title} ${s.locality} ${s.city}`),
    localitySlug: slugify(s.locality),
    amenities: s.amenities ?? amenitiesByType[s.type],
    mapQuery: `${s.locality}, ${s.city}`,
    rera: s.rera ?? 'Awaiting verification',
    source: s.source ?? 'sample',
  };
}

