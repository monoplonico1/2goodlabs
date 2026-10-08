// Pruebas de las reglas compartidas (public/js/rules.js) y de que el catálogo del editor
// diga lo mismo que ellas. Ejecutar:  node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const R = require('../public/js/rules.js');

const office = (id, x, w) => ({ id, kind: 'office', row: 'B', x, w });
const bay = R.ROWS[0].bays[0];

test('el coworking solo deja el piso válido', () => {
  assert.ok(R.floorPlan([]));
  assert.strictEqual(R.floorPlan([{ id: 'x', row: 'B', a: R.COWORK.a, w: 8 }]), null); // encima del coworking
});

test('entre dos oficinas queda un pasillo de 4 o 14+ casillas', () => {
  const [a] = R.starts([], 'B', 8);
  assert.ok(a != null);
  const leases = [{ id: 'a', row: 'B', a, w: 8 }];
  const next = R.starts(leases, 'B', 8);
  for (const s of next) {
    const gap = s - (a + 8);
    assert.ok(gap === 4 || gap >= 14 || s + 8 <= a, 'hueco ' + gap);
  }
});

test('todos los tamaños a la venta caben en el piso vacío', () => {
  for (const z of R.SIZES.filter((z) => !z.soon)) assert.ok(R.starts([], 'B', z.w).length > 0, z.id);
});

test('anchos fuera de rango no se aceptan', () => {
  assert.deepStrictEqual(R.starts([], 'B', 7), []);
  assert.deepStrictEqual(R.starts([], 'B', 25), []);
  assert.strictEqual(R.floorPlan([{ id: 'x', row: 'B', a: bay.R - 30, w: 30 }]), null);
  assert.strictEqual(R.floorPlan([{ id: 'x', row: 'B', a: 20.5, w: 8 }]), null);
  assert.strictEqual(R.floorPlan([{ id: 'x', row: 'Z', a: 20, w: 8 }]), null);
});

test('fits y fitPlace', () => {
  const p = R.fitPlace([], office('o-a', null, 12), 'B', 40);
  assert.ok(p);
  const a = Object.assign(office('o-a', p.x, 12));
  assert.ok(R.fits([a], a));
  const b = office('o-b', a.x + 1, 8); // encima de la otra
  assert.ok(!R.fits([a, b], b));
});

test('numberFor y freeDesks', () => {
  const a = Object.assign(office('o-a', 30, 8), { number: 101 });
  assert.strictEqual(R.numberFor([a], office('o-b', 50, 8), 'B'), 102);
  const d = { id: 'd-1', kind: 'desk', desk: 0 };
  assert.ok(!R.freeDesks([d]).includes(0));
  assert.ok(R.freeDesks([d], d).includes(0));
});

test('sanitize descarta lo que no cumple', () => {
  const doc = R.sanitize({
    id: '<script>', kind: 'office', w: 99, row: 'B', x: 30,
    identity: { name: 'x'.repeat(100), primary: 'red' },
    surfaces: { floor: 'lava', walls: 'brick', wallColor: '#ABCDEF' },
    mode: 'party',
    items: [{ type: 'desk', x: 0, y: 0 }, { type: 'desk', x: 0, y: 0 }, { type: 'nuke', x: 2, y: 2 }, { type: 'info', x: 99, y: 0 }],
    residents: Array(200).fill({ kind: 'agent', name: 'a', x: 0, y: 0 }),
    content: { links: [{ url: 'javascript:alert(1)' }, { url: 'https://example.com', label: 'ok' }] },
  });
  assert.match(doc.id, /^o-/);
  assert.strictEqual(doc.w, R.RULES.maxWidth);
  assert.strictEqual(doc.identity.name.length, 24);
  assert.strictEqual(doc.identity.primary, '#1d1f24');
  assert.strictEqual(doc.surfaces.floor, 'plain');
  assert.strictEqual(doc.surfaces.walls, 'brick');
  assert.strictEqual(doc.surfaces.wallColor, '#abcdef');
  assert.strictEqual(doc.mode, 'day');
  assert.strictEqual(doc.items.length, 1); // el segundo escritorio se superpone; los otros no existen o no caben
  assert.strictEqual(doc.residents.length, 0); // (0,0) ya está ocupado por el escritorio
  assert.deepStrictEqual(doc.content.links, [{ label: 'ok', url: 'https://example.com' }]);
  assert.ok(R.sanitize(null).id);
  assert.strictEqual(R.sanitize({ kind: 'desk', desk: 999 }).desk, null);
});

test('límites y precios', () => {
  const doc = R.empty('office');
  doc.w = 10;
  assert.deepStrictEqual(R.limits(doc), { maxItems: 20, maxResidents: 9, maxLinks: R.PLAN.maxLinks });
  assert.strictEqual(R.m2(doc), 80);
  assert.strictEqual(R.price(doc), 20);
  assert.strictEqual(R.price(R.empty('desk')), R.DESK.price);
});

test('nada puede tapar la puerta ni dejar a alguien encerrado', () => {
  const doc = R.empty('office');
  const [door] = R.entriesOf(R.area(doc));
  assert.strictEqual(R.canPlace(doc, { type: 'plant' }, door.x, door.y), 'door');
  doc.residents.push({ kind: 'agent', x: 0, y: 0 });
  assert.strictEqual(R.canPlace(doc, { type: 'desk' }, 0, 1), null);
  doc.items.push({ type: 'desk', x: 0, y: 1 });
  assert.strictEqual(R.canPlace(doc, { type: 'plant' }, 1, 0), 'blocked');
});

test('el catálogo del editor coincide con las reglas', () => {
  // Carga editor/catalog.js con dibujos falsos: aquí solo importan los datos.
  const art = new Proxy({}, { get: () => () => ({}) });
  const sandbox = { TGL: { art, rules: R, color: {} } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/editor/catalog.js'), 'utf8'), sandbox);
  const cat = sandbox.TGL.catalog;
  const plain = (v) => JSON.parse(JSON.stringify(v)); // valores de otro contexto de vm
  assert.deepStrictEqual(plain(cat.items.map((d) => d.type)), R.ITEMS.map((d) => d.type));
  for (const def of cat.items) {
    const r = R.byType[def.type];
    assert.strictEqual(def.w, r.w, def.type + ' w');
    assert.strictEqual(def.h, r.h, def.type + ' h');
    assert.strictEqual(def.tier, r.tier, def.type + ' tier');
    assert.strictEqual(def.solid !== false, r.solid !== false, def.type + ' solid');
    assert.strictEqual(!!def.info, !!r.info, def.type + ' info');
    assert.deepStrictEqual(plain(def.variants || null), r.variants || null, def.type + ' variants');
    assert.strictEqual(cat.baseColor(def), r.color || null, def.type + ' color');
  }
  assert.deepStrictEqual(plain(cat.floors.map((f) => [f.id, f.tier, f.color])), R.FLOORS.map((f) => [f.id, f.tier, f.color]));
  for (const k of Object.keys(R.PEOPLE)) assert.strictEqual(cat.people[k][0], R.PEOPLE[k], 'people ' + k);
});
