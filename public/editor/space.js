// Un "espacio" es el documento que describe lo que alguien arrienda: una oficina o un puesto
// en el coworking. Es solo datos (JSON): lo que hoy se guarda en este navegador es exactamente
// lo que mañana guardaría el servidor. Una cuenta puede arrendar varios; cada uno se
// personaliza por separado, estando en él.
//
// {
//   schema: 4, id, kind: 'office' | 'desk',
//   office: w (8–24 m de ancho, 8 de fondo), row ('A' | 'B'), x (columna donde empieza), number
//   desk:   desk (número de puesto en el coworking)
//   identity: { name, tagline, primary, accent },        // letrero y colores de marca
//   surfaces: { floor, floorColor, walls, wallColor },   // patrón del catálogo + color libre
//   mode: 'day' | 'night',
//   items: [{ type, x, y, variant?, color? }],            // x, y relativos a la oficina
//   residents: [{ kind: 'agent'|'human', name, title, bio, lines: [], x, y, body, eye, skin, hair }],
//   content: { about, links: [{ label, url }] },
//   deskColor,                                            // solo puestos
// }

(function () {
  const SCHEMA = 5; // 5: el edificio creció a la izquierda (las x de antes se corren)
  const cat = TGL.catalog;
  const world = TGL.world;
  const zone = world.zone;
  const KEY = 'tgl-myspace';
  const OLD_KEYS = ['tgl-spaces', 'tgl-space:rent3']; // pruebas anteriores: se descartan
  const DEPTH = 8;

  const newId = (kind) => (kind === 'desk' ? 'd-' : 'o-') + Math.random().toString(36).slice(2, 8);
  const empty = (kind) => ({
    schema: SCHEMA,
    id: newId(kind || 'office'),
    kind: kind || 'office',
    w: 8, row: 'A', x: null, number: null, desk: null, deskColor: null,
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
        w: 16,
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
        w: 16,
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
        w: 16,
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

  // ————————————————————————————————— Tamaño y lugar
  // La oficina mide lo que se arrienda y el edificio construye sus muros a esa medida
  // (world.zone). Coordenadas relativas a su esquina; la puerta va centrada abajo.
  const area = (doc) => (doc.kind === 'desk' ? { x0: 0, w: 2, h: 2 } : { x0: 0, w: doc.w, h: DEPTH });
  const entriesOf = (a) => [{ x: Math.floor(a.w / 2) - 1, y: a.h - 1 }, { x: Math.floor(a.w / 2), y: a.h - 1 }];
  const m2 = (doc) => (doc.kind === 'desk' ? cat.desk.m2 : doc.w * DEPTH);
  const price = (doc) => (doc.kind === 'desk' ? cat.desk.price : Math.round(m2(doc) * cat.pricePerM2));
  // Más metros, más gente y más objetos.
  const limits = (doc) => (doc.kind === 'desk'
    ? { maxItems: 0, maxResidents: cat.desk.residents, maxLinks: cat.plan.maxLinks }
    : { maxItems: doc.w * 2, maxResidents: Math.ceil(doc.w * 0.9), maxLinks: cat.plan.maxLinks });
  const sizesFor = () => cat.sizes.filter((z) => !z.soon);

  // Oficinas como las entiende el edificio.
  const leasesOf = (list) => list.filter((d) => d.kind === 'office' && d.x != null).map((d) => ({ id: d.id, row: d.row, a: d.x, w: d.w, number: d.number }));
  // Lugares válidos para una oficina de ancho w en una fila, con las demás donde están.
  const startsFor = (list, doc, row, w) => zone.starts(leasesOf(list), row, w == null ? doc.w : w, doc.id);
  // El lugar válido más cercano al pedido: primero en la misma fila, si no en la otra.
  function fitPlace(list, doc, row, x, w) {
    const rows = [row].concat(zone.ROWS.map((r) => r.id).filter((r) => r !== row));
    for (const rw of rows) {
      const ok = startsFor(list, doc, rw, w);
      if (!ok.length) continue;
      const want = x == null ? ok[0] : x;
      return { row: rw, x: ok.reduce((best, s) => (Math.abs(s - want) < Math.abs(best - want) ? s : best), ok[0]) };
    }
    return null;
  }
  // Número de oficina: 1xx abajo (fila B), 2xx arriba (fila A).
  function numberFor(list, doc, row) {
    const base = zone.ROWS.find((r) => r.id === row).num;
    const used = list.filter((d) => d.id !== doc.id && d.kind === 'office').map((d) => d.number);
    let n = base;
    while (used.includes(n)) n++;
    return n;
  }
  const freeDesks = (list, doc) => zone.DESKS.map((d, i) => i).filter((i) => !list.some((o) => o.kind === 'desk' && o.id !== (doc && doc.id) && o.desk === i));

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
    const important = doc.residents.concat(doc.items.filter((it) => cat.byType[it.type].info));
    for (const t of important) {
      const tx = t === skip ? x : t.x, ty = t === skip ? y : t.y;
      if (!reachable(t, tx, ty)) return 'blocked';
    }
    if ((thing.kind || cat.byType[thing.type].info) && !reachable(thing, x, y)) return 'blocked';
    return null;
  }

  // Limpia un documento que viene de afuera (guardado, importado o plantilla).
  function sanitize(raw) {
    const doc = empty(raw && raw.kind === 'desk' ? 'desk' : 'office');
    if (!raw || typeof raw !== 'object') return doc;
    if (/^[od]-[a-z0-9]{1,12}$/.test(raw.id || '')) doc.id = raw.id;
    if (doc.kind === 'desk') {
      doc.desk = Number.isInteger(raw.desk) && raw.desk >= 0 && raw.desk < zone.DESKS.length ? raw.desk : null;
      doc.deskColor = isColor(raw.deskColor) ? raw.deskColor.toLowerCase() : null;
    } else {
      // Ancho en metros; los espacios de antes traían un tamaño (s/m/l/xl) y un "slot".
      const preset = cat.sizes.find((z) => z.id === raw.size);
      const w = Number.isFinite(raw.w) ? Math.round(raw.w) : preset ? preset.w : 16;
      doc.w = Math.max(zone.RULES.minWidth, Math.min(zone.RULES.maxWidth, w));
      doc.row = zone.ROWS.some((r) => r.id === raw.row) ? raw.row : 'A';
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
      if (!canPlace(doc, item, item.x, item.y)) doc.items.push(item);
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
      if (doc.kind === 'desk' || !canPlace(doc, res, res.x, res.y)) doc.residents.push(res);
    }
    return doc;
  }

  // ————————————————————————————————— Ubicar una lista de espacios (validar y acomodar)
  // Cada oficina queda donde pidió si cumple las normas con las anteriores; si no, en el lugar
  // válido más cercano; si no cabe en ninguna parte, se descarta. Igual con los puestos.
  function settle(list) {
    const out = [];
    for (const d of list) {
      if (d.kind === 'office') {
        const ok = d.x != null && startsFor(out, d, d.row).includes(d.x);
        const place = ok ? { row: d.row, x: d.x } : fitPlace(out, d, d.row, d.x);
        if (!place) continue;
        if (place.row !== d.row || !d.number) d.number = numberFor(out, d, place.row);
        Object.assign(d, place);
      } else {
        const free = freeDesks(out, d);
        if (!free.length) continue;
        if (!free.includes(d.desk)) d.desk = free[0];
      }
      out.push(d);
    }
    return out;
  }

  // ————————————————————————————————— Aplicar al edificio
  // Muestra exactamente esta lista: construye las oficinas, cambia los escritorios del
  // coworking y pone objetos y personas.
  let shown = [];
  function render(list) {
    for (const d of shown) {
      world.removeTagged(d.id);
      TGL.game.setResidents(d.id, []);
      if (d.kind === 'desk' && d.desk != null) { world.removeTagged('desk-' + d.desk); zone.freeDesk(d.desk); }
    }
    for (let i = TGL.rooms.length - 1; i >= 0; i--) if (TGL.rooms[i].deskRoom && !list.some((d) => d.id === TGL.rooms[i].id)) TGL.rooms.splice(i, 1);
    if (!zone.build(leasesOf(list))) return false;
    for (const d of list) (d.kind === 'desk' ? deskContent : officeContent)(d);
    world.refreshAllSolids();
    for (const d of list) TGL.game.setResidents(d.id, residentsOf(d));
    shown = list.slice();
    TGL.game.refreshStatic();
    return true;
  }

  // Lo que el edificio muestra de alguien: nombre, descripción y links (bloque "?").
  function brand(room, doc, fallback) {
    const name = doc.identity.name || fallback;
    room.custom = doc;
    room.name = { es: name, en: name };
    room.blurb = doc.identity.tagline ? { es: doc.identity.tagline, en: doc.identity.tagline } : { es: '', en: '' };
    room.infoTitle = name;
    const about = doc.content.about || doc.identity.tagline || '';
    room.info = { es: about, en: about };
    room.infoLinks = doc.content.links.map((l) => l.url);
  }

  function officeContent(doc) {
    const room = world.room(doc.id);
    brand(room, doc, (TGL.lang === 'en' ? 'Office ' : 'Oficina ') + doc.number);
    for (const it of doc.items) {
      const def = cat.byType[it.type];
      world.addObject(cat.build(def, it), room.x + it.x, room.y + it.y, def.w, def.h, {
        tag: doc.id,
        solid: def.solid !== false,
        floor: !!def.floor,
        anim: def.anim || null,
        interact: def.info ? { type: 'info', room: doc.id } : null,
      });
    }
  }

  // Un puesto: su escritorio (con su color) y una "sala" sin superficie solo para su tarjeta.
  function deskContent(doc) {
    let room = world.room(doc.id);
    if (!room) TGL.rooms.push((room = { id: doc.id, deskRoom: true, rects: [], color: '#f2a65a' }));
    brand(room, doc, (TGL.lang === 'en' ? 'Desk ' : 'Puesto ') + (doc.desk + 1));
    const cw = world.room('cowork'), d = zone.DESKS[doc.desk], def = cat.byType.desk;
    world.removeTagged('desk-' + doc.desk);
    world.addObject(cat.build(def, { color: doc.deskColor }), cw.x + d.x, cw.y + d.y, 2, 1, {
      tag: doc.id, anim: def.anim, interact: { type: 'info', room: doc.id },
    });
  }

  function residentsOf(doc) {
    const lines = (p) => (p.lines.length ? p.lines : ['…']);
    const desk = doc.kind === 'desk' ? zone.DESKS[doc.desk] : null;
    return doc.residents.map((p, i) => ({
      id: doc.id + '-' + i,
      room: desk ? 'cowork' : doc.id,
      kind: p.kind,
      name: p.name,
      x: (desk ? desk.x + i : p.x) + 0.5,
      row: desk ? desk.y + 1 : p.y,
      body: p.body,
      eye: p.kind === 'agent' ? p.eye : undefined,
      look: { skin: p.skin, hair: p.hair, hairStyle: 'short', body: p.body, legs: '#262b36' },
      title: p.title ? { es: p.title, en: p.title } : null,
      bio: { es: p.bio || '', en: p.bio || '' },
      tasks: { es: [], en: [] },
      statuses: { es: lines(p), en: lines(p) },
    }));
  }

  // ————————————————————————————————— Guardado local (por ahora)
  // Los espacios de este navegador, ya validados y ubicados.
  function load() {
    let raw = null;
    try {
      raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      raw = null;
    }
    const shift = raw && raw.schema < 5 ? world.zone.ROWS[0].bays[0].L - 1 : 0;
    const list = raw && Array.isArray(raw.spaces) ? raw.spaces.map((d) => sanitize(shift && Number.isFinite(d.x) ? Object.assign({}, d, { x: d.x + shift }) : d)) : [];
    return settle(list);
  }
  // Devuelve true solo si quedó escrito (se relee para comprobarlo).
  function save(list) {
    try {
      const txt = JSON.stringify({ schema: SCHEMA, spaces: list });
      localStorage.setItem(KEY, txt);
      return localStorage.getItem(KEY) === txt;
    } catch (e) {
      return false;
    }
  }

  // Cuánto de lo que usa el espacio es PRO (lo que en la versión de pago se cobraría).
  function proUsage(doc) {
    if (doc.kind === 'desk') return 0;
    let n = doc.items.filter((it) => cat.byType[it.type].tier === 'pro').length;
    if (cat.floors.find((f) => f.id === doc.surfaces.floor).tier === 'pro') n++;
    if (cat.walls.find((f) => f.id === doc.surfaces.walls).tier === 'pro') n++;
    if (cat.modes.find((f) => f.id === doc.mode).tier === 'pro') n++;
    return n;
  }

  TGL.space = {
    SCHEMA, empty, newId, templates, sanitize, canPlace, footprint, proUsage, area, limits, sizesFor, entriesOf,
    m2, price, startsFor, fitPlace, numberFor, freeDesks, settle, render, load, save,
  };

  // Al cargar la página, lo que se guardó en este navegador aparece en el edificio.
  render(load());
})();
