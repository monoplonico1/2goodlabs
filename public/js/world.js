// El edificio: plano de tiles, muebles, colisiones y la capa estática ya pintada.
//
//  x:  0          12  15             31  34              51       60
//  0   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  1-2 │ cara      │░░│  cara        │░░│  cara          │   cielo
//  3-10│ Of. 101   │░░│  Of. 102     │░░│  Of. 103       │   y ciudad
//  11  ▀▀▀▀▀  ▀▀▀▀▀│░░│▀▀▀▀▀▀  ▀▀▀▀▀▀│░░│▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀│
//  12-13 cara del pasillo
//  14-15 ░░░░░░░░░░░░░░░ pasillo horizontal ░░░░░░░░░░░░░░░│ ═baranda═
//  16  ▀▀▀▀▀▀▀▀▀▀▀▀│░░│▀▀▀▀▀▀▀▀▀▀▀▀▀▀│░░│▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│
//  17-18 caras     │░░│              │░░│                │
//  19-30 Board     ⇆░░⇆  Zumi        ⇆░░⇆  Pickpals       ⇆ Terraza
//  31  ▀▀▀▀▀  ▀▀▀▀▀│░░│▀▀▀▀▀▀  ▀▀▀▀▀▀│░░│▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀│
//  32-33 cara del lobby (los pasillos verticales desembocan aquí)
//  34-42                 Lobby                            ⇆
//  43  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀═════════
//
//  Las salas y los pasillos se definen en data.js (TGL.rooms). Los muebles de cada sala
//  se ubican relativos a la esquina de la sala, así una sala se puede mover sin tocarlos.

(function () {
  const T = TGL.T, r = TGL.rect, art = TGL.art;
  const W = 61, H0 = 44;
  let H = H0;
  const TOP = 1, FACE = 2, SKY = 3, RAIL = 4;
  const FLOOR = { lobby: 10, board: 11, zumi: 12, pickpals: 13, terrace: 14, hall: 15, rent: 16, open: 17, cowork: 18 };
  const isFloor = (v) => v >= 10;
  const room = (id) => TGL.rooms.find((q) => q.id === id);
  const rectsOf = (q) => q.rects || [[q.x, q.y, q.w, q.h]];
  const floorOf = (q) => (q.rent ? FLOOR.rent : q.open ? FLOOR.open : q.cowork ? FLOOR.cowork : FLOOR[q.id]);
  const TERRACE = room('terrace');

  // Con el editor de oficinas encendido (js/features.js) el edificio crece hacia arriba: la
  // zona de arriendo tiene dos filas de oficinas (A arriba, B abajo) con un pasillo entre
  // ellas, un coworking y planta libre. Las oficinas se construyen ahí con el editor, del
  // tamaño y en el lugar que cada uno arriende, siguiendo las normas del piso (más abajo).
  const OPEN = !!(TGL.featureOn && TGL.featureOn('editor'));
  const OY = OPEN ? 16 : 0; // filas nuevas arriba
  if (OPEN) {
    for (const id of ['rent1', 'rent2', 'rent3']) TGL.rooms.splice(TGL.rooms.indexOf(room(id)), 1);
    room('hall').rects = [[1, 14, 50, 2], [13, 14, 2, 20], [32, 14, 2, 20]];
    TGL.rooms.push({
      id: 'open', open: true, rects: [],
      name: { es: 'Planta libre · Se arrienda', en: 'Open floor · For rent' },
      blurb: { es: 'Espacio libre del piso. Aquí se construyen las oficinas, del tamaño que cada uno arriende.', en: 'Free floor space. Offices are built here, as big as each tenant rents.' },
      color: '#c9c9ce',
    }, {
      id: 'cowork', cowork: true, x: 1, y: 3, w: 11, h: 8,
      name: { es: 'Coworking', en: 'Coworking' },
      blurb: { es: 'Puestos para creadores que trabajan con IA.', en: 'Desks for people who build with AI.' },
      infoTitle: 'Coworking',
      info: { es: 'Puestos para creadores que trabajan con IA: tu avatar, un agente y tu tarjeta con links. Se arriendan desde el editor (✎ arriba a la derecha).', en: 'Desks for people who build with AI: your avatar, one agent and your card with links. Rent one from the editor (✎ top right).' },
      color: '#f2a65a',
    });
  }

  // Puertas. 'h' atraviesa un muro horizontal (se pasa de arriba a abajo);
  // 'v' atraviesa un muro vertical (se pasa de lado). from/to: sala de cada lado.
  let DOORS = [
    // Salas → lobby
    { k: 'h', x: 5, y: 31, w: 2, from: 'board', to: 'lobby' },
    { k: 'h', x: 22, y: 31, w: 2, from: 'zumi', to: 'lobby' },
    { k: 'h', x: 42, y: 31, w: 2, from: 'pickpals', to: 'lobby' },
    // Oficinas en arriendo → pasillo
    { k: 'h', x: 5, y: 11, w: 2, from: 'rent1', to: 'hall', strip: true },
    { k: 'h', x: 22, y: 11, w: 2, from: 'rent2', to: 'hall', strip: true },
    { k: 'h', x: 42, y: 11, w: 2, from: 'rent3', to: 'hall', strip: true },
    // Pasillos verticales → salas
    { k: 'v', x: 12, y: 24, h: 2, to: 'hall' },
    { k: 'v', x: 15, y: 26, h: 2, to: 'hall' },
    { k: 'v', x: 31, y: 25, h: 2, to: 'hall' },
    { k: 'v', x: 34, y: 23, h: 2, to: 'hall' },
    // Pickpals y lobby → terraza (corredizas)
    { k: 'v', x: 51, y: 24, h: 2, to: 'terrace', glass: true },
    { k: 'v', x: 51, y: 37, h: 2, to: 'terrace', glass: true },
  ];

  let grid = new Array(W * H).fill(TOP);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? TOP : grid[y * W + x]);
  const set = (x, y, v) => { grid[y * W + x] = v; };
  const isWall = (v) => v === TOP || v === FACE;
  const isBlocked = (v) => v === TOP || v === FACE || v === SKY || v === RAIL;

  // 1. Pisos de salas y pasillos. 2. Caras de muro (dos tiles, se ven desde el sur),
  // solo donde todavía hay muro. 3. Puertas.
  for (const q of TGL.rooms)
    for (const [rx, ry, rw, rh] of rectsOf(q))
      for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) set(x, y, floorOf(q));
  for (const q of TGL.rooms)
    for (const [rx, ry, rw] of rectsOf(q))
      for (let x = rx; x < rx + rw; x++)
        for (const y of [ry - 1, ry - 2]) if (at(x, y) === TOP) set(x, y, FACE);
  if (OPEN) DOORS = DOORS.filter((d) => !d.strip);
  function openDoor(d) {
    if (d.k === 'h')
      for (let x = d.x; x < d.x + d.w; x++) {
        set(x, d.y, floorOf(room(d.from)));
        set(x, d.y + 1, floorOf(room(d.to)));
        set(x, d.y + 2, floorOf(room(d.to)));
      }
    else for (let y = d.y; y < d.y + d.h; y++) set(d.x, y, floorOf(room(d.to)));
  }
  DOORS.forEach(openDoor);

  // Terraza: sin muros. Arriba se ve el cielo y alrededor hay baranda de vidrio.
  let SKY_H = TERRACE.y - 1;
  for (let x = TERRACE.x; x < W; x++) {
    for (let y = 0; y < SKY_H; y++) set(x, y, SKY);
    set(x, SKY_H, RAIL);
    set(x, H - 1, RAIL);
  }
  for (let y = SKY_H; y < H; y++) set(W - 1, y, RAIL);

  // ————————————————————————————————— Muebles
  const objects = [];
  function put(sprite, x, y, w, h, opts) {
    opts = opts || {};
    const o = {
      x: x * T, y: y * T, w: w * T, h: h * T,
      canvas: sprite.canvas, top: sprite.top, ox: sprite.ox || 0,
      solid: opts.solid !== false,
      anim: opts.anim || null,
      floor: !!opts.floor,
      interact: opts.interact || null,
      tag: opts.tag || null,
    };
    o.sortY = o.y + o.h;
    objects.push(o);
    return o;
  }

  // Herramientas para amoblar una sala con coordenadas relativas a su esquina.
  function inRoom(id, fn) {
    const q = room(id);
    const p = (sprite, x, y, w, h, opts) => put(sprite, q.x + x, q.y + y, w, h, opts);
    const desk = (x, y, role, variant) =>
      p(art.desk(variant === 'dual' ? 3 : 2, variant), x, y, variant === 'dual' ? 3 : 2, 1, { anim: art.deskScreens(variant, role) });
    // Bloque "?" de información de la sala.
    const info = (x, y) => p(art.qblock(), x, y, 1, 1, { anim: art.qblockAnim, interact: { type: 'info', room: id } });
    fn(p, desk, info, q);
  }

  // Board: blanco, aluminio y madera clara
  inRoom('board', (put, desk, info) => {
    put(art.whitePlant(1), 0, 0, 1, 1);
    put(art.imacDesk(), 1, 2, 2, 1, { anim: art.imacScreen });
    put(art.imacDesk(), 7, 2, 2, 1, { anim: art.imacScreen });
    put(art.whitePlant(2), 10, 0, 1, 1);
    put(art.displayStand(), 0, 5, 2, 1, { anim: art.displayChart });
    put(art.oakTable(4, 3), 3, 5, 4, 3, { anim: art.oakTableScreens(4, 3) });
    put(art.whiteChair('down'), 4, 4, 1, 1);
    put(art.whiteChair('down'), 5, 4, 1, 1);
    put(art.whiteChair('down'), 2, 6, 1, 1);
    put(art.whiteChair('down'), 7, 6, 1, 1);
    put(art.whiteChair('up'), 4, 8, 1, 1);
    put(art.whiteChair('up'), 5, 8, 1, 1);
    put(art.sofa(3, '#c9c9ce'), 0, 10, 3, 1);
    put(art.whiteShelf(2), 8, 10, 2, 1);
    put(art.whitePlant(3), 10, 11, 1, 1);
    info(6, 10);
  });

  // Zumi: el equipo comparte la sala con mascotas
  inRoom('zumi', (put, desk, info, q) => {
    put(art.serverRack(), 0, 0, 1, 1, { anim: art.serverLeds });
    desk(2, 2, 'dev');
    desk(6, 2, 'design');
    desk(10, 2, 'marketing');
    put(art.whiteboard(2, 'chart'), 12, 0, 2, 1);
    put(art.plant(3), 14, 0, 1, 1);
    put(art.birdcage(), 0, 5, 1, 1, { anim: art.parrot });
    put(art.aquarium(), 13, 5, 2, 1, { anim: art.fish });
    put(art.terrarium(), 13, 8, 2, 1, { anim: art.turtle });
    put(art.pawRug(3, 2), 9, 6, 3, 2, { solid: false, floor: true });
    put(art.table(3, 2), 5, 6, 3, 2);
    put(art.chair('#3f8f5a', 'down'), 6, 5, 1, 1);
    put(art.chair('#3f8f5a', 'up'), 5, 8, 1, 1);
    put(art.chair('#3f8f5a', 'up'), 7, 8, 1, 1);
    put(art.table(3, 1), 1, 8, 3, 1);
    put(art.sofa(3, '#2c4a35'), 1, 10, 3, 1);
    put(art.petBed(), 10, 9, 2, 1, { anim: art.cat });
    put(art.bowls(), 12, 9, 1, 1, { solid: false, floor: true });
    put(art.plant(4), 0, 11, 1, 1);
    put(art.plant(5), 14, 11, 1, 1);
    info(8, 10);
    put(art.appStoreSign(), 10, 11, 2, 1, {
      anim: art.appStoreText,
      interact: { type: 'link', url: q.appStore, hint: 'getZumi' },
    });
  });

  // Pickpals: pantallas con deportes y ping-pong
  inRoom('pickpals', (put, desk, info) => {
    put(art.plant(6), 0, 0, 1, 1);
    desk(1, 2, 'dev');
    desk(5, 2, 'marketing');
    desk(1, 7, 'design');
    desk(10, 7, 'data', 'dual');
    put(art.fileCabinet(), 15, 3, 1, 2);
    put(art.pingPong(), 5, 5, 4, 2, { anim: art.pingPongPlay });
    put(art.ballGoal(), 1, 10, 2, 1);
    put(art.tvConsole(4), 3, 10, 4, 1, { anim: art.tvConsoleScreens(4, ['soccer', 'baseball']) });
    put(art.sofa(3, '#2f5fc4'), 10, 10, 3, 1);
    put(art.trophyShelf(), 13, 10, 2, 1);
    put(art.plant(7), 0, 11, 1, 1);
    put(art.plant(8), 15, 11, 1, 1);
    info(9, 10);
  });

  // Oficinas en arriendo: vacías, con un buzón para preguntar por ellas. Sus objetos llevan
  // la etiqueta de la sala para poder reemplazarlos (editor de oficinas).
  function furnishRent(q) {
    if (OPEN) return; // en la planta libre las oficinas se arman con el editor
    const tag = { tag: q.id };
    put(art.mailbox(), q.x + Math.floor(q.w / 2), q.y + q.h - 3, 1, 1, {
      tag: q.id,
      anim: art.mailboxAnim,
      interact: { type: 'contact', office: q.office },
    });
    put(art.whitePlant(Number(q.office)), q.x, q.y, 1, 1, tag);
    put(art.whitePlant(Number(q.office) + 3), q.x + q.w - 1, q.y, 1, 1, tag);
  }
  TGL.rooms.filter((x) => x.rent).forEach(furnishRent);

  // Terraza: mesas con sombrilla, barra, árboles y jardineras
  inRoom('terrace', (put) => {
    const patio = (x, y, color) => {
      put(art.patioChair(), x - 1, y, 1, 1);
      put(art.patioTable(color), x, y, 2, 1);
      put(art.patioChair(), x + 2, y, 1, 1);
    };
    patio(2, 3, '#e04a4a');
    patio(5, 7, '#2f6fec');
    patio(2, 11, '#3f8f5a');
    patio(5, 15, '#f2a65a');
    put(art.tree(3), 0, 0, 2, 1);
    put(art.planter(3, 1), 4, 0, 3, 1);
    put(art.plant(18), 7, 0, 1, 1);
    put(art.planter(2, 3), 0, 8, 2, 1);
    put(art.barCounter(3), 5, 20, 3, 1);
    put(art.table(2, 1), 1, 20, 2, 1);
    put(art.sofa(3, '#e9e2d4'), 1, 22, 3, 1);
    put(art.plant(16), 0, 23, 1, 1);
    put(art.plant(17), 7, 23, 1, 1);
  });

  // Dónde se paran en el descanso (relativo a la terraza) y hacia dónde miran.
  const breakSpots = [
    { x: 1, y: 4, dir: 'right' }, { x: 4, y: 4, dir: 'left' },
    { x: 4, y: 8, dir: 'right' }, { x: 7, y: 8, dir: 'left' },
    { x: 1, y: 12, dir: 'right' }, { x: 4, y: 12, dir: 'left' },
    { x: 5, y: 21, dir: 'up' }, { x: 7, y: 21, dir: 'up' },
  ].map((s) => ({ x: TERRACE.x + s.x, y: TERRACE.y + s.y, dir: s.dir }));

  // Lobby (coordenadas absolutas: es la planta baja completa)
  put(art.fridge(), 1, 34, 1, 1);
  put(art.coffeeCounter(3), 2, 34, 3, 1);
  put(art.waterCooler(), 8, 34, 1, 1);
  put(art.printer(), 11, 34, 1, 1);
  put(art.waterCooler(), 20, 34, 1, 1);
  put(art.plant(9), 27, 34, 1, 1);
  put(art.plant(10), 40, 34, 1, 1);
  put(art.waterCooler(), 47, 34, 1, 1);
  put(art.plant(11), 50, 34, 1, 1);
  put(art.kiosk(), 25, 41, 2, 1, { interact: { type: 'directory' } });
  put(art.mailbox(), 28, 41, 1, 1, { anim: art.mailboxAnim, interact: { type: 'contact' } });
  put(art.sofa(3, '#6a4c93'), 2, 41, 3, 1);
  put(art.sofa(3, '#6a4c93'), 7, 41, 3, 1);
  put(art.sofa(3, '#6a4c93'), 39, 41, 3, 1);
  put(art.sofa(3, '#6a4c93'), 44, 41, 3, 1);
  put(art.plant(12), 1, 42, 1, 1);
  put(art.plant(13), 50, 42, 1, 1);
  put(art.plant(14), 12, 42, 1, 1);
  put(art.plant(15), 36, 42, 1, 1);

  // Pasillos: plantas en los cruces y al final de los pasillos verticales.
  put(art.plant(19), 1, 14, 1, 1);
  put(art.plant(20), 50, 14, 1, 1);
  if (!OPEN) {
    put(art.waterCooler(), 13, 3, 1, 1);
    put(art.plant(21), 33, 3, 1, 1);
  }

  // El edificio crece OY filas hacia arriba: todo lo construido baja OY filas.
  if (OPEN) {
    const old = grid;
    H = H0 + OY;
    grid = new Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) grid[y * W + x] = y < OY ? (x >= TERRACE.x ? SKY : TOP) : old[(y - OY) * W + x];
    for (const q of TGL.rooms) {
      if (q.rects) q.rects = q.rects.map(([a, b, c, d]) => [a, b + OY, c, d]);
      if (q.y != null) q.y += OY;
    }
    for (const d of DOORS) d.y += OY;
    for (const o of objects) { o.y += OY * T; o.sortY += OY * T; }
    for (const sp of breakSpots) sp.y += OY;
    SKY_H += OY;
  }

  // ————————————————————————————————— Colisiones
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = isBlocked(grid[i]) ? 1 : 0;
  const markSolid = (o) => {
    if (!o.solid) return;
    for (let y = o.y / T; y < (o.y + o.h) / T; y++)
      for (let x = o.x / T; x < (o.x + o.w) / T; x++) solid[y * W + x] = 1;
  };
  objects.forEach(markSolid);

  // Recalcula colisiones dentro de una sala (cuando el editor cambia sus objetos).
  function refreshSolids(id) {
    const q = room(id);
    for (let y = q.y; y < q.y + q.h; y++)
      for (let x = q.x; x < q.x + q.w; x++) solid[y * W + x] = isBlocked(grid[y * W + x]) ? 1 : 0;
    objects.filter((o) => o.tag === id).forEach(markSolid);
  }

  // ————————————————————————————————— Estilos de superficie para oficinas personalizadas
  // Patrones del editor (editor/catalog.js): cada uno se dibuja con el color que se elija,
  // sacando sus luces y sombras de ese mismo color.
  const shade = (c, a) => TGL.color.shade(c, a);
  const FLOOR_STYLES = {
    plain(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, c);
      r(ctx, px, py, T, 1, shade(c, -0.04));
      r(ctx, px, py, 1, T, shade(c, -0.04));
    },
    speckle(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, c);
      r(ctx, px, py, T, 1, shade(c, -0.05));
      r(ctx, px, py, 1, T, shade(c, -0.05));
      for (let k = 0; k < 4; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, shade(c, 0.05));
    },
    planks(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, c);
      for (let k = 0; k < 4; k++) {
        r(ctx, px, py + k * 4 + 3, T, 1, shade(c, -0.09));
        r(ctx, px + ((x * 7 + (y * 4 + k) * 5) % 16), py + k * 4, 1, 3, shade(c, -0.06));
      }
    },
    checker(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, (x + y) % 2 ? c : shade(c, -0.06));
    },
    tiles(ctx, px, py, x, y, rnd, q, c) {
      // baldosas grandes de 2×2 casillas
      r(ctx, px, py, T, T, c);
      if (x % 2 === 0) r(ctx, px, py, 1, T, shade(c, -0.1));
      if (y % 2 === 0) r(ctx, px, py, T, 1, shade(c, -0.1));
      r(ctx, px + (x % 2 ? 0 : 1), py + (y % 2 ? 0 : 1), T - 1, 1, shade(c, 0.04));
    },
    herringbone(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, c);
      const line = shade(c, -0.1), hi = shade(c, 0.05);
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = px + i * 4, cy = py + j * 4;
          if ((i + j + x + y) % 2) { r(ctx, cx, cy + 3, 4, 1, line); r(ctx, cx, cy, 4, 1, hi); }
          else { r(ctx, cx + 3, cy, 1, 4, line); r(ctx, cx, cy, 1, 4, hi); }
        }
    },
    neon(ctx, px, py, x, y, rnd, q, c) {
      r(ctx, px, py, T, T, c);
      ctx.globalAlpha = 0.35;
      r(ctx, px, py, T, 1, q.custom.identity.accent);
      r(ctx, px, py, 1, T, q.custom.identity.accent);
      ctx.globalAlpha = 1;
    },
  };
  // Muros: "low" = la fila de abajo de la cara del muro (la que toca el piso).
  const WALL_STYLES = {
    plain(ctx, px, py, x, low, c) {
      r(ctx, px, py, T, T, c);
    },
    stripes(ctx, px, py, x, low, c) {
      r(ctx, px, py, T, T, c);
      for (let k = 0; k < T; k += 4) r(ctx, px + k, py, 2, T, shade(c, -0.05));
    },
    wainscot(ctx, px, py, x, low, c) {
      r(ctx, px, py, T, T, c);
      if (!low) return;
      r(ctx, px, py + 3, T, T - 3, '#9a6d44');
      r(ctx, px, py + 3, T, 1, '#b8885a');
      r(ctx, px, py + 4, T, 1, '#7a5230');
      if (x % 2 === 0) r(ctx, px, py + 6, 1, T - 8, '#7a5230');
    },
    brick(ctx, px, py, x, low, c) {
      r(ctx, px, py, T, T, c);
      const mortar = shade(c, 0.14), dark = shade(c, -0.06);
      for (let row = 0; row < 4; row++) {
        const yy = py + row * 4;
        r(ctx, px, yy + 3, T, 1, mortar);
        const off = ((row + (low ? 0 : 2)) % 2) * 4;
        for (let k = off; k < T; k += 8) r(ctx, px + k, yy, 1, 3, mortar);
        r(ctx, px + ((x * 5 + row * 3) % 12) + 1, yy + 1, 2, 1, dark);
      }
    },
  };
  const surfaces = (q) => q.custom.surfaces;

  // ————————————————————————————————— Capa estática
  const WALL_TOP = '#2f2925', WALL_EDGE = '#51473f';
  const FACE_COLOR = { open: '#ece9e2', cowork: '#fdf0d5', board: '#f7f7f9', zumi: '#e2eedc', pickpals: '#dde6f3', lobby: '#ece6da', hall: '#e6e1d7', rent: '#f7f7f9' };

  function roomAt(tx, ty) {
    for (const q of TGL.rooms)
      for (const [rx, ry, rw, rh] of rectsOf(q))
        if (tx >= rx && tx < rx + rw && ty >= ry && ty < ry + rh) return q;
    return null;
  }
  // La sala a la que pertenece una cara de muro: la que está justo debajo.
  function faceRoom(tx, ty) {
    for (let y = ty + 1; y < H; y++) {
      if (!isWall(at(tx, y))) return roomAt(tx, y) || roomAt(tx, y + 1) || { id: 'lobby' };
    }
    return { id: 'lobby' };
  }

  function drawFloor(ctx, x, y, v, rnd) {
    const px = x * T, py = y * T;
    if (v === FLOOR.board) {
      // concreto pulido claro
      r(ctx, px, py, T, T, '#e6e6ea');
      r(ctx, px, py, T, 1, '#d9d9df');
      r(ctx, px, py, 1, T, '#d9d9df');
      for (let k = 0; k < 3; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, '#eeeef2');
    } else if (v === FLOOR.zumi) {
      r(ctx, px, py, T, T, (x + y) % 2 ? '#78a37a' : '#729d74');
      for (let k = 0; k < 3; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, '#86b087');
    } else if (v === FLOOR.terrace) {
      // deck de madera
      r(ctx, px, py, T, T, '#b98552');
      for (let k = 0; k < 4; k++) {
        r(ctx, px, py + k * 4 + 3, T, 1, '#9c6d40');
        r(ctx, px + ((x * 5 + y * 3 + k * 7) % 16), py + k * 4, 1, 3, '#a8784a');
      }
    } else if (v === FLOOR.hall) {
      // baldosa de pasillo
      r(ctx, px, py, T, T, '#a8a295');
      r(ctx, px, py, T, 1, '#9a9488');
      r(ctx, px, py, 1, T, '#9a9488');
      r(ctx, px + 1, py + 1, T - 2, 1, '#b3ada1');
    } else if (v === FLOOR.rent) {
      // oficina vacía: blanca, como recién pintada; si alguien la personalizó, su piso
      const q = roomAt(x, y);
      if (q && q.custom) (FLOOR_STYLES[surfaces(q).floor] || FLOOR_STYLES.plain)(ctx, px, py, x, y, rnd, q, surfaces(q).floorColor);
      else FLOOR_STYLES.plain(ctx, px, py, x, y, rnd, q, '#f1f1f3');
    } else if (v === FLOOR.open) {
      // planta libre: concreto sin terminar, con la marca de cada módulo de 4 m
      r(ctx, px, py, T, T, '#cdc9c0');
      for (let k = 0; k < 3; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, '#c2beb4');
      if (x % 4 === 1) for (let k = 0; k < T; k += 4) r(ctx, px, py + k, 1, 2, '#b3aea3');
    } else if (v === FLOOR.cowork) {
      FLOOR_STYLES.planks(ctx, px, py, x, y, rnd, null, '#d9b07a');
    } else if (v === FLOOR.pickpals) {
      r(ctx, px, py, T, T, '#5b719a');
      r(ctx, px, py, T, 1, '#536890');
      r(ctx, px, py, 1, T, '#536890');
      for (let k = 0; k < 3; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, '#6a82ad');
    } else {
      r(ctx, px, py, T, T, '#8c877e');
      for (let k = 0; k < 7; k++)
        r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, rnd() > 0.5 ? '#98938a' : '#7f7a71');
    }
  }

  const RENT_TEXT = { es: 'SE ARRIENDA', en: 'FOR RENT' };
  const STRIP_DECOR = [
    // Oficinas en arriendo
    { k: 'glass', x: 1, y: 1, w: 3 }, { k: 'plate', room: 'rent1', x: 4, y: 1, w: 5, text: RENT_TEXT, bg: '#1d1f24', fg: '#ffc367' },
    { k: 'glass', x: 9, y: 1, w: 3 },
    { k: 'glass', x: 16, y: 1, w: 4 }, { k: 'plate', room: 'rent2', x: 21, y: 1, w: 5, text: RENT_TEXT, bg: '#1d1f24', fg: '#ffc367' },
    { k: 'glass', x: 27, y: 1, w: 4 },
    { k: 'glass', x: 35, y: 1, w: 4 }, { k: 'plate', room: 'rent3', x: 40, y: 1, w: 6, text: RENT_TEXT, bg: '#1d1f24', fg: '#ffc367' },
    { k: 'glass', x: 47, y: 1, w: 4 },
    // Pasillo: número de cada oficina junto a su puerta
    { k: 'sign', x: 7, y: 12, w: 3, text: '101', fg: '#ffc367' },
    { k: 'sign', x: 24, y: 12, w: 3, text: '102', fg: '#ffc367' },
    { k: 'painting', x: 27, y: 12, w: 2 },
    { k: 'painting', x: 36, y: 12, w: 2 },
    { k: 'sign', x: 44, y: 12, w: 3, text: '103', fg: '#ffc367' },
    { k: 'clock', x: 48, y: 12, w: 1 },
  ].map((d) => Object.assign(d, { strip: true }));
  const decor = [
    ...(OPEN ? [] : STRIP_DECOR),
    // Board
    { k: 'glass', x: 1, y: 17, w: 3 }, { k: 'wallDisplay', x: 4, y: 17, w: 4 }, { k: 'glass', x: 8, y: 17, w: 3 },
    // Zumi
    { k: 'window', x: 17, y: 17, w: 2 },
    { k: 'plate', x: 21, y: 17, w: 3, text: 'zumi', bg: '#2c4a35', fg: '#ffc367', url: 'https://zumiapp.co', link: '#2c6b3f' },
    { k: 'pawPoster', x: 25, y: 17, w: 1 }, { k: 'petPhoto', x: 26, y: 17, w: 2 },
    // Pickpals
    { k: 'tv', x: 36, y: 17, w: 2, sport: 'tennis' },
    { k: 'plate', x: 39, y: 17, w: 3, text: 'pickpals', bg: '#1b2a4a', fg: '#9cff57', url: 'https://pickpals.co', link: '#2f5fc4' },
    { k: 'tv', x: 43, y: 17, w: 2, sport: 'basket' },
    { k: 'scoreboard', x: 45, y: 17, w: 5 },
    // Lobby
    { k: 'sign', x: 7, y: 32, w: 3, text: 'BOARD', fg: '#ffc367' },
    { k: 'painting', x: 16, y: 32, w: 2 },
    { k: 'sign', x: 24, y: 32, w: 3, text: 'ZUMI', fg: '#86d19a', url: 'https://zumiapp.co', link: '#2c6b3f' },
    { k: 'clock', x: 30, y: 32, w: 1 },
    { k: 'painting', x: 36, y: 32, w: 2 },
    { k: 'sign', x: 44, y: 32, w: 3, text: 'PICKPALS', fg: '#9cc0ff', url: 'https://pickpals.co', link: '#2f5fc4' },
    { k: 'elevator', x: 48, y: 32, w: 2 },
  ];
  if (OPEN) for (const d of decor) d.y += OY;

  // Zonas clicables del mundo (los links bajo los letreros). Se llenan al pintar.
  const links = [];
  const LINK_FONT = '700 6px Inter, system-ui, sans-serif';

  function drawDecor(ctx, d) {
    const px = d.x * T, py = d.y * T, pw = d.w * T;
    if (d.k === 'window') {
      r(ctx, px + 2, py + 3, pw - 4, 20, '#8a6a4a');
      r(ctx, px + 4, py + 5, pw - 8, 16, '#bfe3f7');
      r(ctx, px + pw / 2 - 1, py + 5, 2, 16, '#8a6a4a');
      r(ctx, px + 6, py + 7, 1, 5, '#e8f6ff');
      r(ctx, px + pw / 2 + 3, py + 7, 1, 5, '#e8f6ff');
      r(ctx, px + 1, py + 23, pw - 2, 2, '#a8835c');
    } else if (d.k === 'plate' || d.k === 'sign') {
      // Una oficina personalizada muestra su nombre y sus colores en lugar de "se arrienda".
      const own = d.room && room(d.room).custom;
      if (own) d = Object.assign({}, d, { text: own.identity.name || TGL.t(room(d.room).name) || '—', bg: own.identity.primary, fg: own.identity.accent });
      const ph = d.k === 'sign' ? 11 : 13, top = d.k === 'sign' ? py + 5 : py + 4;
      r(ctx, px + 2, top + 1, pw - 4, ph, 'rgba(0,0,0,.18)');
      r(ctx, px + 1, top, pw - 2, ph, d.bg || '#23262d');
      ctx.fillStyle = d.fg;
      ctx.font = '8px Silkscreen, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(TGL.t(d.text), px + pw / 2, top + ph / 2 + 1);
      if (d.url) {
        // El link se pinta cada frame (drawWallAnims) para que el texto quede nítido con cualquier zoom.
        const label = d.url.replace(/^https?:\/\//, ''), ly = top + ph + 5;
        ctx.font = LINK_FONT;
        const lw = ctx.measureText(label).width;
        links.push({ x: px + pw / 2 - lw / 2 - 2, y: ly - 5, w: lw + 4, h: 10, cx: px + pw / 2, ty: ly, lw, label, url: d.url, color: d.link });
      }
    } else if (d.k === 'glass') {
      r(ctx, px + 1, py + 2, pw - 2, 27, '#c7c7cc');
      r(ctx, px + 2, py + 3, pw - 4, 25, '#cfe7f7');
      r(ctx, px + 2, py + 3, pw - 4, 8, '#e3f2fc');
      for (let i = 1; i < d.w; i++) r(ctx, px + i * T - 1, py + 3, 1, 25, '#c7c7cc');
      for (let i = 0; i < d.w; i++) {
        r(ctx, px + i * T + 5, py + 6, 1, 6, 'rgba(255,255,255,.8)');
        r(ctx, px + i * T + 7, py + 5, 1, 4, 'rgba(255,255,255,.8)');
      }
    } else if (d.k === 'wallDisplay') {
      r(ctx, px + 1, py + 2, pw - 2, 25, '#2a2b30');
      r(ctx, px + 2, py + 3, pw - 4, 23, '#050507');
    } else if (d.k === 'tv') {
      r(ctx, px + 1, py + 3, pw - 2, 21, '#111318');
      r(ctx, px + pw / 2 - 1, py + 24, 2, 2, '#23262d');
    } else if (d.k === 'pawPoster') {
      r(ctx, px + 2, py + 3, pw - 4, 20, '#2c4a35');
      r(ctx, px + 3, py + 4, pw - 6, 18, '#ffc367');
      art.paw(ctx, px + 4, py + 9, '#2c4a35');
    } else if (d.k === 'petPhoto') {
      r(ctx, px + 3, py + 4, pw - 6, 18, '#7a5230');
      r(ctx, px + 4, py + 5, pw - 8, 16, '#d0e1fa');
      art.drawDog(ctx, px + pw / 2 - 2, py + 20, 'right', 0, 0, true);
    } else if (d.k === 'painting') {
      r(ctx, px + 3, py + 4, pw - 6, 16, '#7a5230');
      r(ctx, px + 5, py + 6, pw - 10, 12, '#9fd3f0');
      r(ctx, px + 5, py + 13, pw - 10, 5, '#5fae74');
      r(ctx, px + 10, py + 9, 7, 5, '#6c7a86');
      r(ctx, px + 12, py + 8, 3, 1, '#ffffff');
      r(ctx, px + pw - 10, py + 8, 2, 2, '#ffd24d');
    } else if (d.k === 'clock') {
      r(ctx, px + 3, py + 5, 10, 10, '#23262d');
      r(ctx, px + 4, py + 6, 8, 8, '#f6f3ec');
      r(ctx, px + 7, py + 7, 1, 4, '#23262d');
      r(ctx, px + 7, py + 10, 3, 1, '#c0392b');
    } else if (d.k === 'elevator') {
      r(ctx, px + 1, py + 2, pw - 2, 30, '#8a8f98');
      r(ctx, px + 3, py + 6, pw / 2 - 3, 26, '#c3c9d2');
      r(ctx, px + pw / 2, py + 6, pw / 2 - 3, 26, '#b3bac4');
      r(ctx, px + pw / 2 - 1, py + 6, 1, 26, '#6b717c');
      r(ctx, px + pw / 2 - 5, py + 3, 10, 2, '#23262d');
      r(ctx, px + pw / 2 - 1, py + 3, 2, 2, '#9cff57');
    } else if (d.k === 'scoreboard') {
      r(ctx, px, py + 1, pw, 26, '#16181d');
      r(ctx, px + 2, py + 3, pw - 4, 22, '#0b1a10');
      r(ctx, px + pw / 2 - 6, py + 27, 12, 3, '#16181d');
    }
  }

  function drawRug(ctx) {
    const x = 18 * T, y = (36 + OY) * T, w = 19 * T, h = 4 * T;
    r(ctx, x + 2, y + 2, w, h, 'rgba(0,0,0,.2)');
    r(ctx, x, y, w, h, '#ffc367');
    r(ctx, x + 2, y + 2, w - 4, h - 4, '#1d1f24');
    r(ctx, x + 5, y + 5, w - 10, 1, '#3a3d45');
    r(ctx, x + 5, y + h - 6, w - 10, 1, '#3a3d45');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 25px Inter, system-ui, sans-serif';
    ctx.fillText('2GoodLabs', x + w / 2, y + 36);
    ctx.fillStyle = '#ffc367';
    ctx.font = '8px Silkscreen, monospace';
    ctx.fillText(TGL.t(TGL.company.tagline).toUpperCase(), x + w / 2, y + 52);
  }

  function drawRail(ctx, x, y) {
    const px = x * T, py = y * T;
    if (x === W - 1 && y > SKY_H) {
      r(ctx, px + 4, py, 8, T, 'rgba(190,225,245,.55)');
      r(ctx, px + 4, py, 2, T, '#9aa3ae');
      r(ctx, px + 11, py, 1, T, '#c7ced7');
    } else {
      r(ctx, px, py + 3, T, 10, 'rgba(190,225,245,.55)');
      r(ctx, px, py + 2, T, 2, '#9aa3ae');
      r(ctx, px, py + 13, T, 1, '#7c848f');
      if (x % 3 === 0) r(ctx, px, py + 4, 1, 9, '#9aa3ae');
    }
  }

  // Lo que se ve desde la terraza: cielo, nubes y la ciudad.
  function drawSky(ctx) {
    const x0 = TERRACE.x * T, w = (W - TERRACE.x) * T, h = SKY_H * T;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5aa8e6');
    g.addColorStop(0.7, '#a9d8f3');
    g.addColorStop(1, '#d9eef9');
    ctx.fillStyle = g;
    ctx.fillRect(x0, 0, w, h);
    const rnd = TGL.rng(77);
    for (let i = 0; i < 7; i++) {
      const cx = x0 + Math.floor(rnd() * (w - 30)), cy = 10 + Math.floor(rnd() * (h * 0.45));
      r(ctx, cx, cy, 22, 4, '#ffffff');
      r(ctx, cx + 5, cy - 3, 12, 4, '#ffffff');
      r(ctx, cx + 2, cy + 4, 18, 1, 'rgba(160,190,215,.6)');
    }
    // Dos planos de edificios: los lejanos más claros y altos.
    for (const [seed, minH, maxH, cols, win] of [[78, 60, 150, ['#9fb3cc', '#a9bcd3'], '#e3ecf5'], [79, 24, 90, ['#7b8ea8', '#8c9fb8'], '#dfe8f2']]) {
      const rb = TGL.rng(seed);
      let bx = x0 - 4;
      while (bx < x0 + w) {
        const bw = 10 + Math.floor(rb() * 16), bh = minH + Math.floor(rb() * (maxH - minH));
        r(ctx, bx, h - bh, bw, bh, cols[Math.floor(rb() * 2)]);
        for (let wy = h - bh + 4; wy < h - 3; wy += 5)
          for (let wx = bx + 2; wx < bx + bw - 2; wx += 3) if (rb() > 0.45) r(ctx, wx, wy, 1, 2, win);
        bx += bw + 1;
      }
    }
  }

  // Letrero en el piso de cada oficina disponible: "se arrienda" y los m².
  function drawRentFloors(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const q of TGL.rooms.filter((x) => x.rent && !x.custom && !x.lease)) {
      const cx = (q.x + q.w / 2) * T, cy = (q.y + 3) * T;
      ctx.fillStyle = '#d4d4da';
      ctx.font = '16px Silkscreen, monospace';
      ctx.fillText(TGL.t(RENT_TEXT), cx, cy);
      ctx.font = '8px Silkscreen, monospace';
      ctx.fillStyle = '#b3b3bb';
      ctx.fillText(q.w * q.h + ' m²  ·  ' + q.office, cx, cy + 16);
    }
    // Planta libre: cada tramo dice cuántos m² quedan.
    const open = room('open');
    if (open)
      for (const [rx, ry, rw, rh] of open.rects) {
        if (rw < 8) continue;
        const cx = (rx + rw / 2) * T, cy = (ry + 3) * T;
        ctx.fillStyle = '#bdb8ad';
        ctx.font = (rw >= 14 ? 16 : 8) + 'px Silkscreen, monospace';
        ctx.fillText(TGL.t(RENT_TEXT), cx, cy);
        ctx.font = '8px Silkscreen, monospace';
        ctx.fillStyle = '#a39e93';
        ctx.fillText(rw * rh + ' m²', cx, cy + 14);
      }
  }

  function renderStatic() {
    links.length = 0;
    const c = TGL.canvas(W * T, H * T), ctx = c.getContext('2d');
    const rnd = TGL.rng(2025);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const v = at(x, y), px = x * T, py = y * T;
        if (v === TOP) {
          r(ctx, px, py, T, T, WALL_TOP);
          if (!isWall(at(x - 1, y))) r(ctx, px, py, 2, T, WALL_EDGE);
          if (!isWall(at(x + 1, y))) r(ctx, px + T - 2, py, 2, T, WALL_EDGE);
          if (!isWall(at(x, y - 1))) r(ctx, px, py, T, 2, WALL_EDGE);
          if (at(x, y + 1) === FACE) r(ctx, px, py + T - 2, T, 2, WALL_EDGE);
        } else if (v === FACE) {
          const q = faceRoom(x, y);
          if (q.rent && q.custom) (WALL_STYLES[surfaces(q).walls] || WALL_STYLES.plain)(ctx, px, py, x, !isWall(at(x, y + 1)), surfaces(q).wallColor);
          else r(ctx, px, py, T, T, FACE_COLOR[q.rent ? 'rent' : q.id] || FACE_COLOR.lobby);
          if (at(x, y - 1) === TOP) r(ctx, px, py, T, 3, 'rgba(0,0,0,.12)');
          if (!isWall(at(x, y + 1))) {
            r(ctx, px, py + T - 3, T, 3, '#7a5230');
            r(ctx, px, py + T - 3, T, 1, '#9a6d44');
          }
        } else if (v === RAIL) {
          drawFloor(ctx, x, y, FLOOR.terrace, rnd);
          drawRail(ctx, x, y);
        } else if (v !== SKY) {
          drawFloor(ctx, x, y, v, rnd);
        }
      }
    // Sombras que dejan los muros sobre el piso.
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (isWall(at(x, y))) continue;
        if (isWall(at(x, y - 1))) r(ctx, x * T, y * T, T, 4, 'rgba(0,0,0,.16)');
        if (isWall(at(x - 1, y))) r(ctx, x * T, y * T, 3, T, 'rgba(0,0,0,.12)');
      }
    // Marcos de puerta.
    for (const d of DOORS) {
      const col = d.glass ? '#9aa3ae' : '#5c3d22';
      if (d.k === 'h') {
        for (let y = d.y; y <= d.y + 2; y++) {
          r(ctx, d.x * T - 2, y * T, 2, T, col);
          r(ctx, (d.x + d.w) * T, y * T, 2, T, col);
        }
        r(ctx, d.x * T + 2, (d.y + 3) * T + 1, d.w * T - 4, 6, '#6b4f35');
      } else {
        r(ctx, d.x * T, d.y * T - 2, T, 2, col);
        r(ctx, d.x * T, (d.y + d.h) * T, T, 2, col);
      }
    }
    for (const d of decor) drawDecor(ctx, d);
    drawSky(ctx);
    drawRentFloors(ctx);
    drawRug(ctx);
    return c;
  }

  // Todo lo animado de los muros: marcador, televisores y la pantalla del Board.
  function drawWallAnims(ctx, t) {
    drawScoreboard(ctx, t);
    ctx.font = LINK_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const l of links) {
      ctx.fillStyle = l.color;
      ctx.fillText(l.label, l.cx, l.ty);
      ctx.fillRect(l.cx - l.lw / 2, l.ty + 3.5, l.lw, 0.5);
    }
    for (const d of decor) {
      if (d.k === 'tv') art.sportScreen(ctx, d.x * T + 2, d.y * T + 4, d.w * T - 4, 19, d.sport, t + d.x);
      else if (d.k === 'wallDisplay') drawBoardDisplay(ctx, d, t);
    }
  }

  // Pantalla del Board: el logo y unas métricas que se mueven.
  function drawBoardDisplay(ctx, d, t) {
    const x = d.x * T + 3, y = d.y * T + 4, w = d.w * T - 6;
    ctx.font = '8px Silkscreen, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5f5f7';
    ctx.fillText('2GoodLabs', x + 2, y);
    const cols = ['#ffc367', '#4dd6ff', '#34c759', '#ff6fa8'];
    for (let i = 0; i < 4; i++) {
      const v = 4 + Math.round((Math.sin(t * 0.8 + i * 1.3) + 1) * 4);
      r(ctx, x + 3 + i * 5, y + 20 - v, 3, v, cols[i]);
    }
    for (let i = 0; i < 30; i++) {
      const v = Math.sin((i + t * 4) * 0.3) * 3 + i * 0.2;
      r(ctx, x + 26 + i, Math.round(y + 16 - v), 1, 1, '#34c759');
    }
    r(ctx, x + 26, y + 20, 30, 1, '#2a2d35');
  }

  // Marcador animado sobre el muro de Pickpals.
  function drawScoreboard(ctx, t) {
    const d = decor.find((q) => q.k === 'scoreboard');
    const px = d.x * T + 3, py = d.y * T + 4, pw = d.w * T - 6;
    const text = TGL.scoreboard.join('   ·   ');
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, 20);
    ctx.clip();
    r(ctx, px, py, pw, 20, '#0b1a10');
    ctx.font = '8px Silkscreen, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = Math.floor(t * 2) % 2 ? '#e04a4a' : '#7a2020';
    ctx.fillRect(px + 2, py + 3, 3, 3);
    ctx.fillStyle = '#e04a4a';
    ctx.fillText('LIVE', px + 7, py + 1);
    // Ticker: el texto corre de derecha a izquierda.
    const tw = ctx.measureText(text).width;
    const x = px + pw - ((t * 18) % (tw + pw));
    ctx.fillStyle = '#9cff57';
    ctx.fillText(text, Math.round(x), py + 10);
    ctx.restore();
  }

  // Por encima de todo: la guirnalda de luces de la terraza.
  function drawOverlay(ctx, t) {
    art.stringLights(ctx, TERRACE.x * T, (W - 1) * T, (TERRACE.y + 6) * T + 4, t, 2);
    art.stringLights(ctx, TERRACE.x * T, (W - 1) * T, (TERRACE.y + 14) * T + 4, t + 1, 2);
    // Modo noche de una oficina personalizada: penumbra y neón con su color de acento.
    for (const q of TGL.rooms) {
      if (!q.custom || q.custom.mode !== 'night') continue;
      const x = q.x * T, y = (q.y - 2) * T, w = q.w * T, h = (q.h + 2) * T;
      r(ctx, x, y, w, h, 'rgba(10,8,30,.42)');
      ctx.globalAlpha = 0.55 + Math.sin(t * 2) * 0.2;
      r(ctx, x, y + 2 * T, w, 2, q.custom.identity.accent);
      r(ctx, x, y + h - 2, w, 2, q.custom.identity.accent);
      ctx.globalAlpha = 1;
    }
  }

  // ————————————————————————————————— Zona de arriendo: normas del piso
  // Los pasillos son del edificio: no se venden ni se cierran. Toda oficina tiene la puerta
  // sobre el pasillo de abajo de su fila. Entre una oficina y cualquier otra cosa que no sea
  // un muro del edificio (otra oficina o planta libre) queda un pasillo de 2 m que cruza la
  // fila; en la fila B ese pasillo sube hasta el pasillo del medio, así siempre se llega a la
  // fila A. Junto a una oficina quedan 0 m o al menos 8 m libres: no hay retazos.
  const RULES = { hall: 2, minFree: 8, minWidth: 8, maxWidth: 24 };
  // Filas (y, alto) con sus tramos entre muros del edificio ('wall') y pasillos ('hall').
  const ROWS = [
    { id: 'A', y: 3, h: 8, hallY: 14, up: false, bays: [{ L: 1, R: 50, l: 'wall', r: 'wall' }] },
    { id: 'B', y: 19, h: 8, hallY: 30, up: true, bays: [{ L: 1, R: 12, l: 'wall', r: 'hall' }, { L: 15, R: 31, l: 'hall', r: 'hall' }, { L: 34, R: 50, l: 'hall', r: 'wall' }] },
  ];
  const ZONE_X0 = 1, ZONE_X1 = 50, ZONE_Y1 = 30; // filas 0..29; el pasillo principal está en 30
  const COWORK = { id: 'cowork', row: 'B', a: 1, w: 11, fixed: true };
  // Puestos del coworking (relativos a la sala): escritorio de 2 × 1 y, delante, dos personas.
  const DESKS = [0, 3, 6, 9].flatMap((x) => [{ x, y: 1 }]).concat([0, 3, 6, 9].map((x) => ({ x, y: 4 })));

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
  // Plano de todo el piso para estas oficinas: por fila, el tipo de cada columna
  // ('free' | 'hall' | 'wall' | id de la oficina). null si algo rompe las normas.
  function floorPlan(leases) {
    const plan = {};
    for (const o of leases) {
      const row = ROWS.find((q) => q.id === o.row);
      if (!row || !row.bays.some((b) => o.a >= b.L && o.a + o.w - 1 <= b.R)) return null;
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
    const others = [COWORK].concat(leases.filter((o) => o.id !== skipId && o.id !== COWORK.id)), out = [];
    if (w < RULES.minWidth || w > RULES.maxWidth) return out;
    for (const bay of ROWS.find((q) => q.id === rowId).bays)
      for (let a = bay.L; a + w - 1 <= bay.R; a++) if (floorPlan(others.concat({ id: '?', row: rowId, a, w }))) out.push(a);
    return out;
  }

  // Construye la zona de arriendo con estas oficinas (además del coworking). Crea o quita las
  // salas de cada oficina; su contenido lo pone el editor (editor/space.js).
  let leases = [];
  function buildZone(list) {
    if (!OPEN) return false;
    const all = [COWORK].concat(list.filter((o) => o.id !== COWORK.id));
    const plan = floorPlan(all);
    if (!plan) return false;
    leases = all;

    // Salas de oficinas: crear las nuevas, ubicar todas, quitar las que ya no están.
    for (let i = TGL.rooms.length - 1; i >= 0; i--) if (TGL.rooms[i].lease && !all.some((o) => o.id === TGL.rooms[i].id)) TGL.rooms.splice(i, 1);
    for (const o of all) {
      const row = ROWS.find((q) => q.id === o.row);
      let q = room(o.id);
      if (!q) {
        q = { id: o.id, rent: true, lease: true, office: o.number, color: '#c9c9ce', name: { es: 'Oficina ' + o.number, en: 'Office ' + o.number }, blurb: { es: '', en: '' } };
        TGL.rooms.push(q);
      }
      Object.assign(q, { x: o.a, y: row.y, w: o.w, h: row.h });
      if (q.lease) { q.office = o.number; if (!q.custom) q.name = { es: 'Oficina ' + o.number, en: 'Office ' + o.number }; }
    }

    // 1. Todo muro. 2. Pasillo del medio y pasillos verticales del edificio. 3. Filas.
    for (let y = 0; y < ZONE_Y1; y++) for (let x = ZONE_X0; x <= ZONE_X1; x++) set(x, y, TOP);
    for (let x = ZONE_X0; x <= ZONE_X1; x++) for (let y = 14; y < 16; y++) set(x, y, FLOOR.hall);
    for (const hx of [13, 32]) for (let x = hx; x < hx + 2; x++) for (let y = 16; y < ZONE_Y1; y++) set(x, y, FLOOR.hall);
    const hallRects = [[1, 30, 50, 2], [1, 14, 50, 2], [13, 16, 2, 34], [32, 16, 2, 34]], freeRects = [];
    for (const row of ROWS) {
      const cols = plan[row.id], runs = [];
      for (let x = ZONE_X0; x <= ZONE_X1; x++) {
        const t = cols[x];
        if (t == null || t === 'wall') continue;
        const last = runs[runs.length - 1];
        if (last && last.t === t && last.e === x - 1) last.e = x; else runs.push({ t, s: x, e: x });
        const fl = t === 'free' ? FLOOR.open : t === 'hall' ? FLOOR.hall : floorOf(room(t));
        for (let y = row.y; y < row.y + row.h; y++) set(x, y, fl);
        if (t === 'hall') {
          for (let y = row.y + row.h; y < row.hallY; y++) set(x, y, FLOOR.hall);
          if (row.up) for (let y = row.y - 3; y < row.y; y++) set(x, y, FLOOR.hall);
        }
      }
      for (const run of runs) {
        if (run.t === 'free') freeRects.push([run.s, row.y, run.e - run.s + 1, row.h]);
        if (run.t === 'hall') hallRects.push([run.s, row.up ? row.y - 3 : row.y, run.e - run.s + 1, row.hallY - row.y + (row.up ? 3 : 0)]);
      }
      row.runs = runs;
    }
    room('hall').rects = hallRects.concat(room('hall').rects.filter((rc) => rc[1] > ZONE_Y1 + 1 && !(rc[0] === 13 || rc[0] === 32)));
    room('open').rects = freeRects;

    // 4. Caras de muro: las dos filas sobre cualquier piso.
    for (let x = ZONE_X0; x <= ZONE_X1; x++)
      for (let y = 1; y <= ZONE_Y1; y++)
        if (isFloor(at(x, y)) && at(x, y - 1) === TOP) {
          set(x, y - 1, FACE);
          if (at(x, y - 2) === TOP) set(x, y - 2, FACE);
        }

    // 5. Puertas: cada oficina, centrada; la planta libre, una cada ~16 m.
    DOORS = DOORS.filter((d) => !d.zone);
    const doors = [];
    for (const o of all) {
      const row = ROWS.find((q) => q.id === o.row);
      doors.push({ k: 'h', x: o.a + Math.floor(o.w / 2) - 1, y: row.y + row.h, w: 2, from: o.id, to: 'hall', zone: true });
    }
    for (const row of ROWS)
      for (const run of row.runs.filter((rn) => rn.t === 'free')) {
        const len = run.e - run.s + 1;
        if (len < 4) continue;
        const n = Math.max(1, Math.floor(len / 16));
        for (let k = 0; k < n; k++) doors.push({ k: 'h', x: run.s + Math.round(((k + 0.5) * len) / n) - 1, y: row.y + row.h, w: 2, from: 'open', to: 'hall', zone: true });
      }
    doors.forEach(openDoor);
    DOORS.push(...doors);

    // 6. Ventanas, letreros y cuadros, sin tapar puertas ni pasillos.
    for (let i = decor.length - 1; i >= 0; i--) if (decor[i].zone) decor.splice(i, 1);
    const add = (d) => decor.push(Object.assign(d, { zone: true }));
    for (const row of ROWS) {
      const outside = !row.up; // la fila A da a la calle: ventanas
      for (const run of row.runs) {
        const len = run.e - run.s + 1;
        if (run.t === 'hall') continue;
        if (run.t === 'free') {
          const plateX = run.s + Math.floor(len / 2) - 3, plate = len >= 10;
          if (plate) add({ k: 'plate', x: plateX, y: row.y - 2, w: 6, text: RENT_TEXT, bg: '#1d1f24', fg: '#ffc367' });
          if (outside) for (let gx = run.s; gx + 3 <= run.e; gx += 6) if (!plate || gx + 4 <= plateX || gx >= plateX + 6) add({ k: 'glass', x: gx, y: row.y - 2, w: 4 });
          continue;
        }
        const q = room(run.t), side = Math.floor((len - 6) / 2);
        add(q.cowork
          ? { k: 'plate', x: run.s + side, y: row.y - 2, w: 6, text: { es: 'COWORKING', en: 'COWORKING' }, bg: '#1d1f24', fg: '#f2a65a' }
          : { k: 'plate', room: q.id, x: run.s + side, y: row.y - 2, w: 6, text: RENT_TEXT, bg: '#1d1f24', fg: '#ffc367' });
        if (outside && side >= 2) {
          add({ k: 'glass', x: run.s, y: row.y - 2, w: Math.min(4, side) });
          add({ k: 'glass', x: run.e + 1 - Math.min(4, side), y: row.y - 2, w: Math.min(4, side) });
        }
      }
    }
    const gaps = doors.map((d) => [d.x, d.x + 1]).concat(hallRects.filter((rc) => rc[2] <= 2).map((rc) => [rc[0], rc[0] + rc[2] - 1]));
    const clear = (x, dw) => x >= ZONE_X0 && x + dw - 1 <= ZONE_X1 && !gaps.some(([g0, g1]) => x <= g1 + 1 && x + dw - 1 >= g0 - 1);
    for (const o of all) {
      const row = ROWS.find((q) => q.id === o.row), door = doors.find((d) => d.from === o.id);
      const sx = [door.x + 3, door.x - 4].find((x) => clear(x, 3));
      if (sx != null && o.number) add({ k: 'sign', x: sx, y: row.hallY - 2, w: 3, text: String(o.number), fg: '#ffc367' });
      if (sx != null) gaps.push([sx, sx + 2]);
    }
    for (const [px, py] of [[8, 28], [26, 28], [42, 28], [6, 12], [24, 12], [44, 12]]) if (clear(px, 2)) add({ k: 'painting', x: px, y: py, w: 2 });

    for (let i = 0; i < W * H; i++) solid[i] = isBlocked(grid[i]) ? 1 : 0;
    objects.forEach(markSolid);
    return true;
  }

  // Coworking: escritorios libres (el editor los cambia por los de quien arrienda el puesto).
  function freeDesk(n) {
    const q = room('cowork'), d = DESKS[n];
    const t = art.table(2, 1), c = TGL.canvas(t.canvas.width, t.canvas.height), x = c.getContext('2d');
    x.drawImage(t.canvas, 0, 0);
    r(x, 11, 5, 10, 5, '#3f8f5a'); // tarjeta "libre"
    r(x, 13, 7, 6, 1, '#d6f5df');
    put({ canvas: c, top: 0 }, q.x + d.x, q.y + d.y, 2, 1, { tag: 'desk-' + n });
  }
  if (OPEN) {
    buildZone([]);
    const q = room('cowork');
    DESKS.forEach((d, n) => freeDesk(n));
    put(art.plant(22), q.x, q.y + 7, 1, 1, { tag: 'cowork' });
    put(art.coffeeCounter(3), q.x + 7, q.y + 7, 3, 1, { tag: 'cowork' });
    put(art.waterCooler(), q.x + 10, q.y + 7, 1, 1, { tag: 'cowork' });
    put(art.qblock(), q.x + 2, q.y + 7, 1, 1, { tag: 'cowork', anim: art.qblockAnim, interact: { type: 'info', room: 'cowork' } });
    put(art.whitePlant(23), q.x + 10, q.y, 1, 1, { tag: 'cowork' });
    buildZone([]);
  }

  TGL.world = {
    W, H, grid, solid, objects, links, breakSpots, roomAt, drawWallAnims, drawOverlay, renderStatic,
    T, room, refreshSolids, furnishRent, FLOOR_STYLES, WALL_STYLES, OPEN,
    // Zona de arriendo: normas, filas, dónde cabe una oficina y construirla.
    zone: { RULES, ROWS, DESKS, COWORK, plan: floorPlan, starts, build: buildZone, freeDesk, get leases() { return leases; } },
    // Para el editor: sacar y agregar objetos de una sala, y las casillas frente a sus puertas.
    removeTagged(tag) {
      for (let i = objects.length - 1; i >= 0; i--) if (objects[i].tag === tag) objects.splice(i, 1);
    },
    addObject: put,
    // Recalcula todas las colisiones (después de reconstruir la zona de arriendo).
    refreshAllSolids() {
      for (let i = 0; i < W * H; i++) solid[i] = isBlocked(grid[i]) ? 1 : 0;
      objects.forEach(markSolid);
    },
    doorEntries(id) {
      const q = room(id), out = [];
      for (const d of DOORS)
        if (d.k === 'h' && d.from === id) for (let x = d.x; x < d.x + d.w; x++) out.push({ x: x - q.x, y: d.y - 1 - q.y });
      return out;
    },
    isSolid(tx, ty) {
      return tx < 0 || ty < 0 || tx >= W || ty >= H || solid[ty * W + tx] === 1;
    },
    // Se aparece frente al ascensor del lobby.
    spawn: { x: 49 * T + 8, y: (34 + OY) * T + 12 },
  };
})();
