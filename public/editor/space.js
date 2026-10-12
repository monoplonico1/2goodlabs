// Un "espacio" es el documento que describe lo que alguien arrienda: una oficina o un puesto
// en el coworking. Es solo datos (JSON) y se guarda en el servidor (editor/cloud.js). Una
// cuenta puede tener varios; cada uno se personaliza por separado, estando en él.
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

  // Plantillas: editor/templates.js (una oficina completa para cada ancho).
  const templates = TGL.templates || [];

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
  // coworking y pone objetos y personas. Un espacio con reserved: true es de otra persona que
  // todavía lo está armando: se ve en obra, sin su contenido.
  let shown = [];
  function render(list) {
    for (const d of shown) {
      world.removeTagged(d.id);
      TGL.game.setResidents(d.id, []);
      if (d.kind === 'desk' && d.desk != null) { world.removeTagged('desk-' + d.desk); zone.freeDesk(d.desk); }
    }
    for (let i = TGL.rooms.length - 1; i >= 0; i--) if (TGL.rooms[i].deskRoom && !list.some((d) => d.id === TGL.rooms[i].id)) TGL.rooms.splice(i, 1);
    // Si algún espacio no cumple las normas del piso (p. ej. datos de un plano anterior), se
    // muestran los demás en vez de nada.
    if (!zone.build(leasesOf(list))) {
      const ok = [];
      for (const d of list) if (d.kind !== 'office' || zone.build(leasesOf(ok.concat(d)))) ok.push(d);
      list = ok;
      if (!zone.build(leasesOf(list))) return false;
    }
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

  const RESERVED = { es: 'RESERVADA', en: 'RESERVED' };
  function officeContent(doc) {
    const room = world.room(doc.id);
    brand(room, doc, (TGL.lang === 'en' ? 'Office ' : 'Oficina ') + doc.number);
    room.reserved = !!doc.reserved;
    if (doc.reserved) {
      room.name = RESERVED;
      room.blurb = { es: 'Alguien la está armando. Si no la publica a tiempo, vuelve a estar libre.', en: 'Someone is setting it up. If they don\'t publish it in time, it becomes available again.' };
      room.info = null;
    }
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
    if (doc.reserved) room.name = RESERVED;
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

  // Lo que se reserva por otra persona se ve así: solo el lugar, en obra.
  function reservedDoc(s) {
    return Object.assign(empty(s.kind), {
      id: s.id, row: s.row, x: s.x, w: s.w || 8, number: s.number, desk: s.desk,
      reserved: true, deskColor: '#f2c94c',
      surfaces: { floor: 'checker', floorColor: '#e8d9a8', walls: 'stripes', wallColor: '#f2e6c4' },
    });
  }

  // ————————————————————————————————— Lo guardado en este navegador (versión anterior)
  // Antes del servidor, los espacios se guardaban solo aquí. Se leen para ofrecer publicarlos.
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
    m2, price, startsFor, fitPlace, numberFor, freeDesks, settle, render, reservedDoc, load, save,
  };
})();
