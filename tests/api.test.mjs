// Pruebas de la API del edificio (worker/api.js) contra un Postgres de verdad con la
// migración de supabase/ aplicada (la parte de Supabase Auth y PostgREST se simula).
//   PGTEST="psql -h /tmp/pgtest -p 5499 -U postgres -d t" node --test tests/*.test.*
// Sin PGTEST, se saltan.
import test from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { api, dbError } from '../worker/api.js';

const PSQL = process.env.PGTEST && process.env.PGTEST.split(' ');
const sql = (q) => {
  try {
    return execFileSync(PSQL[0], PSQL.slice(1).concat(['-At', '-v', 'ON_ERROR_STOP=1', '-c', q]), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    const m = /ERROR:\s+(.*)/.exec(e.stderr) || [];
    const code = /exclusion constraint/.test(m[1]) ? '23P01' : /unique constraint/.test(m[1]) ? '23505' : 'P0001';
    throw dbError({ message: m[1], code });
  }
};
const lit = (v) => "'" + String(v).replace(/'/g, "''") + "'";
const rows = (q) => JSON.parse(sql(`select coalesce(json_agg(t), '[]') from (${q}) t`));

const USERS = {
  anon1: { id: 'aaaaaaaa-0000-0000-0000-000000000001', email: null, is_anonymous: true },
  anon2: { id: 'aaaaaaaa-0000-0000-0000-000000000002', email: null, is_anonymous: true },
  ana: { id: 'aaaaaaaa-0000-0000-0000-000000000003', email: 'ana@x.com', is_anonymous: false },
};
const db = {
  user: async (t) => USERS[t] || null,
  floor: async (id, now) => {
    const [f] = rows(`select id, open, version from floors where id = ${+id}`);
    if (!f) return null;
    f.spaces = rows(`select * from spaces where floor = ${+id} and (status = 'published' or expires_at > ${lit(now)})`);
    return f;
  },
  spacesOf: async (owner) => rows(`select * from spaces where owner = ${lit(owner)}`),
  commit: async (floor, version, mode, row) => +sql(`select floor_commit(${floor}::smallint, ${version}, ${lit(mode)}, ${lit(JSON.stringify(row))}::jsonb)`),
  rateHit: async (key, max, s) => sql(`select rate_hit(${lit(key)}, ${max}, ${s})`) === 't',
};
const call = async (action, who, body, method = 'POST') => {
  const req = new Request('http://x/api/' + action, {
    method, headers: who ? { Authorization: 'Bearer ' + who } : {}, body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
  });
  const res = await api(req, {}, action, db);
  return Object.assign(await res.json(), { status: res.status });
};

test('API del edificio', { skip: !PSQL && 'sin PGTEST' }, async (t) => {
  sql(`delete from spaces; delete from rate_limits; update floors set version = 0;
       insert into auth.users (id, email) values ${Object.values(USERS).map((u) => `(${lit(u.id)}, ${u.email ? lit(u.email) : 'null'})`).join(',')} on conflict do nothing`);

  let h1;
  await t.test('reservar sin sesión no se puede', async () => {
    assert.strictEqual((await call('hold', null, { kind: 'office', w: 8 })).error, 'login');
  });
  await t.test('un anónimo reserva una oficina donde haya lugar', async () => {
    const r = await call('hold', 'anon1', { kind: 'office', w: 12, doc: { identity: { name: 'Lab' } } });
    assert.ok(r.ok, JSON.stringify(r));
    h1 = r.space;
    assert.strictEqual(h1.status, 'hold');
    assert.strictEqual(h1.w, 12);
    assert.strictEqual(h1.number, 101);
    assert.strictEqual(h1.doc.identity.name, 'Lab');
    assert.ok(Date.parse(h1.expiresAt) - Date.now() > 19 * 60e3);
  });
  await t.test('una sola reserva a la vez', async () => {
    const r = await call('hold', 'anon1', { kind: 'desk' });
    assert.strictEqual(r.error, 'has_hold');
  });
  await t.test('los demás ven la reserva sin su contenido', async () => {
    const r = await call('building', null, null, 'GET');
    const s = r.spaces.find((o) => o.id === h1.id);
    assert.strictEqual(s.status, 'hold');
    assert.strictEqual(s.doc, undefined);
    assert.ok(s.expiresAt);
  });
  await t.test('otro no puede tomar ese lugar ni tocarlo', async () => {
    const r = await call('hold', 'anon2', { kind: 'office', w: 8, row: 'B', x: h1.x + 2 });
    assert.strictEqual(r.error, 'taken');
    assert.ok(r.suggest);
    assert.strictEqual((await call('doc', 'anon2', { id: h1.id, doc: {} })).error, 'not_yours');
    const ok = await call('hold', 'anon2', { kind: 'office', w: 8, row: 'B', x: r.suggest.x });
    assert.ok(ok.ok, JSON.stringify(ok));
    assert.strictEqual(ok.space.number, 102);
    assert.ok(Math.abs(ok.space.x - (h1.x + 12)) === 4 || ok.space.x + 8 <= h1.x || ok.space.x >= h1.x + 12 + 14 || ok.space.x + 8 + 4 === h1.x || ok.space.x + 8 + 14 <= h1.x);
  });
  await t.test('guardar limpia el documento con las reglas', async () => {
    const r = await call('doc', 'anon1', { id: h1.id, doc: { w: 24, x: 0, identity: { name: 'x'.repeat(99) }, items: [{ type: 'nuke' }, { type: 'plant', x: 0, y: 0 }] } });
    assert.ok(r.ok);
    assert.strictEqual(r.space.w, 12); // el lugar no cambia con /doc
    assert.strictEqual(r.space.doc.identity.name.length, 24);
    assert.strictEqual(r.space.doc.items.length, 1);
  });
  await t.test('publicar exige cuenta con correo', async () => {
    assert.strictEqual((await call('publish', 'anon1', { id: h1.id })).error, 'register');
  });
  await t.test('alargar una sola vez', async () => {
    const r = await call('extend', 'anon1', { id: h1.id });
    assert.ok(Date.parse(r.space.expiresAt) - Date.parse(h1.expiresAt) === 10 * 60e3);
    assert.strictEqual((await call('extend', 'anon1', { id: h1.id })).error, 'already_extended');
  });
  await t.test('al entrar con su cuenta, la reserva pasa a ella y se publica', async () => {
    const c = await call('claim', 'ana', { anon: 'anon1' });
    assert.ok(c.ok, JSON.stringify(c));
    const p = await call('publish', 'ana', { id: h1.id });
    assert.ok(p.ok, JSON.stringify(p));
    assert.strictEqual(p.space.status, 'published');
    const b = await call('building', null, null, 'GET');
    assert.strictEqual(b.spaces.find((o) => o.id === h1.id).doc.identity.name.length, 24);
  });
  await t.test('límite gratis: una oficina publicada por cuenta', async () => {
    assert.strictEqual((await call('hold', 'ana', { kind: 'office', w: 8 })).error, 'limit');
    const d = await call('hold', 'ana', { kind: 'desk' });
    assert.ok(d.ok);
    assert.strictEqual(d.space.desk, 0);
    assert.strictEqual((await call('hold', 'anon1', { kind: 'desk', desk: 0 })).error, 'taken');
  });
  await t.test('mover y cambiar de tamaño respeta las normas', async () => {
    const mine = (await call('mine', 'anon2', null, 'GET')).spaces[0];
    const r = await call('move', 'anon2', { id: mine.id, w: 16 });
    assert.ok(r.ok || r.error === 'taken', JSON.stringify(r));
  });
  await t.test('una reserva vencida libera el lugar y no se puede publicar', async () => {
    const mine = (await call('mine', 'anon2', null, 'GET')).spaces[0];
    sql(`update spaces set expires_at = now() - interval '1 second' where id = ${lit(mine.id)}`);
    const b = await call('building', null, null, 'GET');
    assert.ok(!b.spaces.some((o) => o.id === mine.id));
    assert.strictEqual((await call('doc', 'anon2', { id: mine.id, doc: {} })).error, 'not_found');
    const again = await call('hold', 'anon2', { kind: 'office', w: 8, row: 'B', x: mine.x });
    assert.ok(again.ok, JSON.stringify(again));
  });
  await t.test('soltar', async () => {
    const mine = (await call('mine', 'anon2', null, 'GET')).spaces[0];
    assert.ok((await call('release', 'anon2', { id: mine.id })).ok);
    assert.strictEqual((await call('mine', 'anon2', null, 'GET')).spaces.length, 0);
  });
  await t.test('dos pedidos a la vez por el mismo lugar: gana uno', async () => {
    const { suggest } = await call('hold', 'anon1', { kind: 'office', w: 8, row: 'B', x: 3 });
    const [a, b] = await Promise.all([
      call('hold', 'anon1', { kind: 'office', w: 8, row: 'B', x: suggest.x }),
      call('hold', 'anon2', { kind: 'office', w: 8, row: 'B', x: suggest.x }),
    ]);
    assert.strictEqual([a, b].filter((r) => r.ok).length, 1, JSON.stringify([a, b]));
    assert.strictEqual([a, b].find((r) => !r.ok).error, 'taken');
  });
});
