// Un "espacio" es el documento que describe una oficina personalizada. Es solo datos (JSON):
// lo que hoy se guarda en este navegador es exactamente lo que mañana guardaría el servidor.
//
// {
//   schema: 3, room: 'rent3',
//   size: 's' | 'm' | 'l' | 'xl',                        // lo que se arrienda (catalog.sizes)
//   slot: n,                                              // dónde empieza en la planta libre (m desde la izquierda)
//   identity: { name, tagline, primary, accent },        // letrero y colores de marca
//   surfaces: { floor, floorColor, walls, wallColor },   // patrón del catálogo + color libre
//   mode: 'day' | 'night',
//   items: [{ type, x, y, variant?, color? }],            // x, y relativos a la sala
//   residents: [{ kind: 'agent'|'human', name, title, bio, lines: [], x, y, body, eye, skin, hair }],
//   content: { about, links: [{ label, url }] },
// }

(function () {
  const SCHEMA = 3;
  const cat = TGL.catalog;
  const world = TGL.world;
  const KEY = (id) => 'tgl-space:' + id;

  const empty = (roomId) => ({
    schema: SCHEMA,
    room: roomId,
    size: 's',
    slot: null,
    identity: { name: '', tagline: '', primary: '#1d1f24', accent: '#ffc367' },
    surfaces: { floor: 'plain', floorColor: '#f1f1f3', walls: 'plain', wallColor: '#f7f7f9' },
    mode: 'day',
    items: [],
    residents: [],
    content: { about: '', links: [] },
  });

  // ————————————————————————————————— Plantillas (pensadas para 16×8; lo que no cabe se descarta)
  const templates = [
    {
      id: 'ai-startup',
      name: { es: 'Startup de IA', en: 'AI startup' },
      doc: {
        size: 'l',
        identity: { name: 'Nova AI', tagline: 'Agentes que atienden a tus clientes', primary: '#1b2a4a', accent: '#4dd6ff' },
        surfaces: { floor: 'speckle', floorColor: '#d9d9de', walls: 'stripes', wallColor: '#e4ebf5' },
        mode: 'day',
        items: [
          { type: 'plant', x: 0, y: 0 }, { type: 'desk', x: 1, y: 2 }, { type: 'desk', x: 5, y: 2 },
          { type: 'desk-imac', x: 9, y: 2, color: '#1b2a4a' }, { type: 'whiteboard', x: 11, y: 0, variant: 'kanban' },
          { type: 'server', x: 14, y: 0, color: '#2f5fc4' }, { type: 'plant-white', x: 15, y: 0 },
          { type: 'table-meeting', x: 2, y: 5 }, { type: 'sofa', x: 10, y: 6, color: '#4dd6ff' },
          { type: 'info', x: 6, y: 6 }, { type: 'water', x: 15, y: 6 },
        ],
        residents: [
          { kind: 'agent', name: 'Atlas', title: 'Agente de soporte', bio: 'Responde a los clientes las 24 horas.', lines: ['3 tickets resueltos', 'Hola, ¿en qué te ayudo?'], x: 2, y: 1, body: '#2f5fc4', eye: '#4dd6ff' },
          { kind: 'agent', name: 'Iris', title: 'Agente de ventas', bio: 'Califica prospectos y agenda demos.', lines: ['Agendando una demo', 'Nuevo lead calificado'], x: 6, y: 1, body: '#6a4c93', eye: '#ff6fa8' },
          { kind: 'human', name: 'Sam', title: 'CEO', bio: 'Fundó Nova AI.', lines: ['¿Hablamos?'], x: 10, y: 1, body: '#2b2f3a', skin: '#e0ac7e', hair: '#2b1d14' },
        ],
        content: { about: 'Nova AI crea agentes de atención al cliente para equipos pequeños.', links: [{ label: 'Sitio web', url: 'https://example.com' }] },
      },
    },
    {
      id: 'studio',
      name: { es: 'Estudio creativo', en: 'Creative studio' },
      doc: {
        size: 'l',
        identity: { name: 'Pixel & Co.', tagline: 'Diseño de producto con IA', primary: '#6a4c93', accent: '#ffd24d' },
        surfaces: { floor: 'herringbone', floorColor: '#c9925a', walls: 'wainscot', wallColor: '#f6dcdc' },
        mode: 'day',
        items: [
          { type: 'whiteboard', x: 1, y: 0, variant: 'moodboard' }, { type: 'whiteboard', x: 4, y: 0, variant: 'chart' },
          { type: 'bookshelf', x: 13, y: 0, color: '#6a4c93' }, { type: 'plant', x: 15, y: 0 },
          { type: 'table-oak', x: 5, y: 3, color: '#f3e3b5' }, { type: 'chair-white', x: 4, y: 4, color: '#ffd24d' }, { type: 'chair-white', x: 9, y: 4, color: '#ffd24d' },
          { type: 'sofa', x: 11, y: 6, color: '#ff6fa8' }, { type: 'birdcage', x: 0, y: 4 },
          { type: 'plant-white', x: 0, y: 7 }, { type: 'info', x: 14, y: 6 },
        ],
        residents: [
          { kind: 'human', name: 'Ana', title: 'Directora de diseño', bio: 'Diseña productos digitales.', lines: ['Probando una idea', 'Menos es más'], x: 3, y: 2, body: '#e0a030', skin: '#c68a5a', hair: '#6b4a2b' },
          { kind: 'agent', name: 'Muse', title: 'Agente de ilustración', bio: 'Genera conceptos visuales.', lines: ['Generando 12 variantes'], x: 10, y: 2, body: '#3f8f5a', eye: '#ffd24d' },
        ],
        content: { about: 'Estudio de diseño que trabaja con IA de principio a fin.', links: [] },
      },
    },
    {
      id: 'lounge',
      name: { es: 'Lounge de comunidad', en: 'Community lounge' },
      doc: {
        size: 'l',
        identity: { name: 'The Lounge', tagline: 'Comunidad de builders con IA', primary: '#2c4a35', accent: '#ffc367' },
        surfaces: { floor: 'checker', floorColor: '#2c4a35', walls: 'brick', wallColor: '#8a4a3a' },
        mode: 'night',
        items: [
          { type: 'fridge', x: 0, y: 0 }, { type: 'coffee', x: 1, y: 0 }, { type: 'tv-sports', x: 12, y: 0 },
          { type: 'pingpong', x: 6, y: 2, color: '#2f5fc4' }, { type: 'sofa', x: 2, y: 4, color: '#f2a65a' },
          { type: 'sofa', x: 10, y: 4, color: '#f2a65a' }, { type: 'table', x: 3, y: 6 }, { type: 'table', x: 11, y: 6 },
          { type: 'info', x: 8, y: 6 }, { type: 'plant', x: 15, y: 7 },
        ],
        residents: [
          { kind: 'agent', name: 'Barista', title: 'Anfitrión', bio: 'Recibe a los que llegan.', lines: ['¿Café?', 'Hoy hay demo night'], x: 2, y: 1, body: '#8a3b3b', eye: '#ffd24d' },
        ],
        content: { about: 'Un lugar para conocer a otros que construyen con IA.', links: [] },
      },
    },
  ];

  // ————————————————————————————————— Validación
  const clampText = (v, n) => String(v == null ? '' : v).slice(0, n);
  const isColor = (v) => /^#[0-9a-f]{6}$/i.test(v || '');
  const isUrl = (v) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v || '');
  const pick = (list, id, fallback) => (list.some((o) => o.id === id) ? id : fallback);

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
    floor = pick(cat.floors, floor, 'plain');
    walls = pick(cat.walls, walls, 'plain');
    return {
      floor, walls,
      floorColor: isColor(floorColor) ? floorColor.toLowerCase() : cat.floors.find((f) => f.id === floor).color,
      wallColor: isColor(wallColor) ? wallColor.toLowerCase() : cat.walls.find((f) => f.id === walls).color,
    };
  }

  // ————————————————————————————————— Tamaño arrendado
  // La oficina mide lo que se arrienda: el edificio construye sus muros a esa medida
  // (world.setOffice). Coordenadas relativas a su esquina; la puerta va centrada abajo.
  function area(doc) {
    const z = cat.sizeOf(doc.size);
    return { x0: 0, w: z.w, h: z.h, size: z };
  }
  // Dónde puede ir la oficina en la planta libre según las normas del piso (world.floor),
  // como metros desde el extremo izquierdo. Si se pide un lugar que no cumple, el más cercano.
  const slots = (doc) => world.floor.starts(area(doc).w).map((x) => x - world.floor.STRIP.x);
  function fitSlot(doc, want) {
    const ok = slots(doc);
    if (want == null || !isFinite(want)) return ok[ok.length - 1];
    return ok.reduce((best, s) => (Math.abs(s - want) <= Math.abs(best - want) ? s : best), ok[0]);
  }
  const entriesOf = (a) => [{ x: Math.floor(a.w / 2) - 1, y: a.h - 1 }, { x: Math.floor(a.w / 2), y: a.h - 1 }];
  const limits = (doc) => {
    const z = cat.sizeOf(doc.size);
    return { maxItems: z.items, maxResidents: z.residents, maxLinks: cat.plan.maxLinks };
  };
  // Tamaños que caben en esta sala (los demás se muestran como "próximamente").
  const sizesFor = () => cat.sizes.filter((z) => !z.soon);

  // Dimensiones y si bloquea el paso, para cualquier cosa que ocupe casillas.
  function footprint(thing) {
    if (thing.kind === 'agent' || thing.kind === 'human') return { w: 1, h: 1, solid: true };
    const def = cat.byType[thing.type];
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
  function canPlace(doc, roomId, thing, x, y, skip) {
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
    const important = doc.residents.concat(doc.items.filter((it) => cat.byType[it.type].info));
    for (const t of important) {
      const tx = t === skip ? x : t.x, ty = t === skip ? y : t.y;
      if (!reachable(t, tx, ty)) return 'blocked';
    }
    if ((thing.kind || cat.byType[thing.type].info) && !reachable(thing, x, y)) return 'blocked';
    return null;
  }

  // Limpia un documento que viene de afuera (guardado, importado o plantilla).
  function sanitize(raw, roomId) {
    const doc = empty(roomId);
    if (!raw || typeof raw !== 'object') return doc;
    doc.size = cat.sizes.some((z) => z.id === raw.size && !z.soon) ? raw.size : 'l'; // sin tamaño = toda la sala
    doc.slot = fitSlot(doc, raw.slot == null ? null : Number(raw.slot));
    const lim = limits(doc);
    const id = raw.identity || {};
    doc.identity = {
      name: clampText(id.name, 24),
      tagline: clampText(id.tagline, 60),
      primary: isColor(id.primary) ? id.primary : doc.identity.primary,
      accent: isColor(id.accent) ? id.accent : doc.identity.accent,
    };
    doc.surfaces = surfacesOf(raw.surfaces || {}, doc.identity);
    doc.mode = pick(cat.modes, raw.mode, 'day');
    const c = raw.content || {};
    doc.content = {
      about: clampText(c.about, 280),
      links: (Array.isArray(c.links) ? c.links : [])
        .filter((l) => l && isUrl(l.url))
        .slice(0, cat.plan.maxLinks)
        .map((l) => ({ label: clampText(l.label, 30), url: clampText(l.url, 300) })),
    };
    // Objetos y personas se agregan uno a uno con las mismas reglas del editor.
    for (const it of Array.isArray(raw.items) ? raw.items : []) {
      const def = it && cat.byType[it.type];
      if (!def || doc.items.length >= lim.maxItems) continue;
      const item = { type: it.type, x: it.x | 0, y: it.y | 0 };
      if (def.variants) item.variant = def.variants.includes(it.variant) ? it.variant : def.variants[0];
      // Color libre; en la versión 1 el color de sillas y sofás venía en "variant".
      const color = isColor(it.color) ? it.color : def.paint && isColor(it.variant) ? it.variant : null;
      if (color && cat.colorable(def)) item.color = color.toLowerCase();
      if (!canPlace(doc, roomId, item, item.x, item.y)) doc.items.push(item);
    }
    for (const p of Array.isArray(raw.residents) ? raw.residents : []) {
      if (!p || doc.residents.length >= lim.maxResidents) continue;
      const res = {
        kind: p.kind === 'human' ? 'human' : 'agent',
        name: clampText(p.name, 18) || '—',
        title: clampText(p.title, 30),
        bio: clampText(p.bio, 160),
        lines: (Array.isArray(p.lines) ? p.lines : []).map((l) => clampText(l, 40)).filter(Boolean).slice(0, 3),
        x: p.x | 0,
        y: p.y | 0,
        body: isColor(p.body) ? p.body : cat.people.body[0],
        eye: isColor(p.eye) ? p.eye : cat.people.eye[0],
        skin: isColor(p.skin) ? p.skin : cat.people.skin[0],
        hair: isColor(p.hair) ? p.hair : cat.people.hair[0],
      };
      if (!canPlace(doc, roomId, res, res.x, res.y)) doc.residents.push(res);
    }
    return doc;
  }

  // ————————————————————————————————— Aplicar al edificio
  function apply(roomId, doc) {
    const room = world.room(roomId);
    if (!room._orig) room._orig = { name: room.name, blurb: room.blurb, info: room.info, infoTitle: room.infoTitle, infoLinks: room.infoLinks };
    world.removeTagged(roomId);

    if (!doc) {
      delete room.custom;
      world.setOffice(roomId, 0);
      Object.assign(room, room._orig);
      world.furnishRent(room);
      world.refreshSolids(roomId);
      TGL.game.setResidents(roomId, []);
      TGL.game.refreshStatic();
      return;
    }

    room.custom = doc;
    world.setOffice(roomId, area(doc).w, world.floor.STRIP.x + fitSlot(doc, doc.slot));
    const name = doc.identity.name || TGL.t(room._orig.name);
    room.name = { es: name, en: name };
    room.blurb = doc.identity.tagline ? { es: doc.identity.tagline, en: doc.identity.tagline } : room._orig.blurb;
    room.infoTitle = name;
    room.info = { es: doc.content.about || doc.identity.tagline, en: doc.content.about || doc.identity.tagline };
    room.infoLinks = doc.content.links.map((l) => l.url);

    for (const it of doc.items) {
      const def = cat.byType[it.type];
      world.addObject(cat.build(def, it), room.x + it.x, room.y + it.y, def.w, def.h, {
        tag: roomId,
        solid: def.solid !== false,
        floor: !!def.floor,
        anim: def.anim || null,
        interact: def.info ? { type: 'info', room: roomId } : null,
      });
    }
    world.refreshSolids(roomId);

    const lines = (p) => (p.lines.length ? p.lines : ['…']);
    TGL.game.setResidents(roomId, doc.residents.map((p, i) => ({
      id: roomId + '-' + i,
      kind: p.kind,
      name: p.name,
      x: p.x + 0.5,
      row: p.y,
      body: p.body,
      eye: p.kind === 'agent' ? p.eye : undefined,
      look: { skin: p.skin, hair: p.hair, hairStyle: 'short', body: p.body, legs: '#262b36' },
      title: p.title ? { es: p.title, en: p.title } : null,
      bio: { es: p.bio || '', en: p.bio || '' },
      tasks: { es: [], en: [] },
      statuses: { es: lines(p), en: lines(p) },
    })));
    TGL.game.refreshStatic();
  }

  // ————————————————————————————————— Guardado local (por ahora)
  function load(roomId) {
    try {
      const raw = localStorage.getItem(KEY(roomId));
      return raw ? sanitize(JSON.parse(raw), roomId) : null;
    } catch (e) {
      return null;
    }
  }
  // Devuelve true solo si quedó escrito (se relee para comprobarlo).
  function save(roomId, doc) {
    try {
      const txt = JSON.stringify(doc);
      localStorage.setItem(KEY(roomId), txt);
      return localStorage.getItem(KEY(roomId)) === txt;
    } catch (e) {
      return false;
    }
  }
  function clear(roomId) {
    try { localStorage.removeItem(KEY(roomId)); } catch (e) { /* nada que borrar */ }
  }

  // Cuánto de lo que usa el espacio es PRO (lo que en la versión de pago se cobraría).
  function proUsage(doc) {
    let n = doc.items.filter((it) => cat.byType[it.type].tier === 'pro').length;
    if (cat.floors.find((f) => f.id === doc.surfaces.floor).tier === 'pro') n++;
    if (cat.walls.find((f) => f.id === doc.surfaces.walls).tier === 'pro') n++;
    if (cat.modes.find((f) => f.id === doc.mode).tier === 'pro') n++;
    return n;
  }

  TGL.space = { SCHEMA, slots, fitSlot, empty, templates, sanitize, canPlace, footprint, apply, load, save, clear, proUsage, area, limits, sizesFor, entriesOf };

  // Al cargar la página, la oficina que alguien guardó en este navegador aparece en el edificio.
  for (const room of TGL.rooms.filter((q) => q.rent)) {
    const saved = load(room.id);
    if (saved) apply(room.id, saved);
  }
})();
