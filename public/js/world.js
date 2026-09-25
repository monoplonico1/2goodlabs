// El piso de la oficina: plano de tiles, muebles, colisiones y la capa estática ya pintada.
//
//  x:  0          12              28                45
//  y0  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  muro (techo)
//  1-2 │  Board    │     Zumi       │    Pickpals    │  cara del muro
//  3-14│           │                │                │  salas
//  15  ▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀  puertas en x 5-6, 19-20, 36-37
//  16-17  cara del muro del lobby
//  18-26            Lobby
//  27  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

(function () {
  const T = TGL.T, r = TGL.rect, art = TGL.art;
  const W = 46, H = 28;
  const TOP = 1, FACE = 2;
  const FLOOR = { lobby: 10, board: 11, zumi: 12, pickpals: 13 };
  const DOORS = [
    { x: 5, w: 2, room: 'board' },
    { x: 19, w: 2, room: 'zumi' },
    { x: 36, w: 2, room: 'pickpals' },
  ];

  const grid = new Array(W * H).fill(TOP);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? TOP : grid[y * W + x]);
  const set = (x, y, v) => { grid[y * W + x] = v; };
  const isWall = (v) => v === TOP || v === FACE;

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

  // ————————————————————————————————— Muebles
  const objects = [];
  function put(sprite, x, y, w, h, opts) {
    opts = opts || {};
    const o = {
      x: x * T, y: y * T, w: w * T, h: h * T,
      canvas: sprite.canvas, top: sprite.top,
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

  // Board
  put(art.coatRack(), 1, 3, 1, 1);
  desk(2, 5, 'founder');
  desk(8, 5, 'founder');
  put(art.plant(1), 11, 3, 1, 1);
  put(art.whiteboard(2, 'roadmap'), 1, 8, 2, 1);
  put(art.table(4, 3), 4, 8, 4, 3);
  put(art.chair('#6b3a3a', 'down'), 5, 7, 1, 1);
  put(art.chair('#6b3a3a', 'down'), 6, 7, 1, 1);
  put(art.chair('#6b3a3a', 'down'), 3, 9, 1, 1);
  put(art.chair('#6b3a3a', 'down'), 8, 9, 1, 1);
  put(art.chair('#6b3a3a', 'up'), 5, 11, 1, 1);
  put(art.chair('#6b3a3a', 'up'), 6, 11, 1, 1);
  put(art.sofa(3, '#7a5a3a'), 1, 13, 3, 1);
  put(art.bookshelf(2, 4), 9, 13, 2, 1);
  put(art.plant(2), 11, 14, 1, 1);

  // Zumi
  put(art.serverRack(), 13, 3, 1, 1, { anim: art.serverLeds });
  desk(15, 5, 'dev');
  desk(19, 5, 'design');
  desk(23, 5, 'marketing');
  put(art.whiteboard(2, 'moodboard'), 21, 3, 2, 1);
  put(art.whiteboard(2, 'chart'), 25, 3, 2, 1);
  put(art.plant(3), 27, 3, 1, 1);
  put(art.bookshelf(2, 11), 26, 8, 2, 1);
  put(art.table(3, 2), 18, 9, 3, 2);
  put(art.chair('#3f8f5a', 'down'), 19, 8, 1, 1);
  put(art.chair('#3f8f5a', 'up'), 18, 11, 1, 1);
  put(art.chair('#3f8f5a', 'up'), 20, 11, 1, 1);
  put(art.table(3, 1), 14, 11, 3, 1);
  put(art.sofa(3, '#2c4a35'), 14, 13, 3, 1);
  put(art.petBed(), 23, 12, 2, 1, { anim: art.cat });
  put(art.plant(4), 13, 14, 1, 1);
  put(art.plant(5), 27, 14, 1, 1);

  // Pickpals
  put(art.plant(6), 29, 3, 1, 1);
  desk(30, 5, 'dev');
  desk(34, 5, 'marketing');
  desk(30, 10, 'design');
  desk(39, 10, 'data', 'dual');
  put(art.whiteboard(2, 'kanban'), 36, 3, 2, 1);
  put(art.fileCabinet(), 44, 6, 1, 2);
  put(art.ballGoal(), 32, 13, 2, 1);
  put(art.sofa(3, '#2f5fc4'), 39, 13, 3, 1);
  put(art.trophyShelf(), 42, 13, 2, 1);
  put(art.plant(7), 29, 14, 1, 1);
  put(art.plant(8), 44, 14, 1, 1);

  // Lobby
  put(art.fridge(), 1, 18, 1, 1);
  put(art.coffeeCounter(3), 2, 18, 3, 1);
  put(art.waterCooler(), 8, 18, 1, 1);
  put(art.printer(), 11, 18, 1, 1);
  put(art.waterCooler(), 17, 18, 1, 1);
  put(art.plant(9), 24, 18, 1, 1);
  put(art.plant(10), 34, 18, 1, 1);
  put(art.waterCooler(), 39, 18, 1, 1);
  put(art.plant(11), 44, 18, 1, 1);
  put(art.kiosk(), 22, 25, 2, 1, { interact: 'directory' });
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
  for (let i = 0; i < W * H; i++) solid[i] = isWall(grid[i]) ? 1 : 0;
  for (const o of objects) {
    if (!o.solid) continue;
    for (let y = o.y / T; y < (o.y + o.h) / T; y++)
      for (let x = o.x / T; x < (o.x + o.w) / T; x++) solid[y * W + x] = 1;
  }

  // ————————————————————————————————— Capa estática
  const WALL_TOP = '#2f2925', WALL_EDGE = '#51473f';
  const FACE_COLOR = { board: '#efe4d0', zumi: '#e2eedc', pickpals: '#dde6f3', lobby: '#ece6da' };

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
      r(ctx, px, py, T, T, '#a57446');
      for (let k = 0; k < 4; k++) {
        r(ctx, px, py + k * 4 + 3, T, 1, '#8d6139');
        const seam = ((x * 7 + (y * 4 + k) * 5) % 16);
        r(ctx, px + seam, py + k * 4, 1, 3, '#94673d');
      }
    } else if (v === FLOOR.zumi) {
      r(ctx, px, py, T, T, (x + y) % 2 ? '#78a37a' : '#729d74');
      for (let k = 0; k < 3; k++) r(ctx, px + Math.floor(rnd() * 16), py + Math.floor(rnd() * 16), 1, 1, '#86b087');
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
    { k: 'window', x: 2, y: 1, w: 2 }, { k: 'plate', x: 5, y: 1, w: 2, text: '2G', bg: '#1d1f24', fg: '#ffc367' },
    { k: 'window', x: 8, y: 1, w: 2 },
    // Zumi
    { k: 'window', x: 16, y: 1, w: 2 }, { k: 'plate', x: 19, y: 1, w: 2, text: 'zumi', bg: '#2c4a35', fg: '#ffc367' },
    { k: 'window', x: 23, y: 1, w: 2 },
    // Pickpals
    { k: 'window', x: 30, y: 1, w: 2 }, { k: 'plate', x: 33, y: 1, w: 3, text: 'pickpals', bg: '#1b2a4a', fg: '#9cff57' },
    { k: 'scoreboard', x: 39, y: 1, w: 5 },
    // Lobby
    { k: 'sign', x: 7, y: 16, w: 3, text: 'BOARD', fg: '#ffc367' },
    { k: 'painting', x: 13, y: 16, w: 2 },
    { k: 'sign', x: 21, y: 16, w: 3, text: 'ZUMI', fg: '#86d19a' },
    { k: 'clock', x: 27, y: 16, w: 1 },
    { k: 'painting', x: 30, y: 16, w: 2 },
    { k: 'sign', x: 38, y: 16, w: 3, text: 'PICKPALS', fg: '#9cc0ff' },
    { k: 'elevator', x: 42, y: 16, w: 2 },
  ];

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
      const ph = d.k === 'sign' ? 11 : 13, top = d.k === 'sign' ? py + 5 : py + 7;
      r(ctx, px + 2, top + 1, pw - 4, ph, 'rgba(0,0,0,.18)');
      r(ctx, px + 1, top, pw - 2, ph, d.bg || '#23262d');
      ctx.fillStyle = d.fg;
      ctx.font = '8px Silkscreen, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.text, px + pw / 2, top + ph / 2 + 1);
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

  function renderStatic() {
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
        } else {
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
    drawRug(ctx);
    return c;
  }

  // Marcador animado sobre el muro de Pickpals (se pinta cada frame).
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

  TGL.world = {
    W, H, grid, solid, objects, roomAt, drawScoreboard, renderStatic,
    isSolid(tx, ty) {
      return tx < 0 || ty < 0 || tx >= W || ty >= H || solid[ty * W + tx] === 1;
    },
    spawn: { x: 42.5 * T + 8, y: 18 * T + 12 },
  };
})();
