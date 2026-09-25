// Pixel art dibujado con código: personajes, muebles y texturas.
// Todo se dibuja en unidades de "pixel del mundo"; el juego escala después.

(function () {
  const T = 16;
  TGL.T = T;

  // Generador pseudoaleatorio con semilla, para que las texturas no cambien entre visitas.
  TGL.rng = function (seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  function r(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  }
  TGL.rect = r;

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  TGL.canvas = canvas;

  // ————————————————————————————————— Personajes
  // (x, y) = centro de los pies. Sprite de 14×22.

  function drawHuman(ctx, x, y, look, dir, frame) {
    const ox = x - 7, oy = y - 22;
    r(ctx, ox + 2, y - 2, 10, 3, 'rgba(0,0,0,.22)');
    // piernas
    const lA = frame === 1 ? 3 : 4, lB = frame === 2 ? 3 : 4;
    r(ctx, ox + 4, oy + 17, 2, lA, look.legs);
    r(ctx, ox + 8, oy + 17, 2, lB, look.legs);
    r(ctx, ox + 4, oy + 16 + lA, 2, 1, '#15130f');
    r(ctx, ox + 8, oy + 16 + lB, 2, 1, '#15130f');
    // torso y brazos
    r(ctx, ox + 3, oy + 10, 8, 8, look.body);
    r(ctx, ox + 3, oy + 17, 8, 1, 'rgba(0,0,0,.25)');
    const swing = frame === 0 ? 0 : frame === 1 ? 1 : -1;
    r(ctx, ox + 1, oy + 11 + swing, 2, 5, look.body);
    r(ctx, ox + 11, oy + 11 - swing, 2, 5, look.body);
    r(ctx, ox + 1, oy + 16 + swing, 2, 1, look.skin);
    r(ctx, ox + 11, oy + 16 - swing, 2, 1, look.skin);
    if (dir === 'down') r(ctx, ox + 6, oy + 10, 2, 2, look.skin); // cuello
    // cabeza
    r(ctx, ox + 3, oy + 2, 8, 8, look.skin);
    r(ctx, ox + 3, oy + 9, 8, 1, 'rgba(0,0,0,.12)');
    const h = look.hair;
    if (dir === 'up') {
      r(ctx, ox + 3, oy + 1, 8, 8, h);
    } else {
      r(ctx, ox + 3, oy + 1, 8, 3, h);
      if (look.hairStyle === 'side') r(ctx, ox + 3, oy + 3, 5, 1, h);
      if (dir === 'down') {
        r(ctx, ox + 2, oy + 2, 1, 4, h);
        r(ctx, ox + 11, oy + 2, 1, 4, h);
        r(ctx, ox + 5, oy + 5, 1, 2, '#1b1410');
        r(ctx, ox + 8, oy + 5, 1, 2, '#1b1410');
        r(ctx, ox + 6, oy + 8, 2, 1, 'rgba(120,50,40,.55)');
      } else if (dir === 'left') {
        r(ctx, ox + 8, oy + 1, 4, 7, h);
        r(ctx, ox + 4, oy + 5, 1, 2, '#1b1410');
      } else {
        r(ctx, ox + 2, oy + 1, 4, 7, h);
        r(ctx, ox + 9, oy + 5, 1, 2, '#1b1410');
      }
    }
  }

  function drawAgent(ctx, x, y, body, eye, dir, frame, t) {
    const ox = x - 7, oy = y - 22;
    r(ctx, ox + 2, y - 2, 10, 3, 'rgba(0,0,0,.22)');
    const lA = frame === 1 ? 3 : 4, lB = frame === 2 ? 3 : 4;
    r(ctx, ox + 4, oy + 17, 2, lA, '#8d97a6');
    r(ctx, ox + 8, oy + 17, 2, lB, '#8d97a6');
    r(ctx, ox + 4, oy + 16 + lA, 2, 1, '#3b4250');
    r(ctx, ox + 8, oy + 16 + lB, 2, 1, '#3b4250');
    // chasis
    r(ctx, ox + 3, oy + 10, 8, 8, body);
    r(ctx, ox + 3, oy + 10, 8, 1, 'rgba(255,255,255,.25)');
    r(ctx, ox + 3, oy + 17, 8, 1, 'rgba(0,0,0,.3)');
    if (dir === 'down') {
      r(ctx, ox + 5, oy + 12, 4, 3, '#1b2433');
      const on = Math.floor(t * 2 + x) % 2 === 0;
      r(ctx, ox + 6, oy + 13, 2, 1, on ? eye : '#2c3a50');
    }
    const swing = frame === 0 ? 0 : frame === 1 ? 1 : -1;
    r(ctx, ox + 1, oy + 11 + swing, 2, 5, '#aab4c3');
    r(ctx, ox + 11, oy + 11 - swing, 2, 5, '#aab4c3');
    // cabeza
    r(ctx, ox + 2, oy + 2, 10, 8, '#d7dfe9');
    r(ctx, ox + 2, oy + 2, 10, 1, '#f3f6fa');
    r(ctx, ox + 2, oy + 9, 10, 1, '#9aa5b5');
    if (dir === 'down') {
      r(ctx, ox + 3, oy + 4, 8, 4, '#1b2433');
      r(ctx, ox + 4, oy + 5, 2, 2, eye);
      r(ctx, ox + 8, oy + 5, 2, 2, eye);
    } else if (dir === 'left') {
      r(ctx, ox + 2, oy + 4, 6, 4, '#1b2433');
      r(ctx, ox + 3, oy + 5, 2, 2, eye);
    } else if (dir === 'right') {
      r(ctx, ox + 6, oy + 4, 6, 4, '#1b2433');
      r(ctx, ox + 9, oy + 5, 2, 2, eye);
    } else {
      r(ctx, ox + 4, oy + 4, 6, 4, '#aeb8c6');
      r(ctx, ox + 5, oy + 5, 1, 1, '#6b7788');
      r(ctx, ox + 8, oy + 5, 1, 1, '#6b7788');
    }
    // antena
    r(ctx, ox + 6, oy - 1, 2, 3, '#8d97a6');
    const blink = Math.floor(t * 1.5 + x * 0.1) % 3 !== 0;
    r(ctx, ox + 5, oy - 3, 4, 2, blink ? eye : '#56606f');
  }

  TGL.drawCharacter = function (ctx, c, t) {
    const x = Math.round(c.px), y = Math.round(c.py);
    if (c.kind === 'agent') drawAgent(ctx, x, y, c.body, TGL.roles[c.role].color, c.dir, c.frame, t);
    else drawHuman(ctx, x, y, c.look, c.dir, c.frame);
  };

  // ————————————————————————————————— Muebles
  // Cada mueble es un canvas cacheado. `top` = cuánto sobresale por encima de su huella.

  const WOOD = '#a8743f', WOOD_HI = '#c48a50', WOOD_DK = '#7a5230', WOOD_DKK = '#5c3d22';

  const art = {};

  art.desk = function (w, variant) {
    const W = w * T, top = 10, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, top, W, 9, WOOD);
    r(x, 0, top, W, 1, WOOD_HI);
    r(x, 0, top + 9, W, 5, WOOD_DK);
    r(x, 0, top + 13, W, 1, WOOD_DKK);
    r(x, 1, top + 14, 2, 2, WOOD_DKK);
    r(x, W - 3, top + 14, 2, 2, WOOD_DKK);
    const monitors = variant === 'dual' ? [4, W - 18] : [2];
    for (const mx of monitors) {
      r(x, mx + 5, 8, 3, 4, '#6b717c');
      r(x, mx + 2, 11, 9, 1, '#6b717c');
      r(x, mx, 0, 13, 9, '#2b2f3a');
      r(x, mx + 1, 1, 11, 6, '#1d3346');
    }
    const kx = variant === 'dual' ? W / 2 - 5 : 17;
    r(x, kx, top + 3, 10, 3, '#d8dde6');
    r(x, kx, top + 5, 10, 1, '#a9b0bc');
    if (variant !== 'dual') {
      r(x, W - 5, top + 2, 3, 3, '#f2efe9');
      r(x, W - 5, top + 2, 3, 1, '#6b4128');
    } else {
      r(x, kx + 12, top + 3, 3, 2, '#d8dde6');
    }
    return { canvas: c, top };
  };

  // Contenido animado de las pantallas (se dibuja encima del escritorio cacheado).
  art.deskScreens = function (variant, role) {
    return function (ctx, wx, wy, t) {
      const monitors = variant === 'dual' ? [4, 32] : [2];
      monitors.forEach(function (mx, i) {
        const sx = wx + mx + 1, sy = wy + 1;
        if (role === 'dev') {
          const rnd = TGL.rng(Math.floor(t * 2) + i * 7 + wx);
          for (let l = 0; l < 5; l++) {
            const len = 2 + Math.floor(rnd() * 8);
            r(ctx, sx + 1 + (l % 2) * 2, sy + l + (l > 2 ? 0 : 0), len, 1, l % 2 ? '#7ee0a0' : '#4dd6ff');
          }
        } else if (role === 'design') {
          const cols = ['#ffd24d', '#ff6fa8', '#4dd6ff', '#9cff57'];
          r(ctx, sx, sy, 11, 6, '#f1ece4');
          for (let k = 0; k < 4; k++) r(ctx, sx + 1 + k * 2 + (k > 1 ? 1 : 0), sy + 1, 2, 2, cols[k]);
          const p = Math.floor(t * 3) % 9;
          r(ctx, sx + 1 + p, sy + 4, 1, 1, '#2b2f3a');
        } else if (role === 'marketing') {
          r(ctx, sx, sy, 11, 6, '#1d2a3a');
          const rnd = TGL.rng(Math.floor(t / 2) + wx);
          for (let k = 0; k < 5; k++) {
            const hgt = 1 + Math.floor(rnd() * 4) + (k === 4 ? 1 : 0);
            r(ctx, sx + 1 + k * 2, sy + 6 - hgt, 1, hgt, '#ff6fa8');
          }
        } else if (role === 'data') {
          r(ctx, sx, sy, 11, 6, '#0f1f16');
          const off = Math.floor(t * 4);
          for (let l = 0; l < 3; l++) {
            const rnd = TGL.rng(off + l + i * 13);
            r(ctx, sx + 1, sy + 1 + l * 2, 3 + Math.floor(rnd() * 7), 1, '#9cff57');
          }
        } else {
          r(ctx, sx, sy, 11, 6, '#e9eef5');
          r(ctx, sx + 1, sy + 1, 6, 1, '#8a96a8');
          r(ctx, sx + 1, sy + 3, 8, 1, '#b7c0cc');
          r(ctx, sx + 1, sy + 4, 5, 1, '#b7c0cc');
        }
      });
    };
  };

  art.plant = function (seed) {
    const top = 10, c = canvas(T, T + top), x = c.getContext('2d');
    const g = ['#2f7a3b', '#3f8f3f', '#5fb35a'];
    const rnd = TGL.rng(seed || 3);
    const blobs = [[5, 2, 6, 6], [1, 7, 6, 4], [9, 6, 6, 5], [3, 11, 5, 4], [8, 11, 5, 4], [6, 6, 4, 8]];
    for (const b of blobs) r(x, b[0], b[1], b[2], b[3], g[Math.floor(rnd() * 2)]);
    for (let i = 0; i < 6; i++) r(x, 2 + Math.floor(rnd() * 11), 2 + Math.floor(rnd() * 12), 2, 1, g[2]);
    r(x, 3, top + 7, 10, 2, '#c97a3e');
    r(x, 4, top + 9, 8, 6, '#b5652f');
    r(x, 4, top + 14, 8, 1, '#8c4a20');
    return { canvas: c, top };
  };

  art.coatRack = function () {
    const top = 12, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 7, 2, 2, 24, '#8a8f98');
    r(x, 4, 25, 8, 2, '#6b717c');
    r(x, 2, 3, 5, 5, '#7b4a2a');
    r(x, 9, 4, 5, 6, '#35506e');
    r(x, 3, 1, 4, 2, '#c7a36a');
    return { canvas: c, top };
  };

  art.waterCooler = function () {
    const top = 14, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 4, 1, 8, 12, '#7cc4f2');
    r(x, 5, 2, 2, 9, '#b8e2fb');
    r(x, 6, 0, 4, 1, '#3d8fd0');
    r(x, 3, 13, 10, 16, '#e6e9ee');
    r(x, 3, 13, 10, 1, '#ffffff');
    r(x, 11, 14, 2, 15, '#c3c9d2');
    r(x, 5, 17, 2, 2, '#e04a4a');
    r(x, 9, 17, 2, 2, '#3d7fe0');
    r(x, 4, 21, 8, 1, '#aab2be');
    return { canvas: c, top };
  };

  art.cabinet = function (w) {
    const W = w * T, top = 14, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, 0, W, T + top - 1, WOOD);
    r(x, 0, 0, W, 2, WOOD_HI);
    r(x, 0, T + top - 2, W, 1, WOOD_DKK);
    for (let i = 0; i < w * 2; i++) {
      r(x, i * 8 + 1, 3, 6, 24, WOOD_DK);
      r(x, i * 8 + 2, 4, 4, 22, WOOD);
      r(x, i * 8 + (i % 2 ? 2 : 5), 14, 1, 3, '#e8d2a0');
    }
    return { canvas: c, top };
  };

  art.bookshelf = function (w, seed) {
    const W = w * T, top = 16, c = canvas(W, T + top), x = c.getContext('2d');
    const rnd = TGL.rng(seed || 9);
    const books = ['#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#8e44ad', '#e67e22', '#ecf0f1'];
    r(x, 0, 0, W, T + top, WOOD_DK);
    r(x, 0, 0, W, 2, WOOD_HI);
    for (let s = 0; s < 3; s++) {
      const sy = 3 + s * 9;
      r(x, 2, sy, W - 4, 7, '#3d2816');
      let bx = 2;
      while (bx < W - 4) {
        const bw = 2 + Math.floor(rnd() * 2), bh = 4 + Math.floor(rnd() * 3);
        if (rnd() < 0.15) { bx += 3; continue; }
        r(x, bx, sy + 7 - bh, Math.min(bw, W - 3 - bx), bh, books[Math.floor(rnd() * books.length)]);
        bx += bw;
      }
      r(x, 1, sy + 7, W - 2, 2, WOOD);
    }
    return { canvas: c, top };
  };

  art.fileCabinet = function () {
    const top = 14, c = canvas(T, T * 2 + top), x = c.getContext('2d');
    r(x, 1, 0, 14, T * 2 + top - 1, '#9aa3ae');
    r(x, 1, 0, 14, 2, '#c7ced7');
    for (let i = 0; i < 4; i++) {
      r(x, 2, 3 + i * 11, 12, 10, '#b3bbc5');
      r(x, 6, 7 + i * 11, 4, 1, '#5b6470');
    }
    return { canvas: c, top };
  };

  art.table = function (w, h, round) {
    const W = w * T, H = h * T, c = canvas(W, H + 4), x = c.getContext('2d');
    r(x, 1, H - 4, 2, 7, WOOD_DKK);
    r(x, W - 3, H - 4, 2, 7, WOOD_DKK);
    r(x, 0, 2, W, H - 4, WOOD);
    r(x, 0, 2, W, 1, WOOD_HI);
    r(x, 0, H - 3, W, 3, WOOD_DK);
    if (round) {
      r(x, 0, 2, 2, 2, 'rgba(0,0,0,0)');
      x.clearRect(0, 2, 1, 1); x.clearRect(W - 1, 2, 1, 1);
    }
    return { canvas: c, top: 0 };
  };

  art.chair = function (color, facing) {
    const top = 4, c = canvas(T, T + top), x = c.getContext('2d');
    color = color || '#3d5a8a';
    if (facing === 'up') {
      r(x, 3, 6, 10, 7, color);
      r(x, 3, 12, 10, 2, 'rgba(0,0,0,.25)');
      r(x, 4, 2, 8, 5, color);
    } else {
      r(x, 3, 0, 10, 8, color);
      r(x, 3, 0, 10, 1, 'rgba(255,255,255,.25)');
      r(x, 3, 8, 10, 5, color);
      r(x, 3, 12, 10, 1, 'rgba(0,0,0,.3)');
    }
    r(x, 7, 14, 2, 3, '#4a4f58');
    r(x, 4, 18, 8, 1, '#4a4f58');
    return { canvas: c, top };
  };

  art.sofa = function (w, color) {
    const W = w * T, top = 8, c = canvas(W, T + top), x = c.getContext('2d');
    color = color || '#6a4c93';
    r(x, 0, 0, W, 10, color);
    r(x, 0, 0, W, 1, 'rgba(255,255,255,.25)');
    r(x, 0, 9, W, 12, color);
    r(x, 3, 10, W - 6, 7, 'rgba(255,255,255,.12)');
    for (let i = 1; i < w; i++) r(x, i * T, 10, 1, 7, 'rgba(0,0,0,.2)');
    r(x, 0, 6, 3, 15, 'rgba(0,0,0,.18)');
    r(x, W - 3, 6, 3, 15, 'rgba(0,0,0,.18)');
    r(x, 0, 20, W, 2, 'rgba(0,0,0,.35)');
    return { canvas: c, top };
  };

  art.whiteboard = function (w, kind) {
    const W = w * T, top = 16, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 3, 20, 2, 12, '#8a8f98');
    r(x, W - 5, 20, 2, 12, '#8a8f98');
    r(x, 0, 0, W, 22, '#9aa1ab');
    r(x, 1, 1, W - 2, 20, '#fbfbf8');
    if (kind === 'chart') {
      const pts = [16, 14, 15, 11, 12, 8, 9, 5];
      for (let i = 0; i < pts.length - 1; i++) r(x, 3 + i * 3, pts[i], 3, 1, '#e04a4a');
      r(x, 3, 18, W - 6, 1, '#555');
      r(x, 3, 4, 1, 15, '#555');
      r(x, W - 9, 5, 5, 5, '#2e86c1');
      r(x, W - 9, 11, 5, 3, '#27ae60');
    } else if (kind === 'moodboard') {
      const cols = ['#ffd24d', '#ff6fa8', '#4dd6ff', '#5fae74', '#f4e2d0', '#2c4a35'];
      cols.forEach(function (cc, i) { r(x, 3 + (i % 3) * 9, 3 + Math.floor(i / 3) * 8, 7, 6, cc); });
    } else if (kind === 'kanban') {
      ['#ffd24d', '#9cff57', '#ff6fa8'].forEach(function (cc, i) {
        r(x, 3 + i * 9, 3, 7, 1, '#555');
        for (let k = 0; k < 3 - i; k++) r(x, 3 + i * 9, 6 + k * 5, 7, 4, cc);
      });
    } else {
      r(x, 4, 4, 18, 1, '#2e86c1');
      r(x, 4, 8, 12, 1, '#555');
      r(x, 4, 11, 20, 1, '#555');
      r(x, 4, 14, 9, 1, '#555');
    }
    return { canvas: c, top };
  };

  art.printer = function () {
    const top = 8, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 1, 6, 14, 17, '#d9dde3');
    r(x, 1, 6, 14, 1, '#ffffff');
    r(x, 3, 1, 10, 6, '#c3c9d2');
    r(x, 4, 0, 8, 2, '#ffffff');
    r(x, 3, 11, 10, 2, '#4a4f58');
    r(x, 11, 8, 2, 1, '#27ae60');
    r(x, 1, 22, 14, 1, '#8a8f98');
    return { canvas: c, top };
  };

  art.fridge = function () {
    const top = 16, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 1, 0, 14, 31, '#dfe4ea');
    r(x, 1, 0, 14, 1, '#ffffff');
    r(x, 1, 11, 14, 1, '#aab2be');
    r(x, 12, 4, 1, 5, '#8a8f98');
    r(x, 12, 14, 1, 8, '#8a8f98');
    r(x, 3, 3, 3, 3, '#ffd24d');
    return { canvas: c, top };
  };

  art.coffeeCounter = function (w) {
    const W = w * T, top = 12, c = canvas(W, T + top), x = c.getContext('2d');
    r(x, 0, 10, W, 18, '#8a6a4a');
    r(x, 0, 10, W, 3, '#d9d2c5');
    r(x, 0, 13, W, 1, '#6b4f35');
    for (let i = 0; i < w; i++) r(x, i * T + 7, 17, 2, 5, '#5c4330');
    // cafetera
    r(x, 3, 0, 11, 12, '#2b2f3a');
    r(x, 5, 3, 7, 5, '#4a4f58');
    r(x, 7, 8, 3, 3, '#f2efe9');
    // microondas
    r(x, W - 18, 3, 16, 9, '#c3c9d2');
    r(x, W - 17, 4, 10, 7, '#2b2f3a');
    // tazas
    r(x, 18, 8, 3, 3, '#f2efe9');
    r(x, 22, 8, 3, 3, '#e04a4a');
    return { canvas: c, top };
  };

  art.serverRack = function () {
    const top = 18, c = canvas(T, T + top), x = c.getContext('2d');
    r(x, 1, 0, 14, T + top - 1, '#23272f');
    r(x, 1, 0, 14, 1, '#4a4f58');
    for (let i = 0; i < 5; i++) r(x, 2, 2 + i * 6, 12, 5, '#343a45');
    return { canvas: c, top };
  };
  art.serverLeds = function (ctx, wx, wy, t) {
    for (let i = 0; i < 5; i++) {
      const rnd = TGL.rng(Math.floor(t * 6) + i * 31);
      r(ctx, wx + 3, wy + 4 + i * 6, 1, 1, rnd() > 0.3 ? '#9cff57' : '#1e3a14');
      r(ctx, wx + 5, wy + 4 + i * 6, 1, 1, rnd() > 0.6 ? '#ffd24d' : '#3a3214');
    }
  };

  art.kiosk = function () {
    const top = 10, c = canvas(T * 2, T + top), x = c.getContext('2d');
    r(x, 0, 8, 32, 18, '#2c4a35');
    r(x, 0, 8, 32, 2, '#3f6b4c');
    r(x, 0, 24, 32, 2, '#1c2f22');
    r(x, 6, 0, 20, 10, '#23272f');
    r(x, 7, 1, 18, 7, '#ffc367');
    r(x, 9, 3, 14, 1, '#2c4a35');
    r(x, 9, 5, 10, 1, '#2c4a35');
    return { canvas: c, top };
  };

  art.petBed = function () {
    const c = canvas(T * 2, T), x = c.getContext('2d');
    r(x, 1, 3, 30, 12, '#b5652f');
    r(x, 3, 5, 26, 8, '#f4e2d0');
    r(x, 1, 14, 30, 1, '#8c4a20');
    return { canvas: c, top: 0 };
  };
  // Gato de Zumi durmiendo; respira.
  art.cat = function (ctx, wx, wy, t) {
    const b = Math.sin(t * 2) > 0 ? 1 : 0;
    r(ctx, wx + 8, wy + 5 - b, 14, 7 + b, '#e8923a');
    r(ctx, wx + 10, wy + 6 - b, 3, 5, '#c9742a');
    r(ctx, wx + 16, wy + 6 - b, 3, 5, '#c9742a');
    r(ctx, wx + 19, wy + 3, 7, 7, '#e8923a');
    r(ctx, wx + 19, wy + 2, 2, 2, '#e8923a');
    r(ctx, wx + 24, wy + 2, 2, 2, '#e8923a');
    r(ctx, wx + 21, wy + 6, 2, 1, '#5c3d22');
    r(ctx, wx + 24, wy + 6, 1, 1, '#5c3d22');
    r(ctx, wx + 6, wy + 9, 5, 2, '#e8923a');
    if (Math.floor(t / 1.5) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px Silkscreen, monospace';
      ctx.fillText('z', wx + 27, wy + 1 - (t * 4 % 4));
    }
  };

  art.ballGoal = function () {
    const top = 6, c = canvas(T * 2, T + top), x = c.getContext('2d');
    r(x, 1, 0, 30, 2, '#f2f2f2');
    r(x, 1, 0, 2, 20, '#f2f2f2');
    r(x, 29, 0, 2, 20, '#f2f2f2');
    for (let i = 4; i < 29; i += 3) r(x, i, 2, 1, 16, 'rgba(255,255,255,.35)');
    for (let j = 4; j < 18; j += 3) r(x, 3, j, 26, 1, 'rgba(255,255,255,.35)');
    r(x, 12, 15, 6, 6, '#ffffff');
    r(x, 14, 17, 2, 2, '#222');
    return { canvas: c, top };
  };

  art.trophyShelf = function () {
    const top = 14, c = canvas(T * 2, T + top), x = c.getContext('2d');
    r(x, 0, 12, 32, 18, WOOD_DK);
    r(x, 0, 12, 32, 2, WOOD_HI);
    [[3, '#ffd24d'], [13, '#c0c6ce'], [23, '#d08a4a']].forEach(function (p) {
      r(x, p[0], 2, 6, 5, p[1]);
      r(x, p[0] + 2, 7, 2, 3, p[1]);
      r(x, p[0] + 1, 10, 4, 2, '#3d2816');
      r(x, p[0] + 1, 3, 1, 3, 'rgba(255,255,255,.5)');
    });
    return { canvas: c, top };
  };

  TGL.art = art;
})();
