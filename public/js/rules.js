// Reglas compartidas entre el navegador y el servidor (Worker de Cloudflare): la zona de
// arriendo y sus normas, el catálogo como datos (sin dibujos), precios, límites y la
// validación de un espacio. El servidor usa exactamente este archivo para decidir: el
// navegador solo propone.
//
// En el navegador queda en TGL.rules; en el Worker se importa como módulo.

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.TGL = root.TGL || {}).rules = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // ————————————————————————————————— Producto
  const DEPTH = 8; // fondo de toda oficina (m)
  const PRICE_PER_M2 = 0.25; // US$ por m² al mes (de ejemplo; hoy todo es gratis)
  const DESK = { m2: 4, price: 5, residents: 2 };
  const SIZES = [
    { id: 's', w: 8 }, { id: 'm', w: 12 }, { id: 'l', w: 16 }, { id: 'xl', w: 24 },
    { id: 'floor', w: 48, soon: true },
  ];
  const PLAN = {
    maxLinks: 4,
    // Gratis por ahora: lo que una cuenta puede tener publicado a la vez.
    free: { offices: 1, desks: 1 },
  };
  // Reserva mientras se edita: si no se publica a tiempo, se pierde y el lugar se libera.
  const HOLD = { minutes: 20, extendMinutes: 10 };

  // ————————————————————————————————— Zona de arriendo y normas del piso
  // Los pasillos son del edificio: no se venden ni se cierran. Toda oficina tiene la puerta
  // sobre el pasillo de abajo de su fila. Entre una oficina y cualquier otra cosa que no sea
  // un muro del edificio (otra oficina o planta libre) queda un pasillo de 2 m que cruza la
  // fila. Junto a una oficina quedan 0 m o al menos 8 m libres: no hay retazos.
  const RULES = { hall: 2, minFree: 8, minWidth: 8, maxWidth: 24 };
  // Fila (y, alto) con sus tramos entre muros del edificio ('wall') y pasillos ('hall'). Una
  // sola por ahora: el piso de arriba, de punta a punta (a su izquierda va el pasillo que
  // recorre todo el piso). num: número de la primera oficina de la fila.
  const ROWS = [
    { id: 'B', num: 101, y: 3, h: DEPTH, hallY: 14, up: false, bays: [{ L: 3, R: 57, l: 'hall', r: 'wall' }] },
  ];
  const COWORK = { id: 'cowork', row: 'B', a: 4, w: 15, fixed: true };
  // Puestos del coworking (relativos a la sala): escritorio de 2 × 1 y, delante, dos personas.
  const DESKS = [0, 3, 6, 9, 12].map((x) => ({ x, y: 1 })).concat([0, 3, 6, 9, 12].map((x) => ({ x, y: 4 })));

  // Columnas de un hueco de n casillas entre dos bordes ('wall' | 'hall' | 'office').
  function fillGap(n, left, right) {
    const off = (k) => k === 'office';
    const free = (k) => Array(Math.max(0, k)).fill('free');
    if (!off(left) && !off(right)) return free(n);
    if (off(left) && off(right)) {
      if (n === 4) return ['wall', 'hall', 'hall', 'wall']; // pasillo compartido
      if (n >= 6 + RULES.minFree) return ['wall', 'hall', 'hall', ...free(n - 6), 'hall', 'hall', 'wall'];
      return null;
    }
    const edge = off(left) ? right : left;
    let cols;
    if (n === (edge === 'wall' ? 0 : 1)) cols = Array(n).fill('wall'); // pegada al muro o al pasillo
    else if (n >= 3 + RULES.minFree) cols = ['wall', 'hall', 'hall', ...free(n - 3)];
    else return null;
    return off(left) ? cols : cols.reverse();
  }

  // Plano del piso para estas oficinas (sin el coworking, que se agrega solo): por fila, el
  // tipo de cada columna ('free' | 'hall' | 'wall' | id de la oficina). null si algo rompe
  // las normas. leases: [{ id, row, a (columna donde empieza), w }].
  function floorPlan(leases) {
    leases = [COWORK].concat(leases.filter((o) => o.id !== COWORK.id));
    const plan = {};
    for (const o of leases) {
      const row = ROWS.find((q) => q.id === o.row);
      if (!row || !Number.isInteger(o.a) || !Number.isInteger(o.w)) return null;
      if (!o.fixed && (o.w < RULES.minWidth || o.w > RULES.maxWidth)) return null;
      if (!row.bays.some((b) => o.a >= b.L && o.a + o.w - 1 <= b.R)) return null;
    }
    for (const row of ROWS) {
      const cols = {};
      for (const bay of row.bays) {
        const list = leases.filter((o) => o.row === row.id && o.a >= bay.L && o.a <= bay.R).sort((p, q) => p.a - q.a);
        let cur = bay.L, left = bay.l;
        const put = (arr) => { arr.forEach((t, i) => { cols[cur + i] = t; }); cur += arr.length; };
        for (const o of list) {
          if (o.a < cur) return null;
          const g = fillGap(o.a - cur, left, 'office');
          if (!g) return null;
          put(g);
          put(Array(o.w).fill(o.id));
          left = 'office';
        }
        const g = fillGap(bay.R - cur + 1, left, bay.r);
        if (!g) return null;
        put(g);
      }
      plan[row.id] = cols;
    }
    return plan;
  }
  // Dónde puede empezar (x) una oficina de ancho w en una fila, con las demás donde están.
  function starts(leases, rowId, w, skipId) {
    const others = leases.filter((o) => o.id !== skipId && o.id !== COWORK.id), out = [];
    const row = ROWS.find((q) => q.id === rowId);
    if (!row || w < RULES.minWidth || w > RULES.maxWidth) return out;
    for (const bay of row.bays)
      for (let a = bay.L; a + w - 1 <= bay.R; a++) if (floorPlan(others.concat({ id: '?', row: rowId, a, w }))) out.push(a);
    return out;
  }

  // ————————————————————————————————— Espacios (oficinas y puestos) sobre el piso
  const leasesOf = (list) => list.filter((d) => d.kind === 'office' && d.x != null).map((d) => ({ id: d.id, row: d.row, a: d.x, w: d.w, number: d.number }));
  const startsFor = (list, doc, row, w) => starts(leasesOf(list), row, w == null ? doc.w : w, doc.id);
  // El lugar válido más cercano al pedido: primero en la misma fila, si no en las demás.
  function fitPlace(list, doc, row, x, w) {
    const rows = ROWS.map((r) => r.id).sort((a, b) => (b === row) - (a === row));
    for (const rw of rows) {
      const ok = startsFor(list, doc, rw, w);
      if (!ok.length) continue;
      const want = x == null ? ok[0] : x;
      return { row: rw, x: ok.reduce((best, s) => (Math.abs(s - want) < Math.abs(best - want) ? s : best), ok[0]) };
    }
    return null;
  }
  // ¿Esta oficina cabe donde dice, con las demás donde están?
  const fits = (list, doc) => doc.kind !== 'office' || startsFor(list, doc, doc.row, doc.w).includes(doc.x);
  // Número de oficina: el primero libre de la fila.
  function numberFor(list, doc, row) {
    const base = ROWS.find((r) => r.id === row).num;
    const used = list.filter((d) => d.id !== doc.id && d.kind === 'office').map((d) => d.number);
    let n = base;
    while (used.includes(n)) n++;
    return n;
  }
  const freeDesks = (list, doc) => DESKS.map((d, i) => i).filter((i) => !list.some((o) => o.kind === 'desk' && o.id !== (doc && doc.id) && o.desk === i));

  // ————————————————————————————————— Catálogo (solo datos; los dibujos están en editor/catalog.js)
  // color: el color de fábrica (si el objeto se puede recolorear).
  const ITEMS = [
    { type: 'info', w: 1, h: 1, tier: 'free', info: true },
    { type: 'desk', w: 2, h: 1, tier: 'free', color: '#a8743f' },
    { type: 'desk-imac', w: 2, h: 1, tier: 'pro', color: '#f5f5f7' },
    { type: 'desk-dual', w: 3, h: 1, tier: 'pro', color: '#a8743f' },
    { type: 'chair', w: 1, h: 1, tier: 'free', color: '#3d5a8a' },
    { type: 'chair-white', w: 1, h: 1, tier: 'free', color: '#e9e9ee' },
    { type: 'table', w: 2, h: 1, tier: 'free', color: '#a8743f' },
    { type: 'table-meeting', w: 3, h: 2, tier: 'free', color: '#a8743f' },
    { type: 'table-oak', w: 4, h: 3, tier: 'pro', color: '#dcc39a' },
    { type: 'whiteboard', w: 2, h: 1, tier: 'free', variants: ['roadmap', 'chart', 'kanban', 'moodboard'], color: '#9aa1ab' },
    { type: 'display', w: 2, h: 1, tier: 'pro' },
    { type: 'server', w: 1, h: 1, tier: 'pro', color: '#23272f' },
    { type: 'printer', w: 1, h: 1, tier: 'free', color: '#d9dde3' },
    { type: 'tv-sports', w: 4, h: 1, tier: 'pro', color: '#3a2c22' },
    { type: 'sofa', w: 3, h: 1, tier: 'free', color: '#6a4c93' },
    { type: 'coffee', w: 3, h: 1, tier: 'free', color: '#8a6a4a' },
    { type: 'fridge', w: 1, h: 1, tier: 'free', color: '#dfe4ea' },
    { type: 'water', w: 1, h: 1, tier: 'free', color: '#e6e9ee' },
    { type: 'pingpong', w: 4, h: 2, tier: 'pro', color: '#1f6f45' },
    { type: 'bookshelf', w: 2, h: 1, tier: 'free', color: '#7a5230' },
    { type: 'shelf-white', w: 2, h: 1, tier: 'free', color: '#f5f5f7' },
    { type: 'trophies', w: 2, h: 1, tier: 'free', color: '#7a5230' },
    { type: 'rug', w: 3, h: 2, tier: 'free', solid: false, color: '#f4e2d0' },
    { type: 'plant', w: 1, h: 1, tier: 'free', color: '#b5652f' },
    { type: 'plant-white', w: 1, h: 1, tier: 'free', color: '#f5f5f7' },
    { type: 'tree', w: 2, h: 1, tier: 'pro' },
    { type: 'aquarium', w: 2, h: 1, tier: 'pro', color: '#2c4a35' },
    { type: 'birdcage', w: 1, h: 1, tier: 'pro' },
    { type: 'cat', w: 2, h: 1, tier: 'pro', color: '#b5652f' },
  ];
  const byType = {};
  for (const it of ITEMS) byType[it.type] = it;
  const FLOORS = [
    { id: 'plain', tier: 'free', color: '#f1f1f3' }, { id: 'speckle', tier: 'free', color: '#d9d9de' },
    { id: 'planks', tier: 'free', color: '#cfa06a' }, { id: 'checker', tier: 'free', color: '#a9d3b3' },
    { id: 'tiles', tier: 'free', color: '#e8e2d6' }, { id: 'herringbone', tier: 'pro', color: '#b98552' },
    { id: 'neon', tier: 'pro', color: '#16131f' },
  ];
  const WALLS = [
    { id: 'plain', tier: 'free', color: '#f7f7f9' }, { id: 'stripes', tier: 'free', color: '#dde6f3' },
    { id: 'wainscot', tier: 'free', color: '#efe4d0' }, { id: 'brick', tier: 'pro', color: '#b5654a' },
  ];
  const MODES = [{ id: 'day', tier: 'free' }, { id: 'night', tier: 'pro' }];
  const PEOPLE = { body: '#3d5a8a', eye: '#4dd6ff', skin: '#f0c49a', hair: '#2b1d14' };

  // ————————————————————————————————— Documento de un espacio
  const newId = (kind) => (kind === 'desk' ? 'd-' : 'o-') + Math.random().toString(36).slice(2, 8);
  const empty = (kind) => ({
    schema: 5,
    id: newId(kind || 'office'),
    kind: kind || 'office',
    w: 8, row: ROWS[0].id, x: null, number: null, desk: null, deskColor: null,
    identity: { name: '', tagline: '', primary: '#1d1f24', accent: '#ffc367' },
    surfaces: { floor: 'plain', floorColor: '#f1f1f3', walls: 'plain', wallColor: '#f7f7f9' },
    mode: 'day',
    items: [],
    residents: [],
    content: { about: '', links: [] },
  });

  // La oficina mide lo que se arrienda; coordenadas relativas a su esquina; puerta al centro abajo.
  const area = (doc) => (doc.kind === 'desk' ? { x0: 0, w: 2, h: 2 } : { x0: 0, w: doc.w, h: DEPTH });
  const entriesOf = (a) => [{ x: Math.floor(a.w / 2) - 1, y: a.h - 1 }, { x: Math.floor(a.w / 2), y: a.h - 1 }];
  const m2 = (doc) => (doc.kind === 'desk' ? DESK.m2 : doc.w * DEPTH);
  // Precio de lista en US$ al mes (para cuando se cobre).
  const price = (doc) => (doc.kind === 'desk' ? DESK.price : Math.round(m2(doc) * PRICE_PER_M2));
  // Más metros, más gente y más objetos.
  const limits = (doc) => (doc.kind === 'desk'
    ? { maxItems: 0, maxResidents: DESK.residents, maxLinks: PLAN.maxLinks }
    : { maxItems: doc.w * 2, maxResidents: Math.ceil(doc.w * 0.9), maxLinks: PLAN.maxLinks });

  const clampText = (v, n) => String(v == null ? '' : v).slice(0, n);
  const isColor = (v) => /^#[0-9a-f]{6}$/i.test(v || '');
  const isUrl = (v) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v || '');
  const pick = (list, id, fallback) => (list.some((o) => o.id === id) ? id : fallback);

  // Dimensiones y si bloquea el paso, para cualquier cosa que ocupe casillas.
  function footprint(thing) {
    if (thing.kind === 'agent' || thing.kind === 'human') return { w: 1, h: 1, solid: true };
    const def = byType[thing.type];
    return { w: def.w, h: def.h, solid: def.solid !== false };
  }
  // Casillas ocupadas por cosas sólidas (excepto la que se está moviendo).
  function occupancy(doc, room, skip) {
    const occ = new Uint8Array(room.w * room.h);
    const mark = (thing) => {
      if (thing === skip) return;
      const f = footprint(thing);
      if (!f.solid) return;
      for (let y = thing.y; y < thing.y + f.h; y++)
        for (let x = thing.x; x < thing.x + f.w; x++) if (x >= 0 && y >= 0 && x < room.w && y < room.h) occ[y * room.w + x] = 1;
    };
    doc.items.forEach(mark);
    doc.residents.forEach(mark);
    return occ;
  }
  // ¿Se puede poner "thing" en (x, y)? Devuelve null si sí, o el motivo si no.
  function canPlace(doc, thing, x, y, skip) {
    const room = area(doc);
    const f = footprint(thing);
    if (x < 0 || y < 0 || x + f.w > room.w || y + f.h > room.h) return 'bounds';
    const occ = occupancy(doc, room, skip);
    const entries = entriesOf(room);
    for (let yy = y; yy < y + f.h; yy++)
      for (let xx = x; xx < x + f.w; xx++) {
        if (f.solid && occ[yy * room.w + xx]) return 'overlap';
        if (f.solid && entries.some((e) => e.x === xx && e.y === yy)) return 'door';
      }
    if (!f.solid) return null;
    // Con la pieza puesta, todo lo importante tiene que poder alcanzarse caminando desde la puerta.
    for (let yy = y; yy < y + f.h; yy++) for (let xx = x; xx < x + f.w; xx++) occ[yy * room.w + xx] = 1;
    const reach = new Uint8Array(room.w * room.h), q = [];
    for (const e of entries) if (!occ[e.y * room.w + e.x]) { reach[e.y * room.w + e.x] = 1; q.push(e); }
    while (q.length) {
      const c = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = c.x + dx, ny = c.y + dy, i = ny * room.w + nx;
        if (nx < 0 || ny < 0 || nx >= room.w || ny >= room.h || reach[i] || occ[i]) continue;
        reach[i] = 1;
        q.push({ x: nx, y: ny });
      }
    }
    const reachable = (t, tx, ty) => {
      const ff = footprint(t);
      for (let yy = ty - 1; yy <= ty + ff.h; yy++)
        for (let xx = tx - 1; xx <= tx + ff.w; xx++)
          if (xx >= 0 && yy >= 0 && xx < room.w && yy < room.h && reach[yy * room.w + xx]) return true;
      return false;
    };
    const important = doc.residents.concat(doc.items.filter((it) => byType[it.type].info));
    for (const t of important) {
      const tx = t === skip ? x : t.x, ty = t === skip ? y : t.y;
      if (!reachable(t, tx, ty)) return 'blocked';
    }
    if ((thing.kind || byType[thing.type].info) && !reachable(thing, x, y)) return 'blocked';
    return null;
  }

  // Superficies de la versión 1 (un id = patrón y color fijos) a patrón + color.
  const OLD_FLOORS = { white: ['plain', '#f1f1f3'], concrete: ['speckle', '#d9d9de'], oak: ['planks', '#cfa06a'], mint: ['checker', '#a9d3b3'], navy: ['speckle', '#2f3e5e'] };
  const OLD_WALLS = { white: '#f7f7f9', cream: '#efe4d0', mint: '#e2eedc', sky: '#dde6f3', graphite: '#3a3d45' };
  function surfacesOf(s, identity) {
    let floor = s.floor, floorColor = s.floorColor, walls = s.walls, wallColor = s.wallColor;
    if (OLD_FLOORS[floor]) [floor, floorColor] = isColor(floorColor) ? [OLD_FLOORS[floor][0], floorColor] : OLD_FLOORS[floor];
    if (OLD_WALLS[walls] || walls === 'brand') {
      if (!isColor(wallColor)) wallColor = walls === 'brand' ? identity.primary : OLD_WALLS[walls];
      walls = 'plain';
    }
    floor = pick(FLOORS, floor, 'plain');
    walls = pick(WALLS, walls, 'plain');
    return {
      floor, walls,
      floorColor: isColor(floorColor) ? floorColor.toLowerCase() : FLOORS.find((f) => f.id === floor).color,
      wallColor: isColor(wallColor) ? wallColor.toLowerCase() : WALLS.find((f) => f.id === walls).color,
    };
  }

  // Limpia un documento que viene de afuera (guardado, importado, plantilla o del navegador
  // hacia el servidor): todo lo que no cumple se descarta o se corrige.
  const ID_RE = /^([od]-[a-z0-9]{1,12}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
  function sanitize(raw) {
    const doc = empty(raw && raw.kind === 'desk' ? 'desk' : 'office');
    if (!raw || typeof raw !== 'object') return doc;
    if (ID_RE.test(raw.id || '')) doc.id = raw.id;
    if (doc.kind === 'desk') {
      doc.desk = Number.isInteger(raw.desk) && raw.desk >= 0 && raw.desk < DESKS.length ? raw.desk : null;
      doc.deskColor = isColor(raw.deskColor) ? raw.deskColor.toLowerCase() : null;
    } else {
      // Ancho en metros; los espacios de antes traían un tamaño (s/m/l/xl) y un "slot".
      const preset = SIZES.find((z) => z.id === raw.size);
      const w = Number.isFinite(raw.w) ? Math.round(raw.w) : preset ? preset.w : 16;
      doc.w = Math.max(RULES.minWidth, Math.min(RULES.maxWidth, w));
      doc.row = ROWS.some((r) => r.id === raw.row) ? raw.row : ROWS[0].id;
      doc.x = Number.isFinite(raw.x) ? Math.round(raw.x) : Number.isFinite(raw.slot) ? 1 + Math.round(raw.slot) : null;
      doc.number = Number.isInteger(raw.number) ? raw.number : null;
    }
    const lim = limits(doc);
    const id = raw.identity || {};
    doc.identity = {
      name: clampText(id.name, 24),
      tagline: clampText(id.tagline, 60),
      primary: isColor(id.primary) ? id.primary : doc.identity.primary,
      accent: isColor(id.accent) ? id.accent : doc.identity.accent,
    };
    doc.surfaces = surfacesOf(raw.surfaces || {}, doc.identity);
    doc.mode = pick(MODES, raw.mode, 'day');
    const c = raw.content || {};
    doc.content = {
      about: clampText(c.about, 280),
      links: (Array.isArray(c.links) ? c.links : [])
        .filter((l) => l && isUrl(l.url))
        .slice(0, PLAN.maxLinks)
        .map((l) => ({ label: clampText(l.label, 30), url: clampText(l.url, 300) })),
    };
    // Objetos y personas se agregan uno a uno con las mismas reglas del editor.
    for (const it of Array.isArray(raw.items) ? raw.items.slice(0, 200) : []) {
      const def = it && byType[it.type];
      if (!def || doc.items.length >= lim.maxItems) continue;
      const item = { type: it.type, x: it.x | 0, y: it.y | 0 };
      if (def.variants) item.variant = def.variants.includes(it.variant) ? it.variant : def.variants[0];
      // Color libre; en la versión 1 el color de sillas y sofás venía en "variant".
      const color = isColor(it.color) ? it.color : (it.type === 'chair' || it.type === 'sofa') && isColor(it.variant) ? it.variant : null;
      if (color && def.color) item.color = color.toLowerCase();
      if (!canPlace(doc, item, item.x, item.y)) doc.items.push(item);
    }
    for (const p of Array.isArray(raw.residents) ? raw.residents.slice(0, 100) : []) {
      if (!p || doc.residents.length >= lim.maxResidents) continue;
      const res = {
        kind: p.kind === 'human' ? 'human' : 'agent',
        name: clampText(p.name, 18) || '—',
        title: clampText(p.title, 30),
        bio: clampText(p.bio, 160),
        lines: (Array.isArray(p.lines) ? p.lines : []).map((l) => clampText(l, 40)).filter(Boolean).slice(0, 3),
        x: p.x | 0,
        y: p.y | 0,
        body: isColor(p.body) ? p.body : PEOPLE.body,
        eye: isColor(p.eye) ? p.eye : PEOPLE.eye,
        skin: isColor(p.skin) ? p.skin : PEOPLE.skin,
        hair: isColor(p.hair) ? p.hair : PEOPLE.hair,
      };
      if (doc.kind === 'desk' || !canPlace(doc, res, res.x, res.y)) doc.residents.push(res);
    }
    return doc;
  }

  // Cuánto de lo que usa el espacio es PRO (lo que en la versión de pago se cobraría aparte).
  function proUsage(doc) {
    if (doc.kind === 'desk') return 0;
    let n = doc.items.filter((it) => byType[it.type].tier === 'pro').length;
    if (FLOORS.find((f) => f.id === doc.surfaces.floor).tier === 'pro') n++;
    if (WALLS.find((f) => f.id === doc.surfaces.walls).tier === 'pro') n++;
    if (MODES.find((f) => f.id === doc.mode).tier === 'pro') n++;
    return n;
  }

  return {
    DEPTH, PRICE_PER_M2, DESK, SIZES, PLAN, HOLD,
    RULES, ROWS, COWORK, DESKS, fillGap, floorPlan, starts,
    leasesOf, startsFor, fitPlace, fits, numberFor, freeDesks,
    ITEMS, byType, FLOORS, WALLS, MODES, PEOPLE,
    newId, empty, area, entriesOf, m2, price, limits, footprint, canPlace, surfacesOf, sanitize, proUsage,
    isColor, isUrl, clampText,
  };
});
