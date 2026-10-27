// Curated Unsplash photography (free to use under the Unsplash License).
// Replace with your own project renders via the admin panel (Phase 2).
const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const img = {
  hero: u('1613490493576-7fde63acd811', 2200),
  heroAlt: u('1600596542815-ffad4c1539a9', 2000),
  apartment: [
    u('1545324418-cc1a3fa10c00'),
    u('1460317442991-0ec209397118'),
    u('1574362848149-11496d93a7c7'),
    u('1502672260266-1c1ef2d93688'),
    u('1522708323590-d24dbb6b0267'),
    u('1560448204-e02f11c3d0e2'),
    u('1600607687939-ce8a6c25118c'),
    u('1600566753190-17f0baa2a6c3'),
    u('1600210492486-724fe5c67fb0'),
    u('1484154218962-a197022b5858'),
  ],
  commercial: [
    u('1486406146926-c627a92ad1ab'),
    u('1497366216548-37526070297c'),
    u('1497366811353-6870744d04b2'),
    u('1524758631624-e2822e304c36'),
    u('1449157291145-7efd050a4d0e'),
    u('1554469384-e58fac16e23a'),
    u('1441986300917-64674bd600d8'),
  ],
  villa: [
    u('1613490493576-7fde63acd811'),
    u('1512917774080-9991f1c4c750'),
    u('1600596542815-ffad4c1539a9'),
    u('1600585154340-be6161a56a0c'),
    u('1580587771525-78b9dba3b914'),
    u('1605276374104-dee2a0ed3cd6'),
    u('1564013799919-ab600027ffc6'),
    u('1613977257363-707ba9348227'),
  ],
  land: [
    u('1500382017468-9049fed747ef'),
    u('1500076656116-558758c991c1'),
    u('1464822759023-fed622ff2c3b'),
    u('1506744038136-46273834b3fb'),
    u('1470071459604-3b5ec3a7fe05'),
    u('1441974231531-c6227db76b6e'),
    u('1501785888041-af3ef285b470'),
  ],
  city: {
    mumbai: u('1570168007204-dfb528c6958f', 1200),
    pune: u('1477959858617-67f85cf4f1df', 1200),
    bangalore: u('1449824913935-59a10b8d2000', 1200),
    hyderabad: u('1480714378408-67cf0d13bc1b', 1200),
    ahmedabad: u('1486406146926-c627a92ad1ab', 1200),
    surat: u('1460317442991-0ec209397118', 1200),
  },
};

export function pick(list: string[], start: number, count = 5) {
  return Array.from({ length: count }, (_, i) => list[(start + i) % list.length]);
}
