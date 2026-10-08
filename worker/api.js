// API del edificio compartido. El navegador propone; aquí se decide con las mismas reglas
// (public/js/rules.js) y se guarda en Supabase con la llave service_role.
//
//   GET  /api/building           el piso como lo ven todos: publicados y reservas en curso
//   GET  /api/mine               mis espacios (con mi reserva y su borrador)
//   POST /api/hold               reservar un lugar para empezar a armar (20 min)
//   POST /api/move               cambiar de lugar o de tamaño
//   POST /api/doc                guardar lo que se armó
//   POST /api/publish            publicar (cuenta con correo verificado)
//   POST /api/release            soltar un espacio
//   POST /api/extend             +10 min, una sola vez (al pedir el código por correo)
//   POST /api/claim              pasar una reserva anónima a la cuenta con la que se entró
//
// Todos los POST llevan "Authorization: Bearer <access_token de Supabase>" (también los
// usuarios anónimos) y un cuerpo JSON. Respuesta: { ok: true, ... } o { ok: false, error }.
//
// Cada cambio de lugar se guarda con floor_commit(), que solo acepta si el piso sigue en la
// versión que se leyó: si dos personas piden el mismo lugar a la vez, gana una y la otra
// vuelve a decidir con el piso actualizado.

import R from '../public/js/rules.js';

const FLOOR = 1; // un piso por ahora; ver floors en Supabase
const MAX_BODY = 128 * 1024;
const MIN = 60 * 1000;

class Fail extends Error {
  constructor(status, error, extra) {
    super(error);
    this.status = status;
    this.extra = extra;
  }
}
const fail = (status, error, extra) => { throw new Fail(status, error, extra); };

export async function api(request, env, action, db = supabase(env)) {
  const routes = {
    'GET building': building, 'GET mine': mine,
    'POST hold': hold, 'POST move': move, 'POST doc': saveDoc, 'POST publish': publish,
    'POST release': release, 'POST extend': extend, 'POST claim': claim,
  };
  const fn = routes[request.method + ' ' + action];
  if (!fn) return json({ ok: false, error: 'not_found' }, 404);
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);
  try {
    const ctx = { env, db, now: Date.now(), ip: request.headers.get('CF-Connecting-IP') || 'local' };
    ctx.user = await userOf(request, db);
    const body = request.method === 'POST' ? await readBody(request) : null;
    return json(Object.assign({ ok: true, now: new Date(ctx.now).toISOString() }, await fn(ctx, body, new URL(request.url))));
  } catch (err) {
    if (err instanceof Fail) return json(Object.assign({ ok: false, error: err.message }, err.extra), err.status);
    console.error('api', action, err);
    return json({ ok: false, error: 'server' }, 500);
  }
}

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

async function readBody(request) {
  const text = await request.text();
  if (text.length > MAX_BODY) fail(413, 'too_large');
  try {
    const body = JSON.parse(text || '{}');
    return body && typeof body === 'object' ? body : fail(400, 'bad_json');
  } catch {
    fail(400, 'bad_json');
  }
}

async function userOf(request, db) {
  const m = /^Bearer\s+(.+)$/i.exec(request.headers.get('Authorization') || '');
  return m ? db.user(m[1]) : null;
}
const needUser = (ctx) => ctx.user || fail(401, 'login');
const registered = (u) => !!u && !u.is_anonymous && !!u.email;

// ————————————————————————————————— Formas
const iso = (ms) => new Date(ms).toISOString();
const alive = (s, now) => s.status === 'published' || Date.parse(s.expires_at) > now;
// Lo que las reglas necesitan de cada espacio del piso.
const placeOf = (s) => ({ id: s.id, kind: s.kind, row: s.row, x: s.x, w: s.w, desk: s.desk, number: s.number });
// Un espacio hacia el navegador. Las reservas ajenas no muestran su contenido ni su dueño.
function view(s, own) {
  const out = placeOf(s);
  out.status = s.status;
  out.expiresAt = s.status === 'hold' ? s.expires_at : null;
  if (own) {
    out.extended = s.extended;
    out.plan = s.plan;
  }
  if (own || s.status === 'published') out.doc = Object.assign({}, s.doc, placeOf(s), { id: s.id });
  return out;
}
// Fila para guardar (las columnas mandan sobre lo que diga el documento).
function rowOf(doc, base) {
  return Object.assign({}, base, {
    id: doc.id, kind: doc.kind,
    row: doc.kind === 'office' ? doc.row : null,
    x: doc.kind === 'office' ? doc.x : null,
    w: doc.kind === 'office' ? doc.w : null,
    desk: doc.kind === 'desk' ? doc.desk : null,
    number: doc.kind === 'office' ? doc.number : null,
    doc,
  });
}

// ————————————————————————————————— Piso: leer, decidir, guardar
// fn(piso) devuelve { mode, row } y lo que se responde; si el piso cambió entre la lectura y
// el guardado, se vuelve a decidir con el piso nuevo.
async function onFloor(ctx, fn) {
  for (let tries = 0; tries < 4; tries++) {
    const floor = await ctx.db.floor(FLOOR, iso(ctx.now));
    if (!floor || !floor.open) fail(503, 'no_floor');
    floor.spaces = floor.spaces.filter((s) => alive(s, ctx.now));
    const plan = fn(floor);
    try {
      const version = await ctx.db.commit(floor.id, floor.version, plan.mode, plan.row);
      return Object.assign({ version }, plan.reply);
    } catch (err) {
      if (err.code === 'conflict') continue;
      if (err.code === 'gone') fail(410, 'expired');
      if (err.code === 'has_hold') fail(409, 'has_hold');
      if (err.code === 'taken') fail(409, 'taken');
      throw err;
    }
  }
  fail(409, 'busy');
}

function ownSpace(ctx, floor, id) {
  const s = floor.spaces.find((o) => o.id === id);
  if (!s) fail(404, 'not_found');
  if (s.owner !== ctx.user.id) fail(403, 'not_yours');
  return s;
}

// Coloca el documento en el piso: devuelve el documento con su lugar definitivo o falla.
// Con lugar pedido (x / desk), ese o nada; sin lugar, el primero válido.
function place(floor, doc) {
  const list = floor.spaces.filter((s) => s.id !== doc.id).map(placeOf);
  if (doc.kind === 'desk') {
    const free = R.freeDesks(list, doc);
    if (!free.length) fail(409, 'full');
    if (doc.desk == null) doc.desk = free[0];
    else if (!free.includes(doc.desk)) fail(409, 'taken', { free });
    return doc;
  }
  if (doc.x == null) {
    const p = R.fitPlace(list, doc, doc.row, null);
    if (!p) fail(409, 'full');
    Object.assign(doc, p);
  } else if (!R.fits(list, doc)) {
    fail(409, 'taken', { suggest: R.fitPlace(list, doc, doc.row, doc.x) });
  }
  const before = floor.spaces.find((s) => s.id === doc.id);
  doc.number = before && before.row === doc.row && before.number ? before.number : R.numberFor(list, doc, doc.row);
  return doc;
}

// Lo que una cuenta puede tener a la vez (gratis por ahora).
function checkLimit(ctx, floor, kind, skipId) {
  const max = R.PLAN.free[kind === 'desk' ? 'desks' : 'offices'];
  const n = floor.spaces.filter((s) => s.owner === ctx.user.id && s.kind === kind && s.status === 'published' && s.id !== skipId).length;
  if (n >= max) fail(403, 'limit', { max });
}

async function rate(ctx, key, max, minutes) {
  if (!(await ctx.db.rateHit(key, max, minutes * 60))) fail(429, 'slow_down');
}

async function turnstile(ctx, token) {
  const secret = ctx.env.TURNSTILE_SECRET;
  if (!secret) return; // sin configurar: no se exige
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', String(token || ''));
  form.append('remoteip', ctx.ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = await res.json().catch(() => ({}));
  if (!out.success) fail(403, 'captcha');
}

// ————————————————————————————————— Acciones
async function building(ctx, body, url) {
  const id = Number(url.searchParams.get('floor')) || FLOOR;
  const floor = await ctx.db.floor(id, iso(ctx.now));
  if (!floor) fail(404, 'no_floor');
  const me = ctx.user && ctx.user.id;
  return {
    floor: { id: floor.id, version: floor.version, open: floor.open },
    spaces: floor.spaces.filter((s) => alive(s, ctx.now)).map((s) => view(s, s.owner === me)),
  };
}

async function mine(ctx) {
  needUser(ctx);
  const list = await ctx.db.spacesOf(ctx.user.id);
  return { spaces: list.filter((s) => alive(s, ctx.now)).map((s) => view(s, true)), registered: registered(ctx.user) };
}

async function hold(ctx, body) {
  needUser(ctx);
  await rate(ctx, 'hold:ip:' + ctx.ip, 20, 60);
  await rate(ctx, 'hold:user:' + ctx.user.id, 10, 60);
  await turnstile(ctx, body.turnstile);
  const kind = body.kind === 'desk' ? 'desk' : 'office';
  return onFloor(ctx, (floor) => {
    const mineHold = floor.spaces.find((s) => s.owner === ctx.user.id && s.status === 'hold');
    if (mineHold) fail(409, 'has_hold', { space: view(mineHold, true) });
    checkLimit(ctx, floor, kind);
    const raw = Object.assign({}, body.doc, { kind, id: R.newId(kind) });
    if (kind === 'office') Object.assign(raw, { row: body.row, x: body.x, w: body.w });
    else raw.desk = body.desk;
    const doc = place(floor, R.sanitize(raw));
    const row = rowOf(doc, { owner: ctx.user.id, status: 'hold', expires_at: iso(ctx.now + R.HOLD.minutes * MIN), extended: false, plan: 'free', price_cents: 0 });
    return { mode: 'insert', row, reply: { space: view(row, true) } };
  });
}

// Mismo espacio con otro lugar o tamaño. Lo que ya no quepa adentro se descarta.
async function move(ctx, body) {
  needUser(ctx);
  await rate(ctx, 'write:' + ctx.user.id, 120, 10);
  return onFloor(ctx, (floor) => {
    const s = ownSpace(ctx, floor, body.id);
    const raw = Object.assign({}, s.doc, placeOf(s));
    if (s.kind === 'office') Object.assign(raw, { row: body.row == null ? s.row : body.row, x: body.x == null ? s.x : body.x, w: body.w == null ? s.w : body.w });
    else raw.desk = body.desk == null ? s.desk : body.desk;
    const doc = place(floor, R.sanitize(raw));
    const row = rowOf(doc, pick(s));
    return { mode: 'update', row, reply: { space: view(row, true) } };
  });
}

async function saveDoc(ctx, body) {
  needUser(ctx);
  await rate(ctx, 'write:' + ctx.user.id, 120, 10);
  return onFloor(ctx, (floor) => {
    const s = ownSpace(ctx, floor, body.id);
    const doc = R.sanitize(Object.assign({}, body.doc, placeOf(s), { id: s.id, kind: s.kind }));
    const row = rowOf(doc, pick(s));
    return { mode: 'update', row, reply: { space: view(row, true) } };
  });
}

async function publish(ctx, body) {
  needUser(ctx);
  if (!registered(ctx.user)) fail(401, 'register');
  return onFloor(ctx, (floor) => {
    const s = ownSpace(ctx, floor, body.id);
    if (s.status !== 'hold') fail(409, 'already_published');
    checkLimit(ctx, floor, s.kind, s.id);
    const doc = R.sanitize(Object.assign({}, body.doc || s.doc, placeOf(s), { id: s.id, kind: s.kind }));
    const row = rowOf(doc, Object.assign(pick(s), { status: 'published', expires_at: null }));
    return { mode: 'update', row, reply: { space: view(row, true) } };
  });
}

async function release(ctx, body) {
  needUser(ctx);
  return onFloor(ctx, (floor) => {
    const s = ownSpace(ctx, floor, body.id);
    return { mode: 'delete', row: { id: s.id }, reply: {} };
  });
}

async function extend(ctx, body) {
  needUser(ctx);
  return onFloor(ctx, (floor) => {
    const s = ownSpace(ctx, floor, body.id);
    if (s.status !== 'hold') fail(409, 'already_published');
    if (s.extended) fail(409, 'already_extended');
    const row = Object.assign(pick(s), placeOf(s), { doc: s.doc, extended: true, expires_at: iso(Date.parse(s.expires_at) + R.HOLD.extendMinutes * MIN) });
    return { mode: 'update', row, reply: { space: view(row, true) } };
  });
}

// La reserva se armó como anónimo y el correo ya tenía cuenta: al entrar con esa cuenta, la
// reserva pasa a ella. anon: el access_token de la sesión anónima.
async function claim(ctx, body) {
  needUser(ctx);
  if (!registered(ctx.user)) fail(401, 'register');
  const from = await ctx.db.user(String(body.anon || ''));
  if (!from || !from.is_anonymous) fail(403, 'not_anonymous');
  return onFloor(ctx, (floor) => {
    const s = floor.spaces.find((o) => o.owner === from.id && o.status === 'hold');
    if (!s) fail(404, 'not_found');
    if (floor.spaces.some((o) => o.owner === ctx.user.id && o.status === 'hold')) fail(409, 'has_hold');
    const row = Object.assign(pick(s), placeOf(s), { doc: s.doc, owner: ctx.user.id });
    return { mode: 'update', row, reply: { space: view(row, true) } };
  });
}

// Columnas que se conservan al actualizar.
const pick = (s) => ({ owner: s.owner, status: s.status, expires_at: s.expires_at, extended: s.extended, plan: s.plan, price_cents: s.price_cents });

// ————————————————————————————————— Supabase (REST con la llave service_role)
export function supabase(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_ANON_KEY) return null;
  const base = env.SUPABASE_URL.replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  async function rest(path, init) {
    const res = await fetch(base + '/rest/v1/' + path, Object.assign({}, init, {
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    }));
    const body = await res.json().catch(() => null);
    if (!res.ok) throw dbError(body || {});
    return body;
  }
  const rpc = (fn, args) => rest('rpc/' + fn, { method: 'POST', body: JSON.stringify(args) });
  return {
    async user(token) {
      const res = await fetch(base + '/auth/v1/user', { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token } });
      if (!res.ok) return null;
      const u = await res.json();
      return { id: u.id, email: u.email || null, is_anonymous: !!u.is_anonymous };
    },
    async floor(id, nowIso) {
      // Primero la versión y después los espacios: si algo cambia en el medio, el guardado falla.
      const [f] = await rest(`floors?id=eq.${id}&select=id,open,version`);
      if (!f) return null;
      f.spaces = await rest(`spaces?floor=eq.${id}&or=(status.eq.published,expires_at.gt."${nowIso}")&select=*`);
      return f;
    },
    spacesOf: (owner) => rest(`spaces?owner=eq.${encodeURIComponent(owner)}&select=*`),
    commit: (floor, version, mode, row) => rpc('floor_commit', { p_floor: floor, p_version: version, p_mode: mode, p_row: row }),
    rateHit: (key, max, seconds) => rpc('rate_hit', { p_key: key, p_max: max, p_seconds: seconds }),
  };
}

// Errores de la base a códigos de la API.
export function dbError(e) {
  const err = new Error(e.message || 'db');
  const msg = e.message || '';
  if (['conflict', 'gone', 'no_floor'].includes(msg)) err.code = msg;
  else if (e.code === '23505' && /spaces_one_hold/.test(msg)) err.code = 'has_hold';
  else if (e.code === '23505' || e.code === '23P01') err.code = 'taken';
  return err;
}
