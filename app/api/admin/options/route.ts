import { requireUser } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';
import { can } from '@/lib/auth/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Dropdown data used across admin forms. */
export const GET = handle(async () => {
  const { db, user } = await requireUser();
  const [states, cities, localities, developers, terms, users, settings] = await Promise.all([
    db.coll('states').find({}, { sort: { name: 1 } }),
    db.coll('cities').find({}, { sort: { order: 1, name: 1 } }),
    db.coll('localities').find({}, { sort: { name: 1 }, projection: { slug: 1, name: 1, city: 1 } }),
    db.coll('developers').find({}, { sort: { name: 1 }, projection: { slug: 1, name: 1, city: 1 } }),
    db.coll('terms').find({}, { sort: { order: 1, label: 1 } }),
    can(user.role, 'leads') ? db.coll('users').find({ active: true }, { projection: { name: 1, role: 1, email: 1 } }) : Promise.resolve([]),
    db.coll('settings').findOne({ _id: 'site' }),
  ]);
  const group = (g: string) => terms.filter((t) => t.group === g).map((t) => ({ slug: t.slug, label: t.label, parent: t.parent ?? '' }));
  return {
    states: states.map((s) => ({ slug: s.slug, name: s.name })),
    cities: cities.map((c) => ({ slug: c.slug, name: c.name, state: c.state })),
    localities: localities.map((l) => ({ slug: l.slug, name: l.name, city: l.city })),
    developers: developers.map((d) => ({ slug: d.slug, name: d.name, city: d.city })),
    purposes: group('purpose'),
    categories: group('category'),
    subtypes: group('subtype'),
    amenities: group('amenity'),
    furnishing: group('furnishing'),
    statuses: group('status'),
    users: users.map((u) => ({ id: u._id, name: u.name, role: u.role })),
    site: { name: settings?.name ?? 'RealtechX', url: settings?.url ?? '', uploads: settings?.uploads ?? { maxMb: 8, types: 'jpg,jpeg,png,webp,pdf' } },
  };
});
