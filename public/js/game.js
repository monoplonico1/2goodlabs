// Bucle del juego: movimiento, cámara, interacción y la interfaz encima del canvas.

(function () {
  const T = TGL.T, world = TGL.world;
  const $ = (s) => document.querySelector(s);

  const canvas = $('#office');
  const ctx = canvas.getContext('2d');
  const mini = $('#minimap');
  const mctx = mini.getContext('2d');

  let staticLayer = null;
  let scale = 3, dpr = 1, camX = 0, camY = 0;
  // Zoom: null = automático según la pantalla; si no, pixeles de pantalla por pixel del mundo.
  // `fit` muestra el piso completo.
  let zoom = null, fit = false;
  const keys = new Set();

  // ————————————————————————————————— Personajes
  const player = {
    kind: 'human', px: world.spawn.x, py: world.spawn.y, dir: 'down', frame: 0,
    look: { skin: '#f0c49a', hair: '#6b4a2b', hairStyle: 'short', body: '#e0a030', legs: '#2d3340' },
    path: null, walkT: 0, onArrive: null,
  };

  const npcs = TGL.team.map((m) => Object.assign({}, m, {
    px: m.x * T, py: m.row * T + 12, frame: 0, walkT: 0,
    home: { x: m.x * T, y: m.row * T + 12 },
    bubble: null, path: null, waitUntil: 0, patrolIdx: 0,
  }));
  // El perro de Zumi: pasea por la sala y ladra si le haces clic.
  const zumiRoom = TGL.rooms.find((r) => r.id === 'zumi');
  const dog = { px: 21 * T + 8, py: 12 * T + 12, dir: 'right', face: 'right', frame: 0, walkT: 0, path: null, waitUntil: 2, bubble: null };

  // Los que no se mueven también estorban el paso.
  for (const n of npcs) if (!n.patrol) world.solid[n.row * world.W + Math.floor(n.x)] = 1;

  // ————————————————————————————————— Rutas (BFS en la cuadrícula)
  const tileOf = (px, py) => ({ x: Math.floor(px / T), y: Math.floor((py - 4) / T) });

  function findPath(from, isGoal) {
    const W = world.W, H = world.H, prev = new Int32Array(W * H).fill(-1);
    const start = from.y * W + from.x;
    prev[start] = start;
    const q = [start];
    for (let qi = 0; qi < q.length; qi++) {
      const cur = q[qi], cx = cur % W, cy = (cur / W) | 0;
      if (isGoal(cx, cy)) {
        const path = [];
        for (let c = cur; c !== start; c = prev[c]) path.push({ x: c % W, y: (c / W) | 0 });
        return path.reverse();
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, ni = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[ni] !== -1 || world.solid[ni]) continue;
        prev[ni] = cur;
        q.push(ni);
      }
    }
    return null;
  }

  function walkTo(tx, ty, onArrive) {
    const from = tileOf(player.px, player.py);
    // Si el destino está ocupado, el tile libre más cercano.
    let best = null, bestD = Infinity;
    const p = findPath(from, (x, y) => {
      const d = Math.abs(x - tx) + Math.abs(y - ty);
      if (d < bestD) { bestD = d; best = { x, y }; }
      return d === 0;
    });
    const path = p || (best ? findPath(from, (x, y) => x === best.x && y === best.y) : null);
    player.path = path;
    player.onArrive = onArrive || null;
    if (path && path.length === 0 && onArrive) { player.onArrive = null; onArrive(); }
  }

  function walkToNpc(n) {
    const from = tileOf(player.px, player.py);
    const path = findPath(from, (x, y) => Math.hypot(x * T + 8 - n.px, y * T + 12 - n.py) <= 26);
    player.path = path;
    player.onArrive = () => { facePlayerTo(n); openDialog(n); };
    if (path && path.length === 0) { player.onArrive = null; facePlayerTo(n); openDialog(n); }
  }

  function facePlayerTo(n) {
    const dx = n.px - player.px, dy = n.py - player.py;
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  // Avanza un personaje por su ruta. Devuelve true mientras se mueve.
  function followPath(c, speed, dt) {
    if (!c.path || c.path.length === 0) return false;
    const next = c.path[0];
    const tx = next.x * T + 8, ty = next.y * T + 12;
    const dx = tx - c.px, dy = ty - c.py, dist = Math.hypot(dx, dy), step = speed * dt;
    if (Math.abs(dx) > Math.abs(dy)) c.dir = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) c.dir = dy > 0 ? 'down' : 'up';
    if (dist <= step) {
      c.px = tx; c.py = ty;
      c.path.shift();
    } else {
      c.px += (dx / dist) * step;
      c.py += (dy / dist) * step;
    }
    return true;
  }

  function blockedAt(px, py) {
    const x0 = Math.floor((px - 5) / T), x1 = Math.floor((px + 5) / T);
    const y0 = Math.floor((py - 4) / T), y1 = Math.floor((py + 1) / T);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (world.isSolid(x, y)) return true;
    return false;
  }

  // ————————————————————————————————— Actualización
  const SPEED = 130, AUTO_SPEED = 210;
  let bubbleTimer = 1.5, currentRoom = null, nearNpc = null, nearObj = null;

  function update(dt, t) {
    if (!dialogOpen()) {
      let ix = 0, iy = 0;
      if (keys.has('ArrowLeft') || keys.has('a')) ix -= 1;
      if (keys.has('ArrowRight') || keys.has('d')) ix += 1;
      if (keys.has('ArrowUp') || keys.has('w')) iy -= 1;
      if (keys.has('ArrowDown') || keys.has('s')) iy += 1;
      let moving = false;
      if (ix || iy) {
        player.path = null;
        player.onArrive = null;
        const len = Math.hypot(ix, iy), vx = (ix / len) * SPEED * dt, vy = (iy / len) * SPEED * dt;
        if (!blockedAt(player.px + vx, player.py)) player.px += vx;
        if (!blockedAt(player.px, player.py + vy)) player.py += vy;
        player.dir = Math.abs(ix) >= Math.abs(iy) && ix ? (ix > 0 ? 'right' : 'left') : iy > 0 ? 'down' : 'up';
        moving = true;
      } else if (followPath(player, AUTO_SPEED, dt)) {
        moving = true;
        if (player.path.length === 0) {
          player.path = null;
          const cb = player.onArrive;
          player.onArrive = null;
          if (cb) cb();
        }
      }
      animate(player, moving, dt);
    } else {
      animate(player, false, dt);
    }

    for (const n of npcs) {
      if (n.patrol) updatePatrol(n, dt, t);
      if (n.bubble && t > n.bubble.until) n.bubble = null;
    }

    updateDog(dt, t);

    bubbleTimer -= dt;
    if (bubbleTimer <= 0) {
      bubbleTimer = 2.2 + Math.random() * 1.5;
      const idle = npcs.filter((n) => !n.bubble);
      if (idle.length) {
        const n = idle[Math.floor(Math.random() * idle.length)];
        n.bubble = { text: status(n, Math.floor(Math.random() * n.statuses.es.length)), until: t + 4 };
      }
    }

    // ¿Con quién puedo hablar?
    nearNpc = null;
    let best = 30;
    for (const n of npcs) {
      const d = Math.hypot(n.px - player.px, n.py - player.py);
      if (d < best) { best = d; nearNpc = n; }
    }
    const pt = tileOf(player.px, player.py);
    nearObj = nearNpc ? null : world.objects.find((o) => o.interact &&
      pt.x >= o.x / T - 1 && pt.x <= (o.x + o.w) / T && pt.y >= o.y / T - 1 && pt.y <= (o.y + o.h) / T) || null;
    updateHint();

    const room = world.roomAt(pt.x, pt.y);
    if (room && room !== currentRoom) {
      currentRoom = room;
      showToast(room);
      $('#hud-room').textContent = TGL.t(room.name);
    }
  }

  function updateDog(dt, t) {
    if (dog.bubble && t > dog.bubble.until) dog.bubble = null;
    if (dog.path && dog.path.length) {
      followPath(dog, 34, dt);
      if (dog.dir === 'left' || dog.dir === 'right') dog.face = dog.dir;
      animate(dog, true, dt);
      if (!dog.path.length) { dog.path = null; dog.waitUntil = t + 2 + Math.random() * 4; }
      return;
    }
    animate(dog, false, dt);
    if (t < dog.waitUntil) return;
    dog.waitUntil = t + 1;
    const r = zumiRoom;
    const gx = r.x + Math.floor(Math.random() * r.w), gy = r.y + 3 + Math.floor(Math.random() * (r.h - 3));
    if (world.isSolid(gx, gy)) return;
    const path = findPath(tileOf(dog.px, dog.py), (x, y) => x === gx && y === gy);
    if (path && path.length < 16) dog.path = path;
    if (Math.random() < 0.25) bark(t);
  }
  function bark(t) {
    dog.bubble = { until: t + 1.8 };
  }

  // Un estado en los dos idiomas, para que la burbuja cambie si cambias de idioma.
  function status(n, i) {
    return { es: n.statuses.es[i], en: n.statuses.en[i] };
  }

  function animate(c, moving, dt) {
    if (moving) {
      c.walkT += dt;
      c.frame = Math.floor(c.walkT * 8) % 4 === 1 ? 1 : Math.floor(c.walkT * 8) % 4 === 3 ? 2 : 0;
    } else {
      c.walkT = 0;
      c.frame = 0;
    }
  }

  function updatePatrol(n, dt, t) {
    if (n.path && n.path.length) {
      followPath(n, 40, dt);
      animate(n, true, dt);
      if (n.path.length === 0) {
        n.path = null;
        const p = n.patrol[n.patrolIdx];
        n.dir = p.row < 6 ? 'up' : p.x > 43 ? 'right' : 'down';
        n.waitUntil = t + 5 + Math.random() * 3;
        n.bubble = { text: p.say, until: t + 3.5 };
      }
      return;
    }
    animate(n, false, dt);
    if (t < n.waitUntil || dialogFor === n) return;
    n.patrolIdx = (n.patrolIdx + 1) % n.patrol.length;
    const p = n.patrol[n.patrolIdx];
    const gx = Math.floor(p.x), gy = p.row;
    const path = findPath(tileOf(n.px, n.py), (x, y) => x === gx && y === gy);
    if (path) n.path = path;
  }

  // ————————————————————————————————— Dibujo
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    applyZoom();
  }

  function autoScale() {
    const tilesWide = canvas.clientWidth < 700 ? 11 : 24;
    return Math.max(2, Math.floor(Math.min(canvas.width / (tilesWide * T), canvas.height / (11 * T))));
  }
  function fitScale() {
    return Math.min(canvas.width / (world.W * T), canvas.height / (world.H * T));
  }
  const maxScale = () => Math.round(8 * dpr);

  function applyZoom() {
    if (fit) scale = fitScale();
    else scale = Math.min(maxScale(), Math.max(Math.ceil(fitScale()), zoom === null ? autoScale() : zoom));
    const b = $('#zoom-fit');
    b.setAttribute('aria-pressed', String(fit));
    $('#zoom-in').disabled = !fit && scale >= maxScale();
    $('#zoom-out').disabled = fit;
  }

  // Pasos enteros para que el pixel art no se deforme. Alejar más allá del mínimo = ver todo.
  function zoomBy(dir) {
    const step = Math.max(1, Math.round(dpr));
    if (fit) {
      if (dir < 0) return;
      fit = false;
      zoom = Math.ceil(fitScale());
      if (zoom <= fitScale() + 0.01) zoom += step;
    } else {
      const next = Math.round(scale) + dir * step;
      if (next <= fitScale()) fit = true;
      else zoom = Math.min(maxScale(), next);
    }
    applyZoom();
  }
  function toggleFit() {
    fit = !fit;
    applyZoom();
  }
  $('#zoom-in').addEventListener('click', () => zoomBy(1));
  $('#zoom-out').addEventListener('click', () => zoomBy(-1));
  $('#zoom-fit').addEventListener('click', toggleFit);

  function updateCamera() {
    const vw = canvas.width / scale, vh = canvas.height / scale;
    const mw = world.W * T, mh = world.H * T;
    camX = mw <= vw ? (mw - vw) / 2 : Math.max(0, Math.min(mw - vw, player.px - vw / 2));
    camY = mh <= vh ? (mh - vh) / 2 : Math.max(0, Math.min(mh - vh, player.py - 10 - vh / 2));
  }

  const toScreen = (wx, wy) => [Math.round(wx * scale - camX * scale), Math.round(wy * scale - camY * scale)];

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#17140f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ox = Math.round(-camX * scale), oy = Math.round(-camY * scale);
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    ctx.drawImage(staticLayer, 0, 0);
    world.drawWallAnims(ctx, t);

    const vx0 = camX - T * 2, vx1 = camX + canvas.width / scale + T * 2;
    const vy0 = camY - T * 2, vy1 = camY + canvas.height / scale + T * 3;
    const items = [];
    for (const o of world.objects)
      if (o.x + o.w > vx0 && o.x < vx1 && o.y + o.h > vy0 && o.y - o.top < vy1)
        items.push({ y: o.floor ? -1 : o.sortY, o });
    for (const n of npcs) items.push({ y: n.py, c: n });
    items.push({ y: player.py + 0.1, c: player });
    items.push({ y: dog.py, dog: true });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.o) {
        ctx.drawImage(it.o.canvas, it.o.x - it.o.ox, it.o.y - it.o.top);
        if (it.o.anim) it.o.anim(ctx, it.o.x, it.o.y - it.o.top, t);
      } else if (it.dog) {
        TGL.art.drawDog(ctx, dog.px, dog.py, dog.face, dog.frame, t, !dog.path);
      } else {
        TGL.drawCharacter(ctx, it.c, t);
      }
    }

    world.drawOverlay(ctx, t);

    // Capa de interfaz en pixeles de pantalla.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Muy lejos las etiquetas taparían todo.
    if (scale / dpr >= 1.6) {
      for (const n of npcs) drawNameTag(n);
      for (const n of npcs) if (n.bubble) drawBubble(n, TGL.t(n.bubble.text));
      if (dog.bubble) drawBubble(dog, TGL.ui('bark'), 14);
    }
    if (hoverNpc && hoverNpc !== nearNpc) drawRing(hoverNpc);
    if (nearNpc) drawRing(nearNpc);
    drawMinimap();
  }

  function font(px, weight, family) {
    return (weight || '') + ' ' + Math.round(px * dpr) + 'px ' + (family || 'Inter, system-ui, sans-serif');
  }

  function drawNameTag(n) {
    const [sx, sy] = toScreen(n.px, n.py - 27);
    ctx.font = font(10, '700');
    const text = n.name, w = ctx.measureText(text).width + 14 * dpr, h = 15 * dpr;
    const x = sx - w / 2, y = sy - h;
    ctx.fillStyle = 'rgba(20,20,26,.78)';
    roundRect(x, y, w, h, 4 * dpr);
    ctx.fill();
    ctx.fillStyle = TGL.roles[n.role].color;
    ctx.fillRect(x + 5 * dpr, y + h / 2 - 2 * dpr, 4 * dpr, 4 * dpr);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 11 * dpr, y + h / 2 + 0.5 * dpr);
  }

  function drawBubble(n, text, lift) {
    const [sx, sy] = toScreen(n.px, n.py - (lift || 27));
    ctx.font = font(11, '600');
    const pad = 7 * dpr, w = Math.min(ctx.measureText(text).width + pad * 2, 240 * dpr), h = 22 * dpr;
    const x = Math.round(sx - w / 2), y = Math.round(sy - h - 22 * dpr);
    ctx.fillStyle = '#1d1f24';
    roundRect(x - 2 * dpr, y - 2 * dpr, w + 4 * dpr, h + 4 * dpr, 6 * dpr);
    ctx.fill();
    ctx.fillStyle = '#fffdf7';
    roundRect(x, y, w, h, 5 * dpr);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx - 5 * dpr, y + h);
    ctx.lineTo(sx, y + h + 6 * dpr);
    ctx.lineTo(sx + 5 * dpr, y + h);
    ctx.fill();
    ctx.fillStyle = '#1d1f24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + pad / 2, y, w - pad, h);
    ctx.clip();
    ctx.fillText(text, x + w / 2, y + h / 2 + 0.5 * dpr);
    ctx.restore();
  }

  function drawRing(n) {
    const [sx, sy] = toScreen(n.px, n.py);
    ctx.strokeStyle = TGL.roles[n.role].color;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 9 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function roundRect(x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  // ————————————————————————————————— Minimapa
  let miniScale = 1;
  function setupMinimap() {
    const cssW = mini.clientWidth || 184;
    const d = Math.min(window.devicePixelRatio || 1, 3);
    mini.width = Math.round(cssW * d);
    mini.height = Math.round(cssW * d * (world.H / world.W));
    miniScale = mini.width / (world.W * T);
  }
  function drawMinimap() {
    mctx.imageSmoothingEnabled = true;
    mctx.globalAlpha = 1;
    mctx.drawImage(staticLayer, 0, 0, mini.width, mini.height);
    mctx.fillStyle = 'rgba(12,16,14,.35)';
    mctx.fillRect(0, 0, mini.width, mini.height);
    const s = miniScale;
    for (const n of npcs) {
      mctx.fillStyle = TGL.roles[n.role].color;
      mctx.fillRect(n.px * s - 2, n.py * s - 6, 4, 4);
    }
    mctx.fillStyle = '#ff3b3b';
    const blink = Math.floor(performance.now() / 400) % 2;
    mctx.fillRect(player.px * s - 3, player.py * s - 7, 6, 6);
    if (blink) { mctx.strokeStyle = '#fff'; mctx.lineWidth = 1; mctx.strokeRect(player.px * s - 4, player.py * s - 8, 8, 8); }
    mctx.strokeStyle = 'rgba(156,255,87,.8)';
    mctx.lineWidth = 1.5;
    mctx.strokeRect(camX * s, camY * s, (canvas.width / scale) * s, (canvas.height / scale) * s);
  }
  mini.addEventListener('click', (e) => {
    const b = mini.getBoundingClientRect();
    const wx = ((e.clientX - b.left) / b.width) * world.W * T;
    const wy = ((e.clientY - b.top) / b.height) * world.H * T;
    closeDialog();
    walkTo(Math.floor(wx / T), Math.floor(wy / T));
  });

  // ————————————————————————————————— Diálogo
  let dialogFor = null, typeTimer = null;
  const dialog = $('#dialog');
  let infoRoom = null;
  const dialogOpen = () => dialogFor !== null || infoRoom !== null;

  function openDialog(n) {
    dialogFor = n;
    const room = TGL.rooms.find((r) => r.id === n.room);
    const role = TGL.roles[n.role];
    $('#dlg-name').textContent = n.name;
    $('#dlg-role').textContent = TGL.ui(n.kind === 'agent' ? 'agentIA' : 'human') + ' · ' + TGL.t(role.label);
    $('#dlg-role').style.setProperty('--role', role.color);
    $('#dlg-room').textContent = TGL.t(room.name);
    $('#dlg-tasks').innerHTML = '';
    for (const task of TGL.t(n.tasks)) {
      const li = document.createElement('li');
      li.textContent = task;
      $('#dlg-tasks').appendChild(li);
    }
    $('#dlg-now').textContent = TGL.t(n.bubble ? n.bubble.text : status(n, 0));
    drawPortrait(n);
    const text = TGL.t(n.bio), out = $('#dlg-bio');
    out.textContent = '';
    clearInterval(typeTimer);
    let i = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) out.textContent = text;
    else typeTimer = setInterval(() => {
      i += 2;
      out.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(typeTimer);
    }, 16);
    out.dataset.full = text;
    dialog.hidden = false;
    $('#dlg-close').focus({ preventScroll: true });
    if (n.dir !== undefined && !n.path) n.dir = faceToward(n, player);
  }
  function faceToward(n, p) {
    const dx = p.px - n.px, dy = p.py - n.py;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }
  function closeDialog() {
    if (infoRoom) closeInfo();
    if (!dialogFor) return;
    const n = dialogFor;
    if (!n.patrol) n.dir = 'down';
    dialogFor = null;
    clearInterval(typeTimer);
    dialog.hidden = true;
    canvas.focus({ preventScroll: true });
  }
  function drawPortrait(n) {
    const pc = $('#dlg-portrait'), p = pc.getContext('2d');
    p.imageSmoothingEnabled = false;
    p.clearRect(0, 0, pc.width, pc.height);
    p.fillStyle = TGL.roles[n.role].color;
    p.globalAlpha = 0.25;
    p.fillRect(0, 0, pc.width, pc.height);
    p.globalAlpha = 1;
    p.save();
    p.scale(pc.width / 20, pc.width / 20);
    TGL.drawCharacter(p, { kind: n.kind, role: n.role, body: n.body, look: n.look, px: 10, py: 25, dir: 'down', frame: 0 }, 0);
    p.restore();
  }
  $('#dlg-close').addEventListener('click', closeDialog);

  // ————————————————————————————————— Bloques "?": información de la sala y su sitio web
  const infoBox = $('#info');
  function openInfo(roomId) {
    if (dialogFor) closeDialog();
    const room = TGL.rooms.find((r) => r.id === roomId);
    infoRoom = room;
    infoBox.style.setProperty('--room', room.color);
    $('#info-title').textContent = room.infoTitle || TGL.t(room.name);
    $('#info-text').textContent = TGL.t(room.info);
    const links = $('#info-links');
    links.innerHTML = '';
    for (const url of room.infoLinks || (room.link ? [room.link] : [])) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = url.includes('apps.apple.com') ? TGL.ui('appStoreBtn') : TGL.ui('visit') + ' ' + url.replace(/^https?:\/\//, '') + ' ↗';
      links.appendChild(a);
    }
    infoBox.hidden = false;
    (links.querySelector('a') || $('#info-close')).focus({ preventScroll: true });
  }
  function closeInfo() {
    infoRoom = null;
    infoBox.hidden = true;
    canvas.focus({ preventScroll: true });
  }
  $('#info-close').addEventListener('click', closeInfo);

  function useObject(o) {
    if (o.interact.type === 'directory') toggleDirectory(true);
    else if (o.interact.type === 'link') window.open(o.interact.url, '_blank', 'noopener');
    else if (o.interact.type === 'info') openInfo(o.interact.room);
  }

  // ————————————————————————————————— Pista para hablar, avisos
  const hint = $('#hint');
  function updateHint() {
    let text = null;
    if (dialogOpen()) text = null;
    else if (nearNpc) text = TGL.ui('talkTo') + ' ' + nearNpc.name;
    else if (nearObj && nearObj.interact.type === 'directory') text = TGL.ui('seeDirectory');
    else if (nearObj && nearObj.interact.type === 'link') text = TGL.ui(nearObj.interact.hint);
    else if (nearObj) {
      const room = TGL.rooms.find((r) => r.id === nearObj.interact.room);
      text = TGL.ui('moreInfo') + ' ' + (room.infoTitle || TGL.t(room.name));
    }
    hint.hidden = !text;
    if (text) hint.querySelector('span').textContent = text;
  }
  hint.addEventListener('click', interact);
  function interact() {
    if (dialogOpen()) return closeDialog();
    if (nearNpc) { facePlayerTo(nearNpc); openDialog(nearNpc); }
    else if (nearObj) useObject(nearObj);
  }

  let toastTimer = null;
  function showToast(room) {
    const el = $('#toast');
    el.querySelector('strong').textContent = TGL.t(room.name);
    el.querySelector('span').textContent = TGL.t(room.blurb);
    el.style.setProperty('--room', room.color);
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove('show'); }, 3800);
  }

  // ————————————————————————————————— Directorio (también es el contenido indexable)
  const panel = $('#directory');
  // Carita para el directorio: la cabeza del sprite, recortada.
  function drawFace(c, n) {
    const p = c.getContext('2d');
    p.imageSmoothingEnabled = false;
    p.save();
    p.scale(c.width / 13, c.height / 13);
    TGL.drawCharacter(p, { kind: n.kind, role: n.role, body: n.body, look: n.look, px: 6, py: n.kind === 'agent' ? 25 : 23, dir: 'down', frame: 0 }, 0.2);
    p.restore();
  }

  function buildDirectory() {
    const list = $('#dir-rooms');
    list.innerHTML = '';
    for (const room of TGL.rooms) {
      const members = npcs.filter((n) => n.room === room.id);
      if (!members.length) continue;
      const sec = document.createElement('section');
      sec.className = 'dir-room';
      sec.style.setProperty('--room', room.color);
      const h = document.createElement('h3');
      h.textContent = TGL.t(room.name);
      sec.appendChild(h);
      const p = document.createElement('p');
      p.textContent = TGL.t(room.blurb);
      if (room.link) {
        const a = document.createElement('a');
        a.href = room.link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = ' ' + room.link.replace(/^https?:\/\//, '') + ' ↗';
        p.appendChild(a);
      }
      if (room.appStore) {
        const a = document.createElement('a');
        a.href = room.appStore;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = ' · App Store ↗';
        p.appendChild(a);
      }
      sec.appendChild(p);
      const ul = document.createElement('ul');
      for (const n of members) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.style.setProperty('--role', TGL.roles[n.role].color);
        b.innerHTML = '<canvas width="48" height="48" aria-hidden="true"></canvas><strong></strong><small></small><em></em>';
        drawFace(b.querySelector('canvas'), n);
        b.querySelector('em').textContent = TGL.ui('go');
        b.querySelector('strong').textContent = n.name;
        b.querySelector('small').textContent = (n.kind === 'agent' ? TGL.ui('agent') + ' · ' : '') + TGL.t(TGL.roles[n.role].label);
        b.addEventListener('click', () => {
          toggleDirectory(false);
          closeDialog();
          walkToNpc(n);
        });
        li.appendChild(b);
        ul.appendChild(li);
      }
      sec.appendChild(ul);
      list.appendChild(sec);
    }
    const humans = npcs.filter((n) => n.kind === 'human').length;
    $('#hud-humans').textContent = humans;
    $('#hud-agents').textContent = npcs.length - humans;
  }
  function toggleDirectory(open) {
    const show = open === undefined ? panel.hidden : open;
    panel.hidden = !show;
    $('#btn-directory').setAttribute('aria-expanded', String(show));
    if (show) panel.querySelector('button, a').focus({ preventScroll: true });
    else canvas.focus({ preventScroll: true });
  }
  $('#btn-directory').addEventListener('click', () => toggleDirectory());
  $('#dir-close').addEventListener('click', () => toggleDirectory(false));

  // ————————————————————————————————— Entrada
  const MOVE = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's']);
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const inPanel = !panel.hidden && panel.contains(document.activeElement);
    if (k === 'Escape') { closeDialog(); toggleDirectory(false); return; }
    if (inPanel) return;
    if (k === '+' || k === '=') return zoomBy(1);
    if (k === '-' || k === '_') return zoomBy(-1);
    if (k === '0') return toggleFit();
    if (MOVE.has(k)) {
      e.preventDefault();
      keys.add(k);
      if (dialogOpen()) closeDialog();
    } else if (k === 'e' || k === 'Enter' || k === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON' && k !== 'e') return;
      e.preventDefault();
      interact();
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  window.addEventListener('blur', () => keys.clear());

  function worldFromEvent(e) {
    const b = canvas.getBoundingClientRect();
    return [((e.clientX - b.left) * dpr) / scale + camX, ((e.clientY - b.top) * dpr) / scale + camY];
  }
  function npcAt(wx, wy) {
    return npcs.find((n) => wx > n.px - 8 && wx < n.px + 8 && wy > n.py - 26 && wy < n.py + 2) || null;
  }
  const linkAt = (wx, wy) => world.links.find((l) => wx >= l.x && wx < l.x + l.w && wy >= l.y && wy < l.y + l.h) || null;
  // Los bloques "?" flotan por encima de su tile: el área de clic sube con ellos.
  const objectAt = (wx, wy) => world.objects.find((o) => o.interact && wx >= o.x && wx < o.x + o.w && wy >= o.y - Math.max(o.top, 8) && wy < o.y + o.h) || null;
  const dogAt = (wx, wy) => Math.abs(wx - dog.px) < 10 && wy > dog.py - 13 && wy < dog.py + 2;
  let hoverNpc = null;
  canvas.addEventListener('pointermove', (e) => {
    const [wx, wy] = worldFromEvent(e);
    hoverNpc = npcAt(wx, wy);
    canvas.style.cursor = hoverNpc || linkAt(wx, wy) || objectAt(wx, wy) || dogAt(wx, wy) ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerleave', () => { hoverNpc = null; });
  canvas.addEventListener('click', (e) => {
    if (performance.now() - pinchEnded < 400) return;
    const [wx, wy] = worldFromEvent(e);
    const n = npcAt(wx, wy);
    if (n) {
      const d = Math.hypot(n.px - player.px, n.py - player.py);
      if (d < 30) { facePlayerTo(n); openDialog(n); } else { closeDialog(); walkToNpc(n); }
      return;
    }
    closeDialog();
    const link = linkAt(wx, wy);
    if (link) return void window.open(link.url, '_blank', 'noopener');
    if (dogAt(wx, wy)) return bark(performance.now() / 1000);
    const obj = objectAt(wx, wy);
    if (obj) {
      const near = Math.abs(player.px - (obj.x + obj.w / 2)) < obj.w / 2 + 20 && Math.abs(player.py - (obj.y + obj.h / 2)) < obj.h / 2 + 20;
      // Los links abren de inmediato: el navegador solo permite la pestaña nueva durante el clic.
      if (near || obj.interact.type === 'link') return useObject(obj);
      return walkTo(Math.floor(obj.x / T), Math.floor(obj.y / T), () => useObject(obj));
    }
    walkTo(Math.floor(wx / T), Math.floor((wy - 4) / T));
  });

  // Rueda del mouse / trackpad: un paso de zoom por cada tanto de desplazamiento.
  let wheelAcc = 0;
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) >= 80) {
      zoomBy(wheelAcc < 0 ? 1 : -1);
      wheelAcc = 0;
    }
  }, { passive: false });

  // Pellizco en pantallas táctiles.
  const touches = new Map();
  let pinchBase = 0, pinchEnded = 0;
  const pinchDist = () => { const [a, b] = [...touches.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) pinchBase = pinchDist();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size !== 2 || !pinchBase) return;
    const ratio = pinchDist() / pinchBase;
    if (ratio > 1.25 || ratio < 0.8) {
      zoomBy(ratio > 1 ? 1 : -1);
      pinchBase = pinchDist();
    }
  });
  const endTouch = (e) => {
    if (!touches.delete(e.pointerId)) return;
    if (pinchBase) pinchEnded = performance.now();
    if (touches.size < 2) pinchBase = 0;
  };
  canvas.addEventListener('pointerup', endTouch);
  canvas.addEventListener('pointercancel', endTouch);

  // ————————————————————————————————— Idioma
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => TGL.setLang(b.dataset.lang)));
  window.addEventListener('langchange', () => {
    staticLayer = world.renderStatic();
    buildDirectory();
    if (dialogFor) openDialog(dialogFor);
    if (infoRoom) openInfo(infoRoom.id);
    if (currentRoom) $('#hud-room').textContent = TGL.t(currentRoom.name);
    if (currentRoom) showToast(currentRoom);
    updateHint();
  });

  // ————————————————————————————————— Arranque
  let last = 0;
  function frame(now) {
    const t = now / 1000;
    const dt = Math.min(0.05, t - last || 0);
    last = t;
    update(dt, t);
    updateCamera();
    draw(t);
    requestAnimationFrame(frame);
  }

  function start() {
    staticLayer = world.renderStatic();
    resize();
    setupMinimap();
    buildDirectory();
    window.addEventListener('resize', () => { resize(); setupMinimap(); });
    canvas.focus({ preventScroll: true });
    document.body.classList.add('ready');
    requestAnimationFrame(frame);
  }

  // Las fuentes se pintan dentro del canvas: hay que esperarlas (o rendirse a los 2 s).
  const fonts = document.fonts
    ? Promise.all([
        document.fonts.load('800 25px Inter'),
        document.fonts.load('700 10px Inter'),
        document.fonts.load('700 6px Inter'),
        document.fonts.load('8px Silkscreen'),
      ])
    : Promise.resolve();
  Promise.race([fonts, new Promise((res) => setTimeout(res, 2000))]).then(start, start);
})();
