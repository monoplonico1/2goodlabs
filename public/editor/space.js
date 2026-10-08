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
  // Normas, límites y validación: js/rules.js, el mismo archivo que usa el servidor.
  const R = TGL.rules;
  const { newId, empty, sanitize, canPlace, footprint, proUsage, area, limits, entriesOf, m2, price } = R;
  const { leasesOf, startsFor, fitPlace, numberFor, freeDesks } = R;

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

  const sizesFor = () => R.SIZES.filter((z) => !z.soon);

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
    // Lo guardado con edificios anteriores se pasa al de ahora: primero se quita el corrimiento
    // de cuando creció (ox) y después, si es de antes del pasillo izquierdo (geo < 2), cada x se
    // corre como se corrieron las salas (el Board creció 4 y el pasillo suma 3) y los puestos
    // del coworking pasan de 4 a 5 por fila.
    const savedOx = raw ? (raw.ox != null ? raw.ox : raw.schema >= 5 ? 24 : 0) : 0;
    const old = !raw || !(raw.geo >= 2);
    const fixX = (x) => { x -= savedOx; return old ? (x >= 12 ? x + 7 : x + 3) : x; };
    const fix = (d) => Object.assign({}, d, Number.isFinite(d.x) ? { x: fixX(d.x) } : {}, old && Number.isInteger(d.desk) ? { desk: d.desk >= 4 ? d.desk + 1 : d.desk } : {});
    const list = raw && Array.isArray(raw.spaces) ? raw.spaces.map((d) => sanitize(fix(d))) : [];
    return settle(list);
  }
  // Devuelve true solo si quedó escrito (se relee para comprobarlo).
  function save(list) {
    try {
      const txt = JSON.stringify({ schema: SCHEMA, ox: zone.OX, geo: 2, spaces: list });
      localStorage.setItem(KEY, txt);
      return localStorage.getItem(KEY) === txt;
    } catch (e) {
      return false;
    }
  }

  TGL.space = {
    SCHEMA, empty, newId, templates, sanitize, canPlace, footprint, proUsage, area, limits, sizesFor, entriesOf,
    m2, price, startsFor, fitPlace, numberFor, freeDesks, settle, render, load, save,
  };

  // Al cargar la página, lo que se guardó en este navegador aparece en el edificio.
  render(load());
})();
