// Arte propio de cada sala: el Board minimalista, los animales de Zumi,
// las pantallas y el ping-pong de Pickpals, y los bloques "?" de información.

(function () {
  const T = TGL.T, r = TGL.rect, canvas = TGL.canvas, art = TGL.art;

  // ————————————————————————————————— Bloque "?"
  const Q = ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.....', '..X..'];
  art.qblock = function () {
    const c = canvas(T, T);
    const x = c.getContext('2d');
    r(x, 3, 12, 10, 3, 'rgba(0,0,0,.22)');
    return { canvas: c, top: 0 };
  };
  art.qblockAnim = function (ctx, wx, wy, t) {
    const bob = Math.round(Math.sin(t * 3) * 1.5);
    const x = wx + 1, y = wy - 7 + bob;
    r(ctx, x, y, 14, 14, '#8a5a1a');
    r(ctx, x + 1, y + 1, 12, 12, '#ffc367');
    r(ctx, x + 1, y + 1, 12, 1, '#ffe3a8');
    r(ctx, x + 1, y + 1, 1, 12, '#ffe3a8');
    r(ctx, x + 1, y + 12, 12, 1, '#d48f2c');
    r(ctx, x + 12, y + 1, 1, 12, '#d48f2c');
    for (const [cx, cy] of [[2, 2], [11, 2], [2, 11], [11, 11]]) r(ctx, x + cx, y + cy, 1, 1, '#8a5a1a');
    const shine = Math.floor(t * 2) % 6 === 0;
    Q.forEach((row, j) => {
      for (let i = 0; i < 5; i++) {
        if (row[i] !== 'X') continue;
        r(ctx, x + 5 + i, y + 4 + j, 1, 1, '#6b3f0e');
        r(ctx, x + 4 + i, y + 3 + j, 1, 1, shine ? '#fff7e0' : '#ffffff');
      }
    });
  };

  // ————————————————————————————————— Board: blanco, aluminio y madera clara

  const ALU = '#d4d5da', ALU_DK = '#a9abb3', WHITE = '#f5f5f7', WOOD_DARK = '#7a5230';

  art.imacDesk = function () {
    const W = 2 * T, top = 14, c = canvas(W, T + top), x = c.getContext('2d');
    // mesa: placa blanca delgada y patas de aluminio
    r(x, 1, top + 7, 1, 9, ALU_DK);
    r(x, W - 2, top + 7, 1, 9, ALU_DK);
    r(x, 0, top, W, 5, WHITE);
    r(x, 0, top, W, 1, '#ffffff');
    r(x, 0, top + 5, W, 2, '#dcdce2');
    // monitor
    r(x, 7, 11, 4, 3, '#bfc0c6');
    r(x, 5, 13, 8, 1, ALU_DK);
    r(x, 0, 0, 18, 12, ALU);
    r(x, 1, 1, 16, 8, '#111');
    r(x, 0, 9, 18, 3, '#e8e8ec');
    // fondo de pantalla en degradado
    const g = x.createLinearGradient(1, 1, 17, 9);
    g.addColorStop(0, '#5b4bdb');
    g.addColorStop(0.5, '#2f8ee8');
    g.addColorStop(1, '#f28a4b');
    x.fillStyle = g;
    x.fillRect(1, 1, 16, 8);
    // teclado y mouse
    r(x, 20, top + 1, 9, 2, '#fbfbfd');
    r(x, 20, top + 3, 9, 1, '#d0d0d6');
    r(x, 30, top + 1, 1, 2, '#fbfbfd');
    return { canvas: c, top };
  };
  art.imacScreen = function (ctx, wx, wy, t) {
    const sx = wx + 3, sy = wy + 2;
    r(ctx, sx, sy, 10, 6, 'rgba(255,255,255,.92)');
    r(ctx, sx, sy, 10, 1, '#d8d8de');
    r(ctx, sx + 1, sy, 1, 1, '#ff5f57');
    r(ctx, sx + 2, sy, 1, 1, '#febc2e');
    const n = Math.floor(t * 1.5) % 4;
    for (let l = 0; l < 3; l++) r(ctx, sx + 1, sy + 2 + l, l <= n ? 4 + ((l * 3 + n) % 5) : 2, 1, l === 0 ? '#2f8ee8' : '#8e8e93');
  };

  art.oakTable = function (w, h) {
    const W = w * T, H = h * T, c = canvas(W, H + 4), x = c.getContext('2d');
    r(x, 3, H - 4, 1, 7, ALU_DK);
    r(x, W - 4, H - 4, 1, 7, ALU_DK);
    r(x, 0, 2, W, H - 4, '#dcc39a');
    for (let i = 5; i < H - 3; i += 5) r(x, 1, i, W - 2, 1, '#d4b98e');
    r(x, 0, 2, W, 1, '#ecdcbf');
    r(x, 0, H - 3, W, 2, '#b99a6c');
    // portátiles abiertos, una taza y una tableta
    for (const [lx, ly] of [[8, 5], [W - 22, 5], [8, H - 17], [W - 22, H - 17]]) {
      r(x, lx, ly, 14, 7, '#b9bac1');
      r(x, lx + 1, ly + 1, 12, 5, '#1c2230');
      r(x, lx - 1, ly + 7, 16, 3, ALU);
      r(x, lx - 1, ly + 9, 16, 1, ALU_DK);
    }
    r(x, W / 2 - 6, H / 2 - 4, 12, 8, '#2a2b30');
    r(x, W / 2 - 5, H / 2 - 3, 10, 6, '#3c6fd8');
    r(x, W / 2 + 10, H / 2 - 2, 3, 3, '#ffffff');
    return { canvas: c, top: 0 };
  };
  // Pantallas de los portátiles con código y gráficas.
  art.oakTableScreens = function (w, h) {
    const W = w * T, H = h * T;
    return function (ctx, wx, wy, t) {
      [[8, 5], [W - 22, 5], [8, H - 17], [W - 22, H - 17]].forEach(function (p, i) {
        const sx = wx + p[0] + 1, sy = wy + p[1] + 1;
        const k = Math.floor(t * 2 + i) % 5;
        for (let l = 0; l < 4; l++) r(ctx, sx + 1, sy + l + (l > 2 ? 0 : 0), 2 + ((l + k) % 4) * 2, 1, i % 2 ? '#7ee0a0' : '#8ab4ff');
      });
    };
  };

  art.whiteChair = function (facing) {
    const top = 4, c = canvas(T, T + top), x = c.getContext('2d');
    if (facing === 'up') {
      r(x, 3, 6, 10, 7, WHITE);
      r(x, 3, 12, 10, 1, '#cfd0d6');
      r(x, 4, 2, 8, 5, '#e9e9ee');
    } else {
      r(x, 3, 0, 10, 8, '#e9e9ee');
      r(x, 3, 0, 10, 1, '#ffffff');
      r(x, 3, 8, 10, 5, WHITE);
      r(x, 3, 12, 10, 1, '#cfd0d6');
    }
    r(x, 7, 14, 2, 3, ALU_DK);
    r(x, 4, 18, 8, 1, ALU_DK);
    return { canvas: c, top };
  };

  art.displayStand = function () {
    const W = 2 * T, top = 18, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 15, 20, 2, 10, ALU_DK);
    r(x, 9, 29, 14, 2, ALU);
    r(x, 0, 0, W, 21, '#1b1c20');
    r(x, 1, 1, W - 2, 19, '#08090b');
    return { canvas: c, top };
  };
  art.displayChart = function (ctx, wx, wy, t) {
    const sx = wx + 3, sy = wy + 3, w = 26, h = 15;
    r(ctx, sx, sy + h - 1, w, 1, '#2a2d35');
    const off = t * 3;
    for (let i = 0; i < w; i++) {
      const v = Math.sin((i + off) * 0.35) * 3 + i * 0.35;
      const y = Math.round(sy + h - 3 - v);
      r(ctx, sx + i, y, 1, 1, '#34c759');
      r(ctx, sx + i, y + 1, 1, sy + h - 2 - y, 'rgba(52,199,89,.18)');
    }
    r(ctx, sx, sy, 6, 1, '#f5f5f7');
    r(ctx, sx, sy + 2, 4, 1, '#8e8e93');
  };

  art.whiteShelf = function (w) {
    const W = w * T, top = 12, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, 10, W, 18, WHITE);
    r(x, 0, 10, W, 1, '#ffffff');
    r(x, 0, 26, W, 2, '#d0d0d6');
    r(x, W / 2, 13, 1, 12, '#e2e2e8');
    // parlante cilíndrico, jarrón y libros grises
    r(x, 4, 1, 6, 9, '#3a3b40');
    r(x, 4, 1, 6, 1, '#5a5b62');
    r(x, 6, 0, 2, 1, '#8e8e93');
    r(x, 14, 3, 4, 7, '#f0ece4');
    r(x, 15, 0, 1, 3, '#5f8f4f');
    r(x, 17, 1, 1, 2, '#5f8f4f');
    r(x, 22, 4, 2, 6, '#c7c7cc');
    r(x, 24, 3, 2, 7, '#8e8e93');
    r(x, 26, 5, 2, 5, '#e5e5ea');
    return { canvas: c, top };
  };

  art.whitePlant = function (seed) {
    const top = 14, c = canvas(T, T + top), x = c.getContext('2d');
    const rnd = TGL.rng(seed || 21);
    r(x, 7, 6, 2, 16, '#6b4a2b');
    const leaves = [[3, 0], [9, 2], [2, 6], [10, 7], [4, 11], [9, 12], [5, 3]];
    for (const [lx, ly] of leaves) {
      r(x, lx, ly, 5, 4, rnd() > 0.5 ? '#2f6b3a' : '#3d8248');
      r(x, lx + 1, ly + 1, 2, 1, '#5aa864');
    }
    r(x, 3, top + 6, 10, 10, WHITE);
    r(x, 3, top + 6, 10, 1, '#ffffff');
    r(x, 11, top + 7, 2, 9, '#dcdce2');
    return { canvas: c, top };
  };

  // ————————————————————————————————— Zumi: animales

  art.aquarium = function () {
    const W = 2 * T, top = 16, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, 18, W, 14, '#2c4a35');
    r(x, 0, 18, W, 1, '#3f6b4c');
    r(x, 2, 22, 12, 7, '#244030');
    r(x, 18, 22, 12, 7, '#244030');
    r(x, 0, 0, W, 18, '#23272f');
    r(x, 1, 1, W - 2, 16, '#58b7e0');
    r(x, 1, 1, W - 2, 3, '#7fcdef');
    r(x, 1, 14, W - 2, 3, '#e8d29a');
    r(x, 4, 8, 1, 6, '#3f9f4f');
    r(x, 5, 6, 1, 8, '#4fb35a');
    r(x, 25, 9, 1, 5, '#3f9f4f');
    r(x, 26, 7, 1, 7, '#4fb35a');
    r(x, 18, 12, 5, 2, '#8a8f98');
    return { canvas: c, top };
  };
  art.fish = function (ctx, wx, wy, t) {
    const fishes = [['#ff8a3d', 0.9, 6, 0], ['#ffd24d', 1.3, 10, 2], ['#ff5d8f', 0.7, 8, 4]];
    for (const [col, sp, y, ph] of fishes) {
      const p = (Math.sin(t * sp + ph) + 1) / 2;
      const fx = Math.round(wx + 3 + p * 22), right = Math.cos(t * sp + ph) > 0;
      r(ctx, fx, wy + y, 4, 2, col);
      r(ctx, right ? fx - 1 : fx + 4, wy + y, 1, 2, col);
      r(ctx, right ? fx + 3 : fx, wy + y, 1, 1, '#111');
    }
    for (let i = 0; i < 3; i++) {
      const by = wy + 13 - ((t * 6 + i * 4) % 11);
      r(ctx, wx + 22 + (i % 2), Math.round(by), 1, 1, '#d9f3ff');
    }
  };

  art.birdcage = function () {
    const top = 18, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 7, 20, 2, 12, '#8a8f98');
    r(x, 3, 31, 10, 2, '#6b717c');
    r(x, 7, 0, 2, 2, '#c9a24a');
    r(x, 3, 2, 10, 2, '#c9a24a');
    for (let i = 0; i < 6; i++) r(x, 2 + i * 2, 4, 1, 14, '#c9a24a');
    r(x, 2, 17, 12, 3, '#c9a24a');
    r(x, 3, 12, 10, 1, '#8a5a2a');
    return { canvas: c, top };
  };
  art.parrot = function (ctx, wx, wy, t) {
    const hop = Math.floor(t * 2) % 5 === 0 ? 1 : 0;
    const x = wx + 6, y = wy + 5 - hop;
    r(ctx, x, y, 4, 6, '#35b04a');
    r(ctx, x + 1, y - 2, 3, 3, '#35b04a');
    r(ctx, x + 4, y - 1, 1, 2, '#ffb02e');
    r(ctx, x + 2, y - 1, 1, 1, '#111');
    r(ctx, x, y + 3, 2, 4, '#e0463c');
    r(ctx, x + 1, y + 6, 1, 1, '#ffb02e');
  };

  art.terrarium = function () {
    const W = 2 * T, top = 8, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, 16, W, 8, WOOD_DARK);
    r(x, 0, 0, W, 17, '#4a5058');
    r(x, 1, 1, W - 2, 15, '#bfe3d0');
    r(x, 1, 11, W - 2, 5, '#d9b87a');
    r(x, 20, 8, 7, 4, '#8a8f98');
    r(x, 3, 9, 7, 2, '#7a5230');
    r(x, 1, 1, W - 2, 1, 'rgba(255,255,255,.6)');
    return { canvas: c, top };
  };
  art.turtle = function (ctx, wx, wy, t) {
    const p = (Math.sin(t * 0.25) + 1) / 2, right = Math.cos(t * 0.25) > 0;
    const x = Math.round(wx + 4 + p * 16), y = wy + 9;
    r(ctx, x, y, 6, 3, '#4f8f3a');
    r(ctx, x + 1, y - 1, 4, 1, '#6aa84f');
    r(ctx, right ? x + 6 : x - 2, y + 1, 2, 2, '#8fbf6a');
    r(ctx, x, y + 3, 1, 1, '#8fbf6a');
    r(ctx, x + 5, y + 3, 1, 1, '#8fbf6a');
  };

  art.bowls = function () {
    const c = canvas(T, T), x = c.getContext('2d');
    r(x, 1, 6, 6, 3, '#e04a4a');
    r(x, 2, 6, 4, 1, '#8a5a2a');
    r(x, 9, 6, 6, 3, '#3d7fe0');
    r(x, 10, 6, 4, 1, '#9fd3f0');
    r(x, 4, 12, 7, 2, '#f4efe3');
    r(x, 3, 11, 2, 2, '#f4efe3');
    r(x, 10, 11, 2, 2, '#f4efe3');
    r(x, 3, 13, 2, 2, '#f4efe3');
    r(x, 10, 13, 2, 2, '#f4efe3');
    return { canvas: c, top: 0 };
  };

  function paw(x, px, py, col) {
    r(x, px + 1, py + 3, 4, 3, col);
    r(x, px, py + 1, 1, 2, col);
    r(x, px + 2, py, 1, 2, col);
    r(x, px + 4, py, 1, 2, col);
    r(x, px + 6, py + 1, 1, 2, col);
  }
  art.pawRug = function (w, h) {
    const W = w * T, H = h * T, c = canvas(W, H), x = c.getContext('2d');
    r(x, 2, 0, W - 4, H, '#f4e2d0');
    r(x, 0, 2, W, H - 4, '#f4e2d0');
    r(x, 3, 3, W - 6, H - 6, '#efd6bd');
    const spots = [[6, 6], [18, 12], [30, 5], [42, 13], [W - 12, 6]];
    for (const [px, py] of spots) if (px < W - 8 && py < H - 8) paw(x, px, py, '#d9a77a');
    return { canvas: c, top: 0 };
  };
  art.paw = paw;

  // Perro (beagle). (x, y) = patas; dir 'left' | 'right'.
  art.drawDog = function (ctx, x, y, dir, frame, t, still) {
    x = Math.round(x); y = Math.round(y);
    const f = dir === 'left' ? -1 : 1;
    const px = (dx, dy, w, h, c) => r(ctx, f === 1 ? x + dx : x - dx - w, y + dy, w, h, c);
    r(ctx, x - 6, y - 1, 12, 2, 'rgba(0,0,0,.2)');
    // patas
    const a = frame === 1 ? 1 : 0, b = frame === 2 ? 1 : 0;
    px(-5, -3 - a, 2, 3 + a, '#f4efe3');
    px(-2, -3 - b, 2, 3 + b, '#f4efe3');
    px(2, -3 - a, 2, 3 + a, '#f4efe3');
    px(4, -3 - b, 2, 3 + b, '#f4efe3');
    // cuerpo
    px(-6, -8, 12, 5, '#b8752f');
    px(-4, -8, 6, 2, '#2b2420');
    px(-6, -4, 12, 1, '#f4efe3');
    // cola que se mueve
    const wag = Math.floor(t * (still ? 4 : 10)) % 2;
    px(-8, -10 + wag, 2, 3, '#b8752f');
    px(-8, -11 + wag, 1, 1, '#f4efe3');
    // cabeza
    px(4, -12, 6, 6, '#b8752f');
    px(8, -9, 3, 3, '#f4efe3');
    px(10, -9, 1, 1, '#2b2420');
    px(7, -11, 1, 1, '#2b2420');
    px(4, -11, 2, 6, '#7a4a1e');
  };

  // ————————————————————————————————— Pickpals: deportes

  // Transmisión en una pantalla. sport: 'soccer' | 'basket' | 'tennis' | 'baseball'.
  art.sportScreen = function (ctx, x, y, w, h, sport, t) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (sport === 'soccer') {
      for (let i = 0; i < w; i += 4) r(ctx, x + i, y, 2, h, '#2f8a3e');
      r(ctx, x, y, w, h, 'rgba(60,160,70,.55)');
      r(ctx, x + w / 2, y, 1, h, '#e8f5e8');
      r(ctx, x + w / 2 - 2, y + h / 2 - 2, 5, 5, 'rgba(232,245,232,.4)');
      r(ctx, x, y + h / 2 - 3, 2, 6, '#e8f5e8');
      r(ctx, x + w - 2, y + h / 2 - 3, 2, 6, '#e8f5e8');
      const bx = x + w / 2 + Math.sin(t * 1.3) * (w / 2 - 4), by = y + h / 2 + Math.sin(t * 2.1) * (h / 2 - 3);
      for (let i = 0; i < 3; i++) {
        r(ctx, Math.round(bx - 6 + Math.sin(t + i * 2) * 4 + i * 3), Math.round(by - 3 + i * 2), 2, 2, '#e04a4a');
        r(ctx, Math.round(bx + 4 + Math.cos(t * 1.2 + i) * 3 - i * 2), Math.round(by + 2 - i * 2), 2, 2, '#3d7fe0');
      }
      r(ctx, Math.round(bx), Math.round(by), 2, 2, '#ffffff');
    } else if (sport === 'basket') {
      r(ctx, x, y, w, h, '#d9964f');
      for (let i = 0; i < w; i += 5) r(ctx, x + i, y, 1, h, '#c98643');
      r(ctx, x + w / 2, y, 1, h, '#f7e3c6');
      r(ctx, x + 1, y + h / 2 - 3, 3, 6, '#f7e3c6');
      r(ctx, x + w - 4, y + h / 2 - 3, 3, 6, '#f7e3c6');
      r(ctx, x + w - 3, y + h / 2 - 1, 2, 2, '#e04a4a');
      const p = (t * 0.6) % 1, bx = x + 4 + p * (w - 9);
      const by = y + h - 3 - Math.abs(Math.sin(t * 6)) * (h - 5);
      r(ctx, Math.round(bx), Math.round(by), 2, 2, '#ff7a1a');
      r(ctx, Math.round(bx), Math.round(by), 1, 1, '#3a1f0a');
    } else if (sport === 'tennis') {
      r(ctx, x, y, w, h, '#3a6fb0');
      r(ctx, x + 2, y + 2, w - 4, h - 4, '#4a82c4');
      r(ctx, x + 2, y + 2, w - 4, 1, '#ffffff');
      r(ctx, x + 2, y + h - 3, w - 4, 1, '#ffffff');
      r(ctx, x + w / 2, y + 1, 1, h - 2, '#e8e8e8');
      const p = (Math.sin(t * 2) + 1) / 2, bx = x + 3 + p * (w - 7);
      const by = y + h / 2 - Math.abs(Math.sin(t * 4)) * 3;
      r(ctx, Math.round(bx), Math.round(by), 2, 2, '#e6ff3a');
    } else {
      r(ctx, x, y, w, h, '#3f8a3e');
      ctx.fillStyle = '#c99a5a';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h - 2);
      ctx.lineTo(x + w / 2 + 8, y + h / 2);
      ctx.lineTo(x + w / 2, y + 3);
      ctx.lineTo(x + w / 2 - 8, y + h / 2);
      ctx.closePath();
      ctx.fill();
      r(ctx, x + w / 2 - 1, y + h / 2 - 1, 2, 2, '#f2efe9');
      const p = (t * 0.8) % 1;
      r(ctx, Math.round(x + w / 2), Math.round(y + 3 + p * (h - 6)), 1, 1, '#ffffff');
    }
    // marcador y "en vivo"
    r(ctx, x + 1, y + 1, 11, 4, 'rgba(10,12,16,.75)');
    r(ctx, x + 2, y + 2, 1, 2, Math.floor(t * 2) % 2 ? '#e04a4a' : '#5a1a1a');
    r(ctx, x + 4, y + 2, 3, 2, '#f2f2f2');
    r(ctx, x + 8, y + 2, 3, 2, '#f2f2f2');
    ctx.restore();
  };

  art.tvConsole = function (w) {
    const W = w * T, top = 20, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, top + 2, W, 12, '#3a2c22');
    r(x, 0, top + 2, W, 1, '#5a4636');
    for (let i = 0; i < w; i++) r(x, i * T + 3, top + 6, T - 6, 6, '#2c2119');
    const tw = W / 2 - 4;
    for (const tx of [2, W / 2 + 2]) {
      r(x, tx + tw / 2 - 2, 17, 4, 5, '#23262d');
      r(x, tx, 0, tw, 19, '#111318');
    }
    return { canvas: c, top };
  };
  art.tvConsoleScreens = function (w, sports) {
    const W = w * T, tw = W / 2 - 4;
    return function (ctx, wx, wy, t) {
      [2, W / 2 + 2].forEach(function (tx, i) {
        art.sportScreen(ctx, wx + tx + 1, wy + 1, tw - 2, 16, sports[i], t + i * 3);
      });
    };
  };

  art.pingPong = function () {
    const W = 4 * T, H = 2 * T, c = canvas(W, H + 4), x = c.getContext('2d');
    r(x, 4, H - 6, 2, 9, '#23262d');
    r(x, W - 6, H - 6, 2, 9, '#23262d');
    r(x, 0, 2, W, H - 4, '#1f6f45');
    r(x, 1, 3, W - 2, 1, '#f2f2f2');
    r(x, 1, H - 4, W - 2, 1, '#f2f2f2');
    r(x, 1, 3, 1, H - 6, '#f2f2f2');
    r(x, W - 2, 3, 1, H - 6, '#f2f2f2');
    r(x, 2, H / 2, W - 4, 1, 'rgba(255,255,255,.6)');
    r(x, 0, H - 3, W, 3, '#15503a');
    // red
    r(x, W / 2 - 1, 0, 2, H - 2, '#e8e8e8');
    r(x, W / 2, 1, 1, H - 4, '#8a8f98');
    return { canvas: c, top: 0 };
  };
  // La pelota va y viene; las paletas la siguen.
  art.pingPongPlay = function (ctx, wx, wy, t) {
    const W = 4 * T, H = 2 * T, cycle = 1.4;
    const ph = (t % (cycle * 2)) / cycle, dirR = ph < 1, p = dirR ? ph : 2 - ph;
    const bx = wx + 6 + p * (W - 12);
    const by = wy + H / 2 - 2 + Math.sin(t * 1.7) * 6 - Math.abs(Math.sin(p * Math.PI)) * 5;
    const py = wy + H / 2 - 4 + Math.sin(t * 1.7) * 6;
    r(ctx, wx - 3, Math.round(py), 3, 6, '#e04a4a');
    r(ctx, wx - 2, Math.round(py) + 6, 1, 2, '#7a5230');
    r(ctx, wx + W, Math.round(py), 3, 6, '#23262d');
    r(ctx, wx + W + 1, Math.round(py) + 6, 1, 2, '#7a5230');
    r(ctx, Math.round(bx), Math.round(by + 6), 2, 1, 'rgba(0,0,0,.3)');
    r(ctx, Math.round(bx), Math.round(by), 2, 2, '#ffffff');
  };
})();
