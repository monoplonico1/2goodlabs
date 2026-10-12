// Plantillas para no empezar de cero: cada una arma una oficina completa (colores, piso,
// paredes, muebles y equipo) para cualquier ancho que se venda (8, 12, 16 o 24 m). Lo que no
// cabe se descarta al validar (TGL.rules.sanitize), así que nunca queda nada mal puesto.
//
// La oficina tiene 8 m de fondo y la puerta abajo, al centro. Zonas:
//   y 0     pared del fondo: una planta en cada esquina y, entre ellas, lo de la pared
//   y 1     el equipo, cada uno detrás de su escritorio
//   y 2     escritorios (de 2 m, uno cada 3 m)
//   y 4–5   el centro (mesa, ping-pong, tapete…), desde 12 m, a la derecha de la puerta
//   y 6     descanso a los costados y el bloque "?" junto a la puerta
//   y 7     plantas en las esquinas de abajo

(function () {
  const N = (es, en) => ({ es, en });
  const R = TGL.rules;

  // Personas de ejemplo: los nombres y frases se cambian en el paso "Personas".
  const person = (kind, name, title, lines, body, eye) => ({
    kind, name, title, bio: '', lines, body, eye: eye || '#4dd6ff', skin: '#e0ac7e', hair: '#2b1d14',
  });

  function build(w, t) {
    const items = [], put = (type, x, y, extra) => items.push(Object.assign({ type, x, y }, extra || {}));
    const width = (type) => R.byType[type].w;
    // pared del fondo
    put(t.corner[0], 0, 0);
    put(t.corner[1] || t.corner[0], w - 1, 0);
    let x = 2;
    for (const it of t.wall) {
      if (x + width(it.type) > w - 2) break;
      put(it.type, x, 0, it.v);
      x += width(it.type) + 1;
    }
    // el bloque "?" primero, junto a la puerta: si algo choca con él, se descarta lo otro
    put('info', Math.floor(w / 2) + 1, 6);
    // escritorios y el equipo detrás
    const desks = [];
    for (let dx = 1; dx + 2 <= w - 1; dx += 3) desks.push(dx);
    desks.forEach((dx, i) => { const d = t.desks[i % t.desks.length]; put(d.type, dx, 2, d.v); });
    // centro (desde 12 m)
    if (w >= 12 && t.center) {
      // a la derecha de la puerta, para que desde la entrada se pueda subir derecho
      const c = t.center, cw = width(c.type), ch = R.byType[c.type].h;
      put(c.type, Math.min(Math.floor(w / 2) + 1, w - 1 - cw), ch > 2 ? 3 : 4, c.v);
      if (t.centerSide && w >= 16) put(t.centerSide.type, 1, 4, t.centerSide.v);
      if (t.centerSide2 && w >= 16) put(t.centerSide2.type, w - 1 - width(t.centerSide2.type), 4, t.centerSide2.v);
    }
    // descanso a los costados de la puerta (en una S, solo uno, un poco más arriba)
    if (w < 12 && t.loungeL) put(t.loungeL.type, 1, 5, t.loungeL.v);
    if (w >= 12) {
      if (t.loungeL) put(t.loungeL.type, 1, 6, t.loungeL.v);
      if (t.loungeR) put(t.loungeR.type, w - 1 - width(t.loungeR.type), 6, t.loungeR.v);
    }
    put(t.corner[0], 0, 7);
    put(t.corner[1] || t.corner[0], w - 1, 7);
    // el equipo: tantos como escritorios, hasta los que traiga la plantilla
    const residents = t.people.slice(0, Math.max(2, desks.length)).map((p, i) => Object.assign({}, p, { x: desks[i] != null ? desks[i] : i, y: 1 }));
    return {
      kind: 'office', w,
      identity: Object.assign({ name: '', tagline: '' }, t.identity),
      surfaces: t.surfaces,
      mode: t.mode || 'day',
      items,
      residents,
      content: { about: '', links: [] },
    };
  }

  const T = [
    {
      id: 'ai-startup',
      name: N('Startup de IA', 'AI startup'),
      note: N('Escritorios con pantallas, tablero de tareas, servidores y agentes trabajando.', 'Desks with screens, a task board, servers and agents at work.'),
      identity: { primary: '#1b2a4a', accent: '#4dd6ff' },
      surfaces: { floor: 'speckle', floorColor: '#d9d9de', walls: 'stripes', wallColor: '#e4ebf5' },
      corner: ['plant', 'plant-white'],
      wall: [{ type: 'whiteboard', v: { variant: 'kanban' } }, { type: 'server', v: { color: '#2f5fc4' } }, { type: 'display' }, { type: 'whiteboard', v: { variant: 'roadmap' } }, { type: 'server', v: { color: '#2f5fc4' } }, { type: 'printer' }],
      desks: [{ type: 'desk' }, { type: 'desk-imac', v: { color: '#1b2a4a' } }],
      center: { type: 'table-meeting' },
      loungeL: { type: 'sofa', v: { color: '#4dd6ff' } },
      loungeR: { type: 'water' },
      people: [
        person('agent', 'Atlas', 'Support agent', ['Ticket solved', 'How can I help?'], '#2f5fc4', '#4dd6ff'),
        person('human', 'You', 'Founder', ['Shipping today'], '#2b2f3a'),
        person('agent', 'Iris', 'Sales agent', ['New qualified lead'], '#6a4c93', '#ff6fa8'),
        person('agent', 'Ops', 'Operations agent', ['Deploy is green'], '#3f8f5a', '#9cff57'),
        person('agent', 'Echo', 'Marketing agent', ['Drafting a post'], '#8a3b3b', '#ffd24d'),
        person('human', 'Sam', 'Engineer', ['Reviewing a PR'], '#3d5a8a'),
      ],
    },
    {
      id: 'studio',
      name: N('Estudio creativo', 'Creative studio'),
      note: N('Moodboards, mesa grande de trabajo, libros y un loro de mascota.', 'Moodboards, a big work table, books and a pet parrot.'),
      identity: { primary: '#6a4c93', accent: '#ffd24d' },
      surfaces: { floor: 'herringbone', floorColor: '#c9925a', walls: 'wainscot', wallColor: '#f6dcdc' },
      corner: ['plant', 'plant'],
      wall: [{ type: 'whiteboard', v: { variant: 'moodboard' } }, { type: 'bookshelf', v: { color: '#6a4c93' } }, { type: 'whiteboard', v: { variant: 'chart' } }, { type: 'birdcage' }, { type: 'bookshelf', v: { color: '#6a4c93' } }],
      desks: [{ type: 'desk-imac', v: { color: '#f5f5f7' } }],
      center: { type: 'table-oak', v: { color: '#f3e3b5' } },
      loungeL: { type: 'sofa', v: { color: '#ff6fa8' } },
      loungeR: { type: 'plant-white' },
      people: [
        person('human', 'You', 'Creative director', ['Trying an idea', 'Less is more'], '#e0a030'),
        person('agent', 'Muse', 'Illustration agent', ['Generating 12 variants'], '#3f8f5a', '#ffd24d'),
        person('agent', 'Pixel', 'Design agent', ['Exporting assets'], '#ff6fa8', '#ffffff'),
        person('human', 'Ana', 'Designer', ['Pushing pixels'], '#6a4c93'),
        person('agent', 'Copy', 'Writing agent', ['Finding the right word'], '#2f5fc4', '#ffd24d'),
      ],
    },
    {
      id: 'lab',
      name: N('Laboratorio', 'Research lab'),
      note: N('Servidores, gráficos y pantallas para experimentar con modelos y datos.', 'Servers, charts and screens to experiment with models and data.'),
      identity: { primary: '#2c4a35', accent: '#9cff57' },
      surfaces: { floor: 'tiles', floorColor: '#e2eedc', walls: 'plain', wallColor: '#f7f7f9' },
      corner: ['plant-white', 'plant-white'],
      wall: [{ type: 'server', v: { color: '#2c4a35' } }, { type: 'server', v: { color: '#2c4a35' } }, { type: 'whiteboard', v: { variant: 'chart' } }, { type: 'display' }, { type: 'server', v: { color: '#2c4a35' } }, { type: 'whiteboard', v: { variant: 'roadmap' } }],
      desks: [{ type: 'desk-imac', v: { color: '#f5f5f7' } }, { type: 'desk' }],
      center: { type: 'table-meeting', v: { color: '#dcc39a' } },
      loungeL: { type: 'fridge' },
      loungeR: { type: 'water' },
      people: [
        person('agent', 'Lumen', 'Research agent', ['Running experiment 42', 'Loss is going down'], '#2c4a35', '#9cff57'),
        person('human', 'You', 'Lead researcher', ['Reading papers'], '#d9d9de'),
        person('agent', 'Data', 'Data agent', ['Cleaning the dataset'], '#2f5fc4', '#4dd6ff'),
        person('agent', 'Eval', 'Evaluation agent', ['Benchmarks updated'], '#e0a030', '#ffffff'),
        person('human', 'Kai', 'ML engineer', ['Training overnight'], '#3d5a8a'),
      ],
    },
    {
      id: 'shop',
      name: N('Tienda o negocio', 'Shop or business'),
      note: N('Estanterías con productos, mostrador y un rincón para recibir clientes.', 'Product shelves, a counter and a corner to welcome customers.'),
      identity: { primary: '#8a3b3b', accent: '#ffc367' },
      surfaces: { floor: 'planks', floorColor: '#cfa06a', walls: 'plain', wallColor: '#efe4d0' },
      corner: ['plant', 'plant'],
      wall: [{ type: 'bookshelf', v: { color: '#7a5230' } }, { type: 'shelf-white', v: { color: '#efe4d0' } }, { type: 'bookshelf', v: { color: '#7a5230' } }, { type: 'trophies' }, { type: 'bookshelf', v: { color: '#7a5230' } }, { type: 'shelf-white', v: { color: '#efe4d0' } }],
      desks: [{ type: 'desk', v: { color: '#5c3d22' } }],
      center: { type: 'rug', v: { color: '#f2a65a' } },
      centerSide: { type: 'bookshelf', v: { color: '#7a5230' } },
      centerSide2: { type: 'bookshelf', v: { color: '#7a5230' } },
      loungeL: { type: 'sofa', v: { color: '#8a3b3b' } },
      loungeR: { type: 'coffee' },
      people: [
        person('human', 'You', 'Owner', ['Welcome in!', 'New arrivals this week'], '#8a3b3b'),
        person('agent', 'Clerk', 'Sales agent', ['Can I help you find something?'], '#e0a030', '#ffd24d'),
        person('agent', 'Stock', 'Inventory agent', ['Restocking shelves'], '#3f8f5a', '#9cff57'),
        person('human', 'Lu', 'Shop assistant', ['Wrapping an order'], '#2f5fc4'),
      ],
    },
    {
      id: 'freelancer',
      name: N('Freelancer o portafolio', 'Freelancer or portfolio'),
      note: N('Un espacio tranquilo para mostrar tu trabajo, con tu asistente de IA.', 'A calm space to show your work, with your AI assistant.'),
      identity: { primary: '#1d1f24', accent: '#f2a65a' },
      surfaces: { floor: 'plain', floorColor: '#f1f1f3', walls: 'plain', wallColor: '#ffffff' },
      corner: ['plant-white', 'plant'],
      wall: [{ type: 'whiteboard', v: { variant: 'moodboard' } }, { type: 'tree' }, { type: 'trophies' }, { type: 'shelf-white' }, { type: 'whiteboard', v: { variant: 'roadmap' } }],
      desks: [{ type: 'desk-imac', v: { color: '#f5f5f7' } }, { type: 'desk', v: { color: '#dcc39a' } }],
      center: { type: 'rug', v: { color: '#f4e2d0' } },
      loungeL: { type: 'sofa', v: { color: '#f2a65a' } },
      loungeR: { type: 'cat' },
      people: [
        person('human', 'You', 'Freelancer', ['Open to new projects', 'Let\'s talk'], '#f2a65a'),
        person('agent', 'Ada', 'Assistant agent', ['Scheduling your calls'], '#2b2f3a', '#f2a65a'),
        person('agent', 'Quill', 'Writing agent', ['Updating the portfolio'], '#6a4c93', '#ffffff'),
      ],
    },
    {
      id: 'community',
      name: N('Comunidad', 'Community'),
      note: N('Ping-pong, café y sofás: un lugar para reunir a tu comunidad.', 'Ping-pong, coffee and sofas: a place to gather your community.'),
      identity: { primary: '#2c4a35', accent: '#ffc367' },
      surfaces: { floor: 'checker', floorColor: '#2c4a35', walls: 'brick', wallColor: '#8a4a3a' },
      mode: 'night',
      corner: ['plant', 'plant'],
      wall: [{ type: 'coffee' }, { type: 'tv-sports' }, { type: 'fridge' }, { type: 'bookshelf' }],
      desks: [{ type: 'table' }],
      center: { type: 'pingpong', v: { color: '#2f5fc4' } },
      loungeL: { type: 'sofa', v: { color: '#f2a65a' } },
      loungeR: { type: 'sofa', v: { color: '#f2a65a' } },
      people: [
        person('agent', 'Host', 'Community host', ['Coffee?', 'Demo night on Friday'], '#8a3b3b', '#ffd24d'),
        person('human', 'You', 'Organizer', ['Welcome to the community'], '#2c4a35'),
        person('agent', 'Events', 'Events agent', ['Sending invites'], '#2f5fc4', '#ff6fa8'),
      ],
    },
  ];

  // make(w): el documento de la plantilla para una oficina de ese ancho.
  TGL.templates = T.map((t) => ({ id: t.id, name: t.name, note: t.note, colors: [t.identity.primary, t.identity.accent, t.surfaces.floorColor], make: (w) => build(w, t) }));
})();
