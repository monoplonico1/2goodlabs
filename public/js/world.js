// El piso de la oficina: plano de tiles, muebles, colisiones y la capa estática ya pintada.
//
//  x:  0          12              28                45       54
//  y0  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  cielo y ciudad
//  1-2 │  Board    │     Zumi       │    Pickpals    │ ═ baranda ═
//  3-14│           │                │                ⇆           ║
//  15  ▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀│  Terraza  ║
//  16-17  cara del muro del lobby                    │ (abierta) ║
//  18-26            Lobby                            ⇆           ║
//  27  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀═════════════
//  Puertas: x 5-6, 19-20, 36-37 hacia el lobby; filas 8-9 y 21-22 hacia la terraza.

(function () {
  const T = TGL.T, r = TGL.rect, art = TGL.art;
  const W = 55, H = 28;
  const TOP = 1, FACE = 2, SKY = 3, RAIL = 4;
  const FLOOR = { lobby: 10, board: 11, zumi: 12, pickpals: 13, terrace: 14 };
  const TERRACE_DOORS = [8, 9, 21, 22];
  const DOORS = [
    { x: 5, w: 2, room: 'board' },
    { x: 19, w: 2, room: 'zumi' },
    { x: 36, w: 2, room: 'pickpals' },
  ];

  const grid = new Array(W * H).fill(TOP);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? TOP : grid[y * W + x]);
  const set = (x, y, v) => { grid[y * W + x] = v; };
  const isWall = (v) => v === TOP || v === FACE;
  const isBlocked = (v) => v === TOP || v === FACE || v === SKY || v === RAIL;

  // Salas y caras de muro (dos tiles de alto: se ven desde el sur).
  for (const room of TGL.rooms) {
    for (let y = room.y; y < room.y + room.h; y++)
      for (let x = room.x; x < room.x + room.w; x++) set(x, y, FLOOR[room.id]);
    for (let x = room.x; x < room.x + room.w; x++) {
      set(x, room.y - 1, FACE);
      set(x, room.y - 2, FACE);
    }
  }
  for (const d of DOORS)
    for (let x = d.x; x < d.x + d.w; x++) {
      set(x, 15, FLOOR[d.room]);
      set(x, 16, FLOOR.lobby);
      set(x, 17, FLOOR.lobby);
    }
  // Terraza: sin muros. Arriba se ve el cielo y alrededor hay baranda de vidrio.
  for (let x = 46; x < W; x++) {
    set(x, 0, SKY);
    set(x, 1, SKY);
    set(x, 2, RAIL);
    set(x, H - 1, RAIL);
  }
  for (let y = 2; y < H; y++) set(W - 1, y, RAIL);
  for (const y of TERRACE_DOORS) set(45, y, FLOOR.terrace);

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
    };
    o.sortY = o.y + o.h;
    objects.push(o);
    return o;
  }
  const desk = (x, y, role, variant) =>
    put(art.desk(variant === 'dual' ? 3 : 2, variant), x, y, variant === 'dual' ? 3 : 2, 1, { anim: art.deskScreens(variant, role) });

  // Bloque "?" de información de una sala.
  const info = (x, y, room) => put(art.qblock(), x, y, 1, 1, { anim: art.qblockAnim, interact: { type: 'info', room } });

  // Board: blanco, aluminio y madera clara
  put(art.whitePlant(1), 1, 3, 1, 1);
  put(art.imacDesk(), 2, 5, 2, 1, { anim: art.imacScreen });
  put(art.imacDesk(), 8, 5, 2, 1, { anim: art.imacScreen });
  put(art.whitePlant(2), 11, 3, 1, 1);
  put(art.displayStand(), 1, 8, 2, 1, { anim: art.displayChart });
  put(art.oakTable(4, 3), 4, 8, 4, 3, { anim: art.oakTableScreens(4, 3) });
  put(art.whiteChair('down'), 5, 7, 1, 1);
  put(art.whiteChair('down'), 6, 7, 1, 1);
  put(art.whiteChair('down'), 3, 9, 1, 1);
  put(art.whiteChair('down'), 8, 9, 1, 1);
  put(art.whiteChair('up'), 5, 11, 1, 1);
  put(art.whiteChair('up'), 6, 11, 1, 1);
  put(art.sofa(3, '#c9c9ce'), 1, 13, 3, 1);
  put(art.whiteShelf(2), 9, 13, 2, 1);
  put(art.whitePlant(3), 11, 14, 1, 1);
  info(7, 13, 'board');

  // Zumi: el equipo comparte la sala con mascotas
  put(art.serverRack(), 13, 3, 1, 1, { anim: art.serverLeds });
  desk(15, 5, 'dev');
  desk(19, 5, 'design');
  desk(23, 5, 'marketing');
  put(art.whiteboard(2, 'chart'), 25, 3, 2, 1);
  put(art.plant(3), 27, 3, 1, 1);
  put(art.birdcage(), 13, 8, 1, 1, { anim: art.parrot });
  put(art.aquarium(), 26, 8, 2, 1, { anim: art.fish });
  put(art.terrarium(), 26, 11, 2, 1, { anim: art.turtle });
  put(art.pawRug(3, 2), 22, 9, 3, 2, { solid: false, floor: true });
  put(art.table(3, 2), 18, 9, 3, 2);
  put(art.chair('#3f8f5a', 'down'), 19, 8, 1, 1);
  put(art.chair('#3f8f5a', 'up'), 18, 11, 1, 1);
  put(art.chair('#3f8f5a', 'up'), 20, 11, 1, 1);
  put(art.table(3, 1), 14, 11, 3, 1);
  put(art.sofa(3, '#2c4a35'), 14, 13, 3, 1);
  put(art.petBed(), 23, 12, 2, 1, { anim: art.cat });
  put(art.bowls(), 25, 12, 1, 1, { solid: false, floor: true });
  put(art.plant(4), 13, 14, 1, 1);
  put(art.plant(5), 27, 14, 1, 1);
  info(21, 13, 'zumi');
  put(art.appStoreSign(), 23, 14, 2, 1, {
    anim: art.appStoreText,
    interact: { type: 'link', url: TGL.rooms.find((r) => r.id === 'zumi').appStore, hint: 'getZumi' },
  });

  // Pickpals: pantallas con deportes y ping-pong
  put(art.plant(6), 29, 3, 1, 1);
  desk(30, 5, 'dev');
  desk(34, 5, 'marketing');
  desk(30, 10, 'design');
  desk(39, 10, 'data', 'dual');
  put(art.fileCabinet(), 44, 6, 1, 2);
  put(art.pingPong(), 34, 8, 4, 2, { anim: art.pingPongPlay });
  put(art.ballGoal(), 30, 13, 2, 1);
  put(art.tvConsole(4), 32, 13, 4, 1, { anim: art.tvConsoleScreens(4, ['soccer', 'baseball']) });
  put(art.sofa(3, '#2f5fc4'), 39, 13, 3, 1);
  put(art.trophyShelf(), 42, 13, 2, 1);
  put(art.plant(7), 29, 14, 1, 1);
  put(art.plant(8), 44, 14, 1, 1);
  info(38, 13, 'pickpals');

  // Terraza: mesas con sombrilla, barra, árboles y jardineras
  const patio = (x, y, color) => {
    put(art.patioChair(), x - 1, y, 1, 1);
    put(art.patioTable(color), x, y, 2, 1);
    put(art.patioChair(), x + 2, y, 1, 1);
  };
  patio(48, 6, '#e04a4a');
  patio(51, 10, '#2f6fec');
  patio(48, 14, '#3f8f5a');
  patio(51, 18, '#f2a65a');
  put(art.tree(3), 46, 3, 2, 1);
  put(art.planter(3, 1), 50, 3, 3, 1);
  put(art.plant(18), 53, 3, 1, 1);
  put(art.planter(2, 3), 46, 11, 2, 1);
  put(art.barCounter(3), 51, 23, 3, 1);
  put(art.table(2, 1), 47, 23, 2, 1);
  put(art.sofa(3, '#e9e2d4'), 47, 25, 3, 1);
  put(art.plant(16), 46, 26, 1, 1);
  put(art.plant(17), 53, 26, 1, 1);

  // Dónde se paran los agentes en su descanso (tile y hacia dónde miran).
  const breakSpots = [
    { x: 47, y: 7, dir: 'right' }, { x: 50, y: 7, dir: 'left' },
    { x: 50, y: 11, dir: 'right' }, { x: 53, y: 11, dir: 'left' },
    { x: 47, y: 15, dir: 'right' }, { x: 50, y: 15, dir: 'left' },
    { x: 51, y: 24, dir: 'up' }, { x: 53, y: 24, dir: 'up' },
  ];

  // Lobby
  put(art.fridge(), 1, 18, 1, 1);
  put(art.coffeeCounter(3), 2, 18, 3, 1);
  put(art.waterCooler(), 8, 18, 1, 1);
  put(art.printer(), 11, 18, 1, 1);
  put(art.waterCooler(), 17, 18, 1, 1);
  put(art.plant(9), 24, 18, 1, 1);
  put(art.plant(10), 34, 18, 1, 1);
  put(art.waterCooler(), 41, 18, 1, 1);
  put(art.plant(11), 44, 18, 1, 1);
  put(art.kiosk(), 22, 25, 2, 1, { interact: { type: 'directory' } });
  put(art.sofa(3, '#6a4c93'), 2, 25, 3, 1);
  put(art.sofa(3, '#6a4c93'), 7, 25, 3, 1);
  put(art.sofa(3, '#6a4c93'), 33, 25, 3, 1);
  put(art.sofa(3, '#6a4c93'), 38, 25, 3, 1);
  put(art.plant(12), 1, 26, 1, 1);
  put(art.plant(13), 44, 26, 1, 1);
  put(art.plant(14), 12, 26, 1, 1);
  put(art.plant(15), 30, 26, 1, 1);

  // ————————————————————————————————— Colisiones
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = isBlocked(grid[i]) ? 1 : 0;
  for (const o of objects) {
    if (!o.solid) continue;
    for (let y = o.y / T; y < (o.y + o.h) / T; y++)
      for (let x = o.x / T; x < (o.x + o.w) / T; x++) solid[y * W + x] = 1;
  }

  // ————————————————————————————————— Capa estática
  const WALL_TOP = '#2f2925', WALL_EDGE = '#51473f';
  const FACE_COLOR = { board: '#f7f7f9', zumi: '#e2eedc', pickpals: '#dde6f3', lobby: '#ece6da' };

  function roomAt(tx, ty) {
    for (const room of TGL.rooms)
      if (tx >= room.x && tx < room.x + room.w && ty >= room.y && ty < room.y + room.h) return room;
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

  const decor = [
    // Board
    { k: 'glass', x: 1, y: 1, w: 3 }, { k: 'wallDisplay', x: 4, y: 1, w: 4 }, { k: 'glass', x: 8, y: 1, w: 3 },
    // Zumi
    { k: 'window', x: 14, y: 1, w: 2 },
    { k: 'plate', x: 18, y: 1, w: 3, text: 'zumi', bg: '#2c4a35', fg: '#ffc367', url: 'https://zumiapp.co', link: '#2c6b3f' },
    { k: 'pawPoster', x: 22, y: 1, w: 1 }, { k: 'petPhoto', x: 23, y: 1, w: 2 },
    // Pickpals
    { k: 'tv', x: 30, y: 1, w: 2, sport: 'tennis' },
    { k: 'plate', x: 33, y: 1, w: 3, text: 'pickpals', bg: '#1b2a4a', fg: '#9cff57', url: 'https://pickpals.co', link: '#2f5fc4' },
    { k: 'tv', x: 37, y: 1, w: 2, sport: 'basket' },
    { k: 'scoreboard', x: 39, y: 1, w: 5 },
    // Lobby
    { k: 'sign', x: 7, y: 16, w: 3, text: 'BOARD', fg: '#ffc367' },
    { k: 'painting', x: 13, y: 16, w: 2 },
    { k: 'sign', x: 21, y: 16, w: 3, text: 'ZUMI', fg: '#86d19a', url: 'https://zumiapp.co', link: '#2c6b3f' },
    { k: 'clock', x: 27, y: 16, w: 1 },
    { k: 'painting', x: 30, y: 16, w: 2 },
    { k: 'sign', x: 38, y: 16, w: 3, text: 'PICKPALS', fg: '#9cc0ff', url: 'https://pickpals.co', link: '#2f5fc4' },
    { k: 'elevator', x: 42, y: 16, w: 2 },
  ];

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
      const ph = d.k === 'sign' ? 11 : 13, top = d.k === 'sign' ? py + 5 : py + 4;
      r(ctx, px + 2, top + 1, pw - 4, ph, 'rgba(0,0,0,.18)');
      r(ctx, px + 1, top, pw - 2, ph, d.bg || '#23262d');
      ctx.fillStyle = d.fg;
      ctx.font = '8px Silkscreen, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.text, px + pw / 2, top + ph / 2 + 1);
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
    const x = 15 * T, y = 20 * T, w = 16 * T, h = 4 * T;
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
    if (x === W - 1 && y > 2) {
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
    const x0 = 46 * T, w = (W - 46) * T, h = 2 * T;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6fb6ea');
    g.addColorStop(1, '#cfe9f7');
    ctx.fillStyle = g;
    ctx.fillRect(x0, 0, w, h);
    const rnd = TGL.rng(77);
    for (const [cx, cy] of [[8, 4], [60, 8], [100, 3]]) {
      r(ctx, x0 + cx, cy, 16, 3, '#ffffff');
      r(ctx, x0 + cx + 4, cy - 2, 8, 3, '#ffffff');
    }
    let bx = x0;
    while (bx < x0 + w) {
      const bw = 8 + Math.floor(rnd() * 12), bh = 8 + Math.floor(rnd() * 16);
      const col = rnd() > 0.5 ? '#7b8ea8' : '#8c9fb8';
      r(ctx, bx, h - bh, bw, bh, col);
      for (let wy = h - bh + 3; wy < h - 2; wy += 4)
        for (let wx = bx + 2; wx < bx + bw - 2; wx += 3) if (rnd() > 0.4) r(ctx, wx, wy, 1, 2, '#dfe8f2');
      bx += bw + 1;
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
          const room = faceRoom(x, y);
          r(ctx, px, py, T, T, FACE_COLOR[room.id]);
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
      for (let y = 15; y <= 17; y++) {
        r(ctx, d.x * T - 2, y * T, 2, T, '#5c3d22');
        r(ctx, (d.x + d.w) * T, y * T, 2, T, '#5c3d22');
      }
      r(ctx, d.x * T + 2, 18 * T + 1, d.w * T - 4, 6, '#6b4f35');
    }
    for (const d of decor) drawDecor(ctx, d);
    drawSky(ctx);
    // Puertas corredizas hacia la terraza.
    for (let i = 0; i < TERRACE_DOORS.length; i += 2) {
      const y = TERRACE_DOORS[i];
      r(ctx, 45 * T, y * T - 2, T, 2, '#9aa3ae');
      r(ctx, 45 * T, (y + 2) * T, T, 2, '#9aa3ae');
    }
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
    art.stringLights(ctx, 46 * T, (W - 1) * T, 9 * T + 4, t, 2);
    art.stringLights(ctx, 46 * T, (W - 1) * T, 17 * T + 4, t + 1, 2);
  }

  TGL.world = {
    W, H, grid, solid, objects, links, breakSpots, roomAt, drawWallAnims, drawOverlay, renderStatic,
    isSolid(tx, ty) {
      return tx < 0 || ty < 0 || tx >= W || ty >= H || solid[ty * W + tx] === 1;
    },
    spawn: { x: 42.5 * T + 8, y: 18 * T + 12 },
  };
})();
