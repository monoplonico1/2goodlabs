// Editor de oficinas (beta). Por ahora edita una sola sala y guarda en este navegador.
// Se enciende y apaga desde js/features.js.

(function () {
  const ROOM = 'rent3'; // oficina de arriba a la derecha
  const cat = TGL.catalog, space = TGL.space, world = TGL.world, game = TGL.game, T = world.T;
  const room = world.room(ROOM);

  const L = {
    es: {
      open: 'Editar oficina', title: 'Editor de oficina', beta: 'BETA',
      tSpace: 'Espacio', tItems: 'Objetos', tStyle: 'Estilo', tBrand: 'Marca', tPeople: 'Personas',
      spaceIntro: 'Lo que se arrienda es espacio: 1 casilla = 1 m². Con más metros caben más personas y más objetos. Lo demás (colores, marca, links, plantillas) es igual en todos los tamaños.',
      perMonth: '/mes', soon: 'Próximamente', upTo: 'Hasta {p} personas · {i} objetos', notHere: 'No cabe en esta sala',
      priceNote: 'Precios de ejemplo: US$ {p} por m² al mes. Lo PRO son extras opcionales.',
      reset: '↺ Empezar de cero', resetConfirm: '¿Borrar todo y empezar de cero? Se pierde lo guardado en este navegador y no se puede deshacer.',
      resetDone: 'Listo: oficina en blanco. Empieza eligiendo el tamaño.',
      shrinkConfirm: '{n} cosas quedan fuera del nuevo tamaño y se quitarán. ¿Seguir?', sizeChanged: 'Ahora tu oficina mide {m} m²',
      undo: 'Deshacer', redo: 'Rehacer', try: 'Probar', save: 'Guardar', saved: 'Guardado', unsaved: 'Cambios sin guardar',
      more: 'Más opciones', export: 'Exportar JSON', import: 'Importar JSON', clearRoom: 'Vaciar oficina',
      restore: 'Volver a "Se arrienda"', close: 'Cerrar', back: '✎ Volver al editor',
      placeHint: 'Haz clic en la oficina para ponerlo. Esc para cancelar.',
      placePerson: 'Haz clic en la oficina para ubicar a esta persona. Esc para cancelar.',
      selectHint: 'Elige un objeto y ponlo en la oficina. Haz clic en algo ya puesto para moverlo, cambiarle el color o quitarlo.',
      move: 'Mover', duplicate: 'Duplicar', remove: 'Quitar', variant: 'Color o versión',
      templates: 'Empezar con una plantilla', templateConfirm: 'Esto reemplaza lo que tienes en la oficina. ¿Seguir?',
      floor: 'Piso', walls: 'Paredes', mode: 'Ambiente',
      name: 'Nombre (letrero)', tagline: 'Frase corta', primary: 'Color principal', accent: 'Color de acento',
      about: 'Descripción (bloque ?)', links: 'Links', linkLabel: 'Texto', addLink: '+ Agregar link', badUrl: 'Link no válido (usa https://…)',
      addAgent: '+ Agente', addHuman: '+ Persona', agent: 'Agente', human: 'Persona',
      personName: 'Nombre', personTitle: 'Cargo o rol', personBio: 'Bio corta', lines: 'Frases de sus burbujas',
      relocate: 'Reubicar', body: 'Ropa / chasis', eye: 'Ojos', skin: 'Piel', hair: 'Pelo',
      noPeople: 'Todavía no hay nadie. Agrega a tu equipo o a tus agentes.',
      capItems: 'Objetos', capPeople: 'Personas', pro: 'PRO',
      proNote: '{n} elementos PRO: en la versión final se cobrarían aparte.',
      bounds: 'Eso queda fuera de la oficina', overlap: 'Ya hay algo ahí', door: 'Hay que dejar libre la entrada',
      blocked: 'Así algo quedaría sin paso', full: 'Llegaste al límite de tu plan',
      leaveConfirm: '¿Salir sin guardar? Se pierden los cambios.', clearConfirm: '¿Vaciar la oficina?',
      restoreConfirm: '¿Volver a dejarla en arriendo? Se borra lo guardado en este navegador.',
      importError: 'Ese archivo no es una oficina válida.', localNote: 'Por ahora se guarda solo en este navegador.',
      color: 'Color', original: 'Original', custom: 'Cualquier color', pattern: 'Diseño',
      floorColor: 'Color del piso', wallColor: 'Color de las paredes',
      infoTitle: 'Bloque ?', infoMissing: 'Todavía no está en la oficina: sin él nadie puede leer la descripción ni los links.',
      infoPlaced: 'Está en la oficina. Quien se acerque y lo toque verá esta descripción y los links.',
      addInfo: '+ Poner bloque ?', infoAdded: 'Bloque ? puesto. Puedes arrastrarlo a otro lugar.', noRoom: 'No hay espacio libre para ponerlo',
      savedLocal: 'Guardado en este navegador. Otros dispositivos todavía no lo ven.',
      saveError: 'No se pudo guardar: este navegador no permite guardar datos (¿modo privado?).',
    },
    en: {
      open: 'Edit office', title: 'Office editor', beta: 'BETA',
      tSpace: 'Space', tItems: 'Objects', tStyle: 'Style', tBrand: 'Brand', tPeople: 'People',
      spaceIntro: 'What you rent is space: 1 tile = 1 m². More meters fit more people and more objects. Everything else (colors, brand, links, templates) is the same at every size.',
      perMonth: '/mo', soon: 'Coming soon', upTo: 'Up to {p} people · {i} objects', notHere: 'Does not fit in this room',
      priceNote: 'Example prices: US$ {p} per m² per month. PRO items are optional extras.',
      reset: '↺ Start over', resetConfirm: 'Delete everything and start over? What is saved in this browser is lost and cannot be undone.',
      resetDone: 'Done: blank office. Start by choosing the size.',
      shrinkConfirm: '{n} things fall outside the new size and will be removed. Continue?', sizeChanged: 'Your office is now {m} m²',
      undo: 'Undo', redo: 'Redo', try: 'Try it', save: 'Save', saved: 'Saved', unsaved: 'Unsaved changes',
      more: 'More options', export: 'Export JSON', import: 'Import JSON', clearRoom: 'Empty the office',
      restore: 'Back to "For rent"', close: 'Close', back: '✎ Back to editor',
      placeHint: 'Click inside the office to place it. Esc to cancel.',
      placePerson: 'Click inside the office to place this person. Esc to cancel.',
      selectHint: 'Pick an object and place it in the office. Click anything already placed to move, recolor or remove it.',
      move: 'Move', duplicate: 'Duplicate', remove: 'Remove', variant: 'Color or version',
      templates: 'Start from a template', templateConfirm: 'This replaces what is in the office. Continue?',
      floor: 'Floor', walls: 'Walls', mode: 'Ambience',
      name: 'Name (sign)', tagline: 'Short tagline', primary: 'Primary color', accent: 'Accent color',
      about: 'Description (? block)', links: 'Links', linkLabel: 'Label', addLink: '+ Add link', badUrl: 'Invalid link (use https://…)',
      addAgent: '+ Agent', addHuman: '+ Person', agent: 'Agent', human: 'Person',
      personName: 'Name', personTitle: 'Title or role', personBio: 'Short bio', lines: 'Speech bubble lines',
      relocate: 'Move', body: 'Clothes / chassis', eye: 'Eyes', skin: 'Skin', hair: 'Hair',
      noPeople: 'Nobody here yet. Add your team or your agents.',
      capItems: 'Objects', capPeople: 'People', pro: 'PRO',
      proNote: '{n} PRO elements: in the final version they would be paid extras.',
      bounds: 'That is outside the office', overlap: 'Something is already there', door: 'The entrance must stay clear',
      blocked: 'That would leave something unreachable', full: 'You reached your plan limit',
      leaveConfirm: 'Leave without saving? Your changes will be lost.', clearConfirm: 'Empty the office?',
      restoreConfirm: 'Put it back up for rent? What is saved in this browser will be deleted.',
      importError: 'That file is not a valid office.', localNote: 'For now it is saved only in this browser.',
      color: 'Color', original: 'Original', custom: 'Any color', pattern: 'Pattern',
      floorColor: 'Floor color', wallColor: 'Wall color',
      infoTitle: '? block', infoMissing: 'It is not in the office yet: without it nobody can read the description or the links.',
      infoPlaced: 'It is in the office. Whoever walks up to it and taps it sees this description and the links.',
      addInfo: '+ Place ? block', infoAdded: '? block placed. You can drag it somewhere else.', noRoom: 'There is no free spot for it',
      savedLocal: 'Saved in this browser. Other devices cannot see it yet.',
      saveError: 'Could not save: this browser does not allow storing data (private mode?).',
    },
  };
  const tr = (k) => L[TGL.lang][k];
  const nm = (o) => TGL.t(o.name);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const isUrl = (v) => /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v || '');

  // ————————————————————————————————— Estado
  let isOpen = false, previewing = false, dirty = false;
  let doc = null, saved = space.load(ROOM);
  let history = [], hIndex = -1;
  let tab = 'space', category = 'all';
  let tool = null;       // { kind: 'item', type, variant, color } | { kind: 'resident', data, index? } | { kind: 'move', ref }
  let selected = null;   // { kind: 'item' | 'resident', index }
  let hover = null;      // casilla relativa a la sala bajo el puntero
  let drag = null;       // { ref, startX, startY, dx, dy, moved }
  let message = null, messageTimer = null;
  let lastTab = null, reveal = null; // para conservar el scroll del panel entre renders
  const openPeople = new Set();      // tarjetas de personas abiertas (índices)

  // ————————————————————————————————— DOM
  const btn = document.createElement('button');
  btn.id = 'btn-editor';
  btn.type = 'button';
  btn.className = 'panel ed-open';
  document.body.appendChild(btn);

  const panel = document.createElement('aside');
  panel.id = 'editor';
  panel.className = 'ed-panel';
  panel.hidden = true;
  document.body.appendChild(panel);

  const backPill = document.createElement('button');
  backPill.type = 'button';
  backPill.className = 'panel ed-back';
  backPill.hidden = true;
  document.body.appendChild(backPill);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  function labelButtons() {
    btn.innerHTML = '✎ ' + esc(tr('open')) + ' <span class="ed-badge">' + tr('beta') + '</span>';
    backPill.textContent = tr('back');
  }
  labelButtons();

  // ————————————————————————————————— Abrir y cerrar
  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
  function focusRoom() {
    const mobile = isMobile();
    game.setFocus({
      x: room.x, y: room.y - 2, w: room.w, h: room.h + 2,
      padR: mobile ? 0 : panel.offsetWidth + 24,
      padB: mobile ? panel.offsetHeight : 0,
      padT: mobile ? 56 : 0,
    });
  }

  function openEditor() {
    isOpen = true;
    previewing = false;
    doc = clone(saved || room.custom || space.empty(ROOM));
    history = [JSON.stringify(doc)];
    hIndex = 0;
    dirty = false;
    tool = selected = null;
    space.apply(ROOM, doc);
    document.body.classList.add('editing');
    panel.hidden = false;
    btn.hidden = true;
    game.setFrozen(true);
    game.overlays.add(drawOverlay);
    render();
    requestAnimationFrame(focusRoom);
  }

  function closeEditor(force) {
    if (!force && dirty && !confirm(tr('leaveConfirm'))) return;
    isOpen = previewing = false;
    tool = selected = drag = null;
    space.apply(ROOM, saved);
    document.body.classList.remove('editing');
    panel.hidden = true;
    backPill.hidden = true;
    btn.hidden = false;
    game.overlays.delete(drawOverlay);
    game.setFocus(null);
    game.setFrozen(false);
  }

  // Probar: se camina por la oficina con los cambios, sin el panel.
  function startPreview() {
    previewing = true;
    tool = selected = null;
    panel.hidden = true;
    backPill.hidden = false;
    game.overlays.delete(drawOverlay);
    game.setFocus(null);
    game.setFrozen(false);
  }
  function endPreview() {
    previewing = false;
    panel.hidden = false;
    backPill.hidden = true;
    game.setFrozen(true);
    game.overlays.add(drawOverlay);
    render();
    requestAnimationFrame(focusRoom);
  }

  btn.addEventListener('click', openEditor);
  backPill.addEventListener('click', endPreview);
  window.addEventListener('resize', () => { if (isOpen && !previewing) focusRoom(); });

  // ————————————————————————————————— Cambios e historial
  function commit() {
    history = history.slice(0, hIndex + 1);
    history.push(JSON.stringify(doc));
    if (history.length > 60) history.shift();
    hIndex = history.length - 1;
    dirty = true;
    space.apply(ROOM, doc);
    render();
  }
  function undo() {
    if (hIndex <= 0) return;
    hIndex--;
    doc = JSON.parse(history[hIndex]);
    selected = tool = null;
    dirty = true;
    space.apply(ROOM, doc);
    render();
  }
  function redo() {
    if (hIndex >= history.length - 1) return;
    hIndex++;
    doc = JSON.parse(history[hIndex]);
    selected = tool = null;
    dirty = true;
    space.apply(ROOM, doc);
    render();
  }
  // Antes de guardar, lo que está a medio escribir (frases vacías, links incompletos) se limpia.
  function save() {
    doc = cleanDoc();
    if (!space.save(ROOM, doc)) { render(); return flash(tr('saveError'), true); }
    saved = clone(doc);
    dirty = false;
    space.apply(ROOM, doc);
    render();
    flash(tr('savedLocal'));
  }

  function flash(text, bad) {
    message = { text, bad };
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { message = null; renderFoot(); }, bad ? 5000 : 3500);
    renderFoot();
  }

  // ————————————————————————————————— Panel
  const thumbs = {};
  const sprite = (def, item) => (def.preview ? def.preview() : cat.build(def, item));
  function thumb(def, item) {
    const key = def.type + '|' + ((item && item.variant) || '') + '|' + ((item && item.color) || '');
    if (!thumbs[key]) {
      const sp = sprite(def, item);
      const c = document.createElement('canvas');
      c.width = c.height = 48;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      const s = Math.min(44 / sp.canvas.width, 44 / sp.canvas.height, 3);
      const k = s >= 1 ? Math.floor(s) : s;
      const w = sp.canvas.width * k, h = sp.canvas.height * k;
      x.drawImage(sp.canvas, (48 - w) / 2, (48 - h) / 2, w, h);
      thumbs[key] = c.toDataURL();
    }
    return thumbs[key];
  }

  const swatch = (color, active, data) =>
    `<button type="button" class="ed-swatch${active ? ' on' : ''}" style="--c:${color}" ${data} aria-label="${color}" title="${color}"></button>`;

  // Selector de color: cualquier color (selector nativo o código hex), los de la marca y una paleta.
  function colorControl(path, value, palette, opts) {
    opts = opts || {};
    value = (value || '#000000').toLowerCase();
    const brand = opts.brand === false ? [] : [doc.identity.primary, doc.identity.accent];
    const list = [...new Set(brand.concat(palette).map((c) => c.toLowerCase()))];
    const on = (c) => !opts.isOriginal && c === value;
    return `<div class="ed-colors">
      <div class="ed-row">
        <input type="color" value="${value}" data-color="${path}" aria-label="${esc(tr('custom'))}" title="${esc(tr('custom'))}">
        <input class="ed-hex" value="${value}" maxlength="7" spellcheck="false" data-hex="${path}" aria-label="HEX">
        ${opts.reset ? `<button type="button" class="ed-chip-text${opts.isOriginal ? ' on' : ''}" data-act="setcolor" data-path="${path}" data-v="">${esc(tr('original'))}</button>` : ''}
      </div>
      <div class="ed-row ed-swatches">${list.map((c, k) => swatch(c, on(c), `data-act="setcolor" data-path="${path}" data-v="${c}"${k < brand.length ? ' data-brand' : ''}`)).join('')}</div>
    </div>`;
  }

  // Cambia un color del documento a partir de su "ruta" en el panel.
  function setColor(path, v) {
    const p = path.split('.');
    if (p[0] === 'item') {
      const it = doc.items[selected.index];
      if (v) it.color = v; else delete it.color;
    } else if (p[0] === 'person') doc.residents[Number(p[1])][p[2]] = v;
    else doc[p[0]][p[1]] = v;
  }

  // Miniatura de un patrón de piso o pared, con el color actual.
  const pthumbs = new Map();
  function patternThumb(kind, id, color) {
    const key = kind + id + color + doc.identity.accent;
    if (!pthumbs.has(key)) {
      const c = TGL.canvas(32, 32), x = c.getContext('2d'), rnd = TGL.rng(7), q = { custom: doc };
      for (let ty = 0; ty < 2; ty++)
        for (let tx = 0; tx < 2; tx++) {
          if (kind === 'floor') world.FLOOR_STYLES[id](x, tx * T, ty * T, tx, ty, rnd, q, color);
          else world.WALL_STYLES[id](x, tx * T, ty * T, tx, ty === 1, color);
        }
      if (pthumbs.size > 200) pthumbs.clear();
      pthumbs.set(key, c.toDataURL());
    }
    return pthumbs.get(key);
  }
  const proBadge = (tier) => (tier === 'pro' ? `<span class="ed-pro">${tr('pro')}</span>` : '');
  const field = (label, html) => `<label class="ed-field"><span>${esc(label)}</span>${html}</label>`;

  function render() {
    labelButtons();
    const oldBody = panel.querySelector('.ed-body');
    const scroll = oldBody && lastTab === tab ? oldBody.scrollTop : 0;
    const tabs = [['space', 'tSpace'], ['items', 'tItems'], ['style', 'tStyle'], ['brand', 'tBrand'], ['people', 'tPeople']];
    panel.innerHTML = `
      <header class="ed-head">
        <div><strong>${esc(tr('title'))}</strong> <span class="ed-badge">${tr('beta')}</span><small>${esc(TGL.t(room._orig ? room._orig.name : room.name))}</small></div>
        <button type="button" class="ed-icon" data-act="close" aria-label="${esc(tr('close'))}">✕</button>
      </header>
      <div class="ed-tools">
        <button type="button" class="ed-icon" data-act="undo" title="${esc(tr('undo'))}" aria-label="${esc(tr('undo'))}" ${hIndex <= 0 ? 'disabled' : ''}>↶</button>
        <button type="button" class="ed-icon" data-act="redo" title="${esc(tr('redo'))}" aria-label="${esc(tr('redo'))}" ${hIndex >= history.length - 1 ? 'disabled' : ''}>↷</button>
        <button type="button" class="ed-btn" data-act="preview">▶ ${esc(tr('try'))}</button>
        <details class="ed-more"><summary class="ed-icon" title="${esc(tr('more'))}" aria-label="${esc(tr('more'))}">⋯</summary>
          <div class="ed-menu">
            <button type="button" data-act="export">${esc(tr('export'))}</button>
            <button type="button" data-act="import">${esc(tr('import'))}</button>
            <button type="button" data-act="clear">${esc(tr('clearRoom'))}</button>
            <button type="button" data-act="restore">${esc(tr('restore'))}</button>
          </div>
        </details>
        <button type="button" class="ed-btn ed-primary" data-act="save">${esc(tr('save'))}</button>
      </div>
      <nav class="ed-tabs">${tabs.map(([id, k]) => `<button type="button" data-tab="${id}" class="${tab === id ? 'on' : ''}">${esc(tr(k))}</button>`).join('')}</nav>
      <div class="ed-body">${renderTab()}</div>
      <footer class="ed-foot"></footer>`;
    lastTab = tab;
    const body = panel.querySelector('.ed-body');
    body.scrollTop = scroll;
    if (reveal) {
      const el = body.querySelector(reveal);
      if (el) el.scrollIntoView({ block: 'nearest' });
      reveal = null;
    }
    renderFoot();
  }

  function renderTab() {
    if (tab === 'space') return renderSpace();
    if (tab === 'items') return renderItems();
    if (tab === 'style') return renderStyle();
    if (tab === 'brand') return renderBrand();
    return renderPeople();
  }

  function renderInspector() {
    if (!selected || selected.kind !== 'item') return '';
    const it = doc.items[selected.index], def = cat.byType[it.type];
    const variants = def.variants
      ? `<div class="ed-field"><span>${esc(tr('variant'))}</span><div class="ed-row">${def.variants.map((v) =>
          `<button type="button" class="ed-chip${v === it.variant ? ' on' : ''}" data-act="variant" data-v="${v}"><img src="${thumb(def, { variant: v, color: it.color })}" alt=""></button>`
        ).join('')}</div></div>`
      : '';
    const color = cat.colorable(def)
      ? `<div class="ed-field"><span>${esc(tr('color'))}</span>${colorControl('item', it.color || cat.baseColor(def), cat.palettes.item, { reset: true, isOriginal: !it.color })}</div>`
      : '';
    return `<div class="ed-inspector">
      <div class="ed-insp-head"><img src="${thumb(def, it)}" alt=""><strong>${esc(nm(def))}</strong>${proBadge(def.tier)}</div>
      ${variants}
      ${color}
      <div class="ed-row">
        <button type="button" class="ed-btn" data-act="move">${esc(tr('move'))}</button>
        <button type="button" class="ed-btn" data-act="duplicate">${esc(tr('duplicate'))}</button>
        <button type="button" class="ed-btn ed-danger" data-act="remove">${esc(tr('remove'))}</button>
      </div>
    </div>`;
  }

  const money = (n) => 'US$ ' + n;
  const fill = (k, o) => tr(k).replace(/\{(\w)\}/g, (m, c) => o[c]);

  // Tamaños: el producto que se vende. El dibujo es la planta, con un módulo cada 4 m.
  function sizePlan(z) {
    const k = 2.5, w = z.w * k, h = z.h * k;
    let lines = '';
    for (let x = 4; x < z.w; x += 4) lines += `<line x1="${x * k}" y1="0" x2="${x * k}" y2="${h}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><rect width="${w}" height="${h}" rx="2"/>${lines}</svg>`;
  }
  function renderSpace() {
    const here = space.sizesFor(ROOM);
    return `
      <p class="ed-hint">${esc(tr('spaceIntro'))}</p>
      <div class="ed-sizes">${cat.sizes.map((z) => {
        const ok = here.includes(z);
        return `<button type="button" class="ed-size${doc.size === z.id ? ' on' : ''}${z.soon ? ' soon' : ''}" data-act="size" data-v="${z.id}" ${ok ? '' : 'disabled'}>
          <span class="ed-size-plan">${sizePlan(z)}</span>
          <span class="ed-size-txt">
            <strong>${esc(nm(z))}</strong>
            <small>${z.m2} m² · ${z.w} × ${z.h} m</small>
            <small>${esc(fill('upTo', { p: z.residents, i: z.items }))}</small>
            <small class="ed-size-note">${esc(TGL.t(z.note))}</small>
          </span>
          <b>${z.soon ? esc(tr('soon')) : ok ? money(z.price) + esc(tr('perMonth')) : esc(tr('notHere'))}</b>
        </button>`;
      }).join('')}</div>
      <p class="ed-note">${esc(fill('priceNote', { p: cat.pricePerM2.toFixed(2) }))}</p>`;
  }

  function renderItems() {
    const list = cat.items.filter((it) => category === 'all' || it.cat === category);
    const hint = tool && tool.kind === 'item' ? tr('placeHint') : tr('selectHint');
    return `${renderInspector()}
      <p class="ed-hint">${esc(hint)}</p>
      <div class="ed-row ed-cats">${cat.categories.map((c) => `<button type="button" class="ed-chip-text${category === c.id ? ' on' : ''}" data-cat="${c.id}">${esc(nm(c))}</button>`).join('')}</div>
      <div class="ed-grid">${list.map((def) => `
        <button type="button" class="ed-card${tool && tool.kind === 'item' && tool.type === def.type ? ' on' : ''}" data-act="pick" data-type="${def.type}">
          <img src="${thumb(def)}" alt="">
          <span>${esc(nm(def))}</span>
          <small>${def.w}×${def.h}</small>${proBadge(def.tier)}
        </button>`).join('')}</div>`;
  }

  function renderStyle() {
    const s = doc.surfaces;
    const opt = (list, kind, current, color) => list.map((o) => `
      <button type="button" class="ed-opt${current === o.id ? ' on' : ''}" data-act="${kind === 'floor' ? 'floor' : 'walls'}" data-v="${o.id}">
        <img src="${patternThumb(kind, o.id, color)}" alt=""><span>${esc(nm(o))}</span>${proBadge(o.tier)}</button>`).join('');
    return `
      <h3 class="ed-h">${esc(tr('templates'))}</h3>
      <div class="ed-row">${space.templates.map((t) => `<button type="button" class="ed-btn" data-act="template" data-v="${t.id}">${esc(nm(t))}</button>`).join('')}</div>
      <h3 class="ed-h">${esc(tr('floor'))}</h3>
      <div class="ed-field"><span>${esc(tr('floorColor'))}</span>${colorControl('surfaces.floorColor', s.floorColor, cat.palettes.floor)}</div>
      <div class="ed-opts">${opt(cat.floors, 'floor', s.floor, s.floorColor)}</div>
      <h3 class="ed-h">${esc(tr('walls'))}</h3>
      <div class="ed-field"><span>${esc(tr('wallColor'))}</span>${colorControl('surfaces.wallColor', s.wallColor, cat.palettes.wall)}</div>
      <div class="ed-opts">${opt(cat.walls, 'wall', s.walls, s.wallColor)}</div>
      <h3 class="ed-h">${esc(tr('mode'))}</h3><div class="ed-opts">${cat.modes.map((m) => `
        <button type="button" class="ed-opt${doc.mode === m.id ? ' on' : ''}" data-act="mode" data-v="${m.id}"><span>${esc(nm(m))}</span>${proBadge(m.tier)}</button>`).join('')}</div>`;
  }

  function renderBrand() {
    const id = doc.identity;
    const colorRow = (key) => colorControl('identity.' + key, id[key],
      ['#1d1f24', '#1b2a4a', '#2c4a35', '#6a4c93', '#8a3b3b', '#b5654a', '#ffc367', '#4dd6ff', '#9cff57', '#ff6fa8', '#f2a65a', '#ffffff'], { brand: false });
    const info = cat.byType.info, hasInfo = doc.items.some((it) => cat.byType[it.type].info);
    const infoBox = `<div class="ed-infobox${hasInfo ? '' : ' missing'}">
      <img src="${thumb(info)}" alt="">
      <div><strong>${esc(tr('infoTitle'))}</strong><small>${esc(tr(hasInfo ? 'infoPlaced' : 'infoMissing'))}</small></div>
      ${hasInfo ? '' : `<button type="button" class="ed-btn ed-primary" data-act="addinfo">${esc(tr('addInfo'))}</button>`}
    </div>`;
    const links = doc.content.links.map((l, i) => `
      <div class="ed-link">
        <input value="${esc(l.label)}" maxlength="30" placeholder="${esc(tr('linkLabel'))}" data-link="${i}" data-part="label">
        <input value="${esc(l.url)}" maxlength="300" placeholder="https://…" data-link="${i}" data-part="url" class="${l.url && !isUrl(l.url) ? 'bad' : ''}">
        <button type="button" class="ed-icon" data-act="unlink" data-i="${i}" aria-label="${esc(tr('remove'))}">✕</button>
      </div>`).join('');
    return `
      ${field(tr('name'), `<input value="${esc(id.name)}" maxlength="24" data-field="identity.name">`)}
      ${field(tr('tagline'), `<input value="${esc(id.tagline)}" maxlength="60" data-field="identity.tagline">`)}
      <div class="ed-field"><span>${esc(tr('primary'))}</span>${colorRow('primary')}</div>
      <div class="ed-field"><span>${esc(tr('accent'))}</span>${colorRow('accent')}</div>
      ${infoBox}
      ${field(tr('about'), `<textarea rows="3" maxlength="280" data-field="content.about">${esc(doc.content.about)}</textarea>`)}
      <div class="ed-field"><span>${esc(tr('links'))}</span>${links}
        ${doc.content.links.length < cat.plan.maxLinks ? `<button type="button" class="ed-btn" data-act="link">${esc(tr('addLink'))}</button>` : ''}
        <small class="ed-note">${esc(tr('badUrl'))}</small></div>`;
  }

  function renderPeople() {
    const full = doc.residents.length >= space.limits(doc).maxResidents;
    const placing = tool && tool.kind === 'resident';
    const cards = doc.residents.map((p, i) => {
      const colors = (key, list) => `<div class="ed-field"><span>${esc(tr(key))}</span>${colorControl(`person.${i}.${key}`, p[key], list, { brand: key === 'body' || key === 'eye' })}</div>`;
      const on = selected && selected.kind === 'resident' && selected.index === i;
      return `<details class="ed-person${on ? ' on' : ''}" data-pi="${i}"${openPeople.has(i) ? ' open' : ''}>
        <summary><i class="ed-dot" style="--c:${p.body}"></i><strong>${esc(p.name)}</strong><small>${esc(tr(p.kind))}${p.title ? ' · ' + esc(p.title) : ''}</small></summary>
        <div class="ed-person-body">
        <div class="ed-row">
          <button type="button" class="ed-chip-text${p.kind === 'agent' ? ' on' : ''}" data-act="pkind" data-i="${i}" data-v="agent">${esc(tr('agent'))}</button>
          <button type="button" class="ed-chip-text${p.kind === 'human' ? ' on' : ''}" data-act="pkind" data-i="${i}" data-v="human">${esc(tr('human'))}</button>
        </div>
        ${field(tr('personName'), `<input value="${esc(p.name)}" maxlength="18" data-person="${i}" data-part="name">`)}
        ${field(tr('personTitle'), `<input value="${esc(p.title)}" maxlength="30" data-person="${i}" data-part="title">`)}
        ${field(tr('personBio'), `<textarea rows="2" maxlength="160" data-person="${i}" data-part="bio">${esc(p.bio)}</textarea>`)}
        <div class="ed-field"><span>${esc(tr('lines'))}</span>
          ${[0, 1, 2].map((k) => `<input value="${esc(p.lines[k] || '')}" maxlength="40" data-person="${i}" data-part="line" data-k="${k}">`).join('')}
        </div>
        ${colors('body', cat.people.body)}
        ${p.kind === 'agent' ? colors('eye', cat.people.eye) : colors('skin', cat.people.skin) + colors('hair', cat.people.hair)}
        <div class="ed-row">
          <button type="button" class="ed-btn" data-act="prelocate" data-i="${i}">${esc(tr('relocate'))}</button>
          <button type="button" class="ed-btn ed-danger" data-act="premove" data-i="${i}">${esc(tr('remove'))}</button>
        </div>
        </div>
      </details>`;
    }).join('');
    return `
      ${placing ? `<p class="ed-hint">${esc(tr('placePerson'))}</p>` : ''}
      <div class="ed-row">
        <button type="button" class="ed-btn" data-act="padd" data-v="agent" ${full ? 'disabled' : ''}>${esc(tr('addAgent'))}</button>
        <button type="button" class="ed-btn" data-act="padd" data-v="human" ${full ? 'disabled' : ''}>${esc(tr('addHuman'))}</button>
      </div>
      ${cards || `<p class="ed-hint">${esc(tr('noPeople'))}</p>`}`;
  }

  function renderFoot() {
    const foot = panel.querySelector('.ed-foot');
    if (!foot) return;
    const pro = space.proUsage(doc), lim = space.limits(doc), z = cat.sizeOf(doc.size);
    const bar = (label, n, max) => `<div class="ed-cap"><span>${esc(label)} ${n}/${max}</span><i><b style="width:${Math.min(100, (n / max) * 100)}%"></b></i></div>`;
    foot.innerHTML = `
      <p class="ed-plan"><strong>${esc(nm(z))}</strong> · ${z.m2} m² · ${money(z.price)}${esc(tr('perMonth'))}</p>
      ${bar(tr('capItems'), doc.items.length, lim.maxItems)}
      ${bar(tr('capPeople'), doc.residents.length, lim.maxResidents)}
      ${pro ? `<p class="ed-note"><span class="ed-pro">${tr('pro')}</span> ${esc(tr('proNote').replace('{n}', pro))}</p>` : ''}
      <div class="ed-foot-row">
        <p class="ed-status ${message && message.bad ? 'bad' : ''}">${esc(message ? message.text : dirty ? tr('unsaved') : tr('localNote'))}</p>
        <button type="button" class="ed-btn ed-danger ed-reset" data-act="reset">${esc(tr('reset'))}</button>
      </div>`;
    // El botón dice si lo que se ve ya está guardado.
    const sb = panel.querySelector('[data-act=save]');
    if (sb) {
      const done = !dirty && !!saved;
      sb.textContent = done ? '✓ ' + tr('saved') : tr('save');
      sb.classList.toggle('ed-done', done);
    }
  }

  // ————————————————————————————————— Acciones del panel
  panel.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act],[data-tab],[data-cat]');
    if (!el) return;
    if (el.dataset.tab) { tab = el.dataset.tab; tool = null; render(); return; }
    if (el.dataset.cat) { category = el.dataset.cat; render(); return; }
    const act = el.dataset.act, v = el.dataset.v, i = Number(el.dataset.i);
    const sel = selected && selected.kind === 'item' ? doc.items[selected.index] : null;
    switch (act) {
      case 'close': return closeEditor();
      case 'undo': return undo();
      case 'redo': return redo();
      case 'save': return save();
      case 'preview': return startPreview();
      case 'export': return exportJson();
      case 'import': return fileInput.click();
      case 'clear':
        if (!confirm(tr('clearConfirm'))) return;
        doc = Object.assign(space.empty(ROOM), { size: doc.size }); // vaciar no cambia el tamaño
        selected = tool = null;
        return commit();
      case 'reset':
        if (!confirm(tr('resetConfirm'))) return;
        return resetAll();
      case 'restore':
        if (!confirm(tr('restoreConfirm'))) return;
        space.clear(ROOM);
        saved = null;
        dirty = false;
        return closeEditor(true);
      case 'pick': {
        if (doc.items.length >= space.limits(doc).maxItems) return flash(tr('full'), true);
        const def = cat.byType[el.dataset.type];
        tool = tool && tool.type === def.type ? null : { kind: 'item', type: def.type, variant: def.variants && def.variants[0] };
        selected = null;
        return render();
      }
      case 'variant': sel.variant = v; return commit();
      case 'size': return setSize(v);
      case 'setcolor': setColor(el.dataset.path, v); return commit();
      case 'addinfo': return addInfo();
      case 'move': tool = { kind: 'move', ref: sel }; return render();
      case 'duplicate':
        if (doc.items.length >= space.limits(doc).maxItems) return flash(tr('full'), true);
        tool = { kind: 'item', type: sel.type, variant: sel.variant, color: sel.color };
        selected = null;
        return render();
      case 'remove': doc.items.splice(selected.index, 1); selected = null; return commit();
      case 'template': {
        if (!confirm(tr('templateConfirm'))) return;
        doc = space.sanitize(space.templates.find((t) => t.id === v).doc, ROOM);
        selected = tool = null;
        return commit();
      }
      case 'floor': doc.surfaces.floor = v; return commit();
      case 'walls': doc.surfaces.walls = v; return commit();
      case 'mode': doc.mode = v; return commit();
      case 'link': doc.content.links.push({ label: '', url: '' }); return render();
      case 'unlink': doc.content.links.splice(i, 1); return commit();
      case 'padd': {
        const kind = v;
        tool = {
          kind: 'resident',
          data: {
            kind, name: kind === 'agent' ? 'Agent' : 'Alex', title: '', bio: '', lines: [],
            body: cat.people.body[doc.residents.length % cat.people.body.length],
            eye: cat.people.eye[0], skin: cat.people.skin[1], hair: cat.people.hair[0], x: 0, y: 0,
          },
        };
        return render();
      }
      case 'pkind': doc.residents[i].kind = v; return commit();
      case 'prelocate': tool = { kind: 'move', ref: doc.residents[i] }; selected = { kind: 'resident', index: i }; return render();
      case 'premove': {
        doc.residents.splice(i, 1);
        const was = [...openPeople];
        openPeople.clear();
        was.forEach((k) => { if (k !== i) openPeople.add(k > i ? k - 1 : k); });
        selected = null;
        return commit();
      }
    }
  });

  // Cambiar de tamaño: lo que quede fuera (o pase el límite) se quita, avisando antes.
  function setSize(id) {
    if (id === doc.size) return;
    const next = space.sanitize(Object.assign(cleanDoc(), { size: id }), ROOM);
    const lost = doc.items.length + doc.residents.length - next.items.length - next.residents.length;
    if (lost > 0 && !confirm(fill('shrinkConfirm', { n: lost }))) return;
    doc.size = id;
    doc.items = next.items;
    doc.residents = next.residents;
    selected = tool = null;
    openPeople.clear();
    commit();
    flash(fill('sizeChanged', { m: cat.sizeOf(id).m2 }));
  }

  // Borra todo (también lo guardado) y deja el editor abierto con una oficina en blanco.
  function resetAll() {
    space.clear(ROOM);
    saved = null;
    doc = space.empty(ROOM);
    history = [JSON.stringify(doc)];
    hIndex = 0;
    dirty = false;
    selected = tool = drag = null;
    openPeople.clear();
    tab = 'space';
    space.apply(ROOM, doc);
    render();
    flash(tr('resetDone'));
  }

  // Abrir y cerrar tarjetas de personas (el evento "toggle" no burbujea).
  panel.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.dataset || d.dataset.pi == null) return;
    if (d.open) openPeople.add(Number(d.dataset.pi)); else openPeople.delete(Number(d.dataset.pi));
  }, true);

  // Pone el bloque "?" en el primer lugar libre cerca de la entrada.
  function addInfo() {
    if (doc.items.length >= space.limits(doc).maxItems) return flash(tr('full'), true);
    const door = world.doorEntries(ROOM)[0] || { x: 0, y: room.h - 1 };
    const spots = [];
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) spots.push({ x, y, d: Math.abs(x - door.x) + Math.abs(y - door.y) });
    spots.sort((a, b) => (a.d < 2) - (b.d < 2) || a.d - b.d);
    const item = { type: 'info' };
    const spot = spots.find((p) => !space.canPlace(doc, ROOM, item, p.x, p.y));
    if (!spot) return flash(tr('noRoom'), true);
    doc.items.push({ type: 'info', x: spot.x, y: spot.y });
    selected = { kind: 'item', index: doc.items.length - 1 };
    commit();
    flash(tr('infoAdded'));
  }

  // Textos: el mundo se actualiza mientras se escribe; el historial guarda al terminar.
  let typingTimer = null;
  function onTextInput(e) {
    const el = e.target;
    if (el.dataset.color) {
      // Mientras se arrastra en el selector de color, el mundo se actualiza sin redibujar el panel.
      setColor(el.dataset.color, el.value);
      const hex = el.parentNode.querySelector('[data-hex]');
      if (hex) hex.value = el.value;
    } else if (el.dataset.hex) {
      if (!TGL.color.isHex(el.value)) return;
      setColor(el.dataset.hex, el.value.toLowerCase());
      const pick = el.parentNode.querySelector('[data-color]');
      if (pick) pick.value = el.value.toLowerCase();
    } else if (el.dataset.field) {
      const [a, b] = el.dataset.field.split('.');
      doc[a][b] = el.value;
    } else if (el.dataset.person != null) {
      const p = doc.residents[Number(el.dataset.person)];
      if (el.dataset.part === 'line') {
        p.lines[Number(el.dataset.k)] = el.value;
      } else p[el.dataset.part] = el.value;
      if (el.dataset.part === 'name') {
        const s = panel.querySelector(`[data-pi="${el.dataset.person}"] summary strong`);
        if (s) s.textContent = el.value;
      }
    } else if (el.dataset.link != null) {
      doc.content.links[Number(el.dataset.link)][el.dataset.part] = el.value;
      el.classList.toggle('bad', el.dataset.part === 'url' && !!el.value && !isUrl(el.value));
    } else return;
    dirty = true;
    renderFoot();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => space.apply(ROOM, cleanDoc()), el.dataset.color ? 60 : 200);
  }
  panel.addEventListener('input', onTextInput);
  panel.addEventListener('change', (e) => {
    if (!e.target.matches('input, textarea')) return;
    // Al soltar un color: queda en el historial y el panel se redibuja (swatches, miniaturas).
    if (e.target.dataset.color || e.target.dataset.hex) {
      if (e.target.dataset.hex && !TGL.color.isHex(e.target.value)) return render();
      clearTimeout(typingTimer);
      return commit();
    }
    history = history.slice(0, hIndex + 1);
    history.push(JSON.stringify(doc));
    hIndex = history.length - 1;
    space.apply(ROOM, cleanDoc());
    const tools = panel.querySelector('.ed-tools');
    if (tools) {
      tools.querySelector('[data-act=undo]').disabled = hIndex <= 0;
      tools.querySelector('[data-act=redo]').disabled = true;
    }
  });

  // Lo que se muestra en el edificio: sin líneas vacías ni links incompletos.
  function cleanDoc() {
    const d = clone(doc);
    d.residents.forEach((p) => { p.lines = p.lines.filter(Boolean); });
    d.content.links = d.content.links.filter((l) => isUrl(l.url));
    return d;
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(cleanDoc(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'oficina-' + (room.office || ROOM) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    f.text().then((txt) => {
      doc = space.sanitize(JSON.parse(txt), ROOM);
      selected = tool = null;
      commit();
    }).catch(() => flash(tr('importError'), true)).finally(() => { fileInput.value = ''; });
  });

  // ————————————————————————————————— Interacción sobre la oficina
  const canvas = document.querySelector('#office');
  const tileAt = (e) => {
    const [wx, wy] = game.worldFromEvent(e);
    return { x: Math.floor(wx / T) - room.x, y: Math.floor(wy / T) - room.y };
  };
  const inside = (t) => {
    const a = space.area(doc, ROOM);
    return t.x >= a.x0 && t.y >= 0 && t.x < a.x0 + a.w && t.y < room.h;
  };
  const active = () => isOpen && !previewing;

  // Lo que hay en una casilla (personas primero, luego objetos de arriba hacia abajo).
  function hitTest(t) {
    for (let i = doc.residents.length - 1; i >= 0; i--) {
      const p = doc.residents[i];
      if (p.x === t.x && (p.y === t.y || p.y - 1 === t.y)) return { kind: 'resident', index: i };
    }
    for (let i = doc.items.length - 1; i >= 0; i--) {
      const it = doc.items[i], def = cat.byType[it.type];
      if (t.x >= it.x && t.x < it.x + def.w && t.y >= it.y - (def.floor ? 0 : 1) && t.y < it.y + def.h) return { kind: 'item', index: i };
    }
    return null;
  }

  // Coloca lo que haya en la herramienta en la casilla t.
  function placeAt(t) {
    if (tool.kind === 'item') {
      const item = { type: tool.type, x: t.x, y: t.y };
      if (tool.variant) item.variant = tool.variant;
      if (tool.color) item.color = tool.color;
      const why = space.canPlace(doc, ROOM, item, t.x, t.y);
      if (why) return flash(tr(why), true);
      doc.items.push(item);
      if (doc.items.length >= space.limits(doc).maxItems) tool = null;
      return commit();
    }
    if (tool.kind === 'resident') {
      const p = Object.assign({}, tool.data, { x: t.x, y: t.y });
      const why = space.canPlace(doc, ROOM, p, t.x, t.y);
      if (why) return flash(tr(why), true);
      doc.residents.push(p);
      selected = { kind: 'resident', index: doc.residents.length - 1 };
      openPeople.add(selected.index);
      reveal = `[data-pi="${selected.index}"]`;
      tool = null;
      tab = 'people';
      return commit();
    }
    if (tool.kind === 'move') return moveTo(tool.ref, t.x, t.y);
  }

  function moveTo(ref, x, y) {
    const why = space.canPlace(doc, ROOM, ref, x, y, ref);
    if (why) { flash(tr(why), true); return false; }
    ref.x = x;
    ref.y = y;
    tool = null;
    commit();
    return true;
  }

  function stop(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  canvas.addEventListener('pointermove', (e) => {
    if (!active()) return;
    hover = tileAt(e);
    if (drag) {
      const nx = hover.x - drag.dx, ny = hover.y - drag.dy;
      if (nx !== drag.x || ny !== drag.y) drag.moved = true;
      drag.x = nx;
      drag.y = ny;
    }
    canvas.style.cursor = tool ? 'crosshair' : hitTest(hover) ? 'grab' : 'default';
    stop(e);
  }, true);

  canvas.addEventListener('pointerdown', (e) => {
    if (!active()) return;
    stop(e);
    const t = tileAt(e);
    hover = t;
    if (tool || !inside(t)) return;
    const hit = hitTest(t);
    if (!hit) { if (selected) { selected = null; render(); } return; }
    const ref = hit.kind === 'item' ? doc.items[hit.index] : doc.residents[hit.index];
    drag = { ref, dx: t.x - ref.x, dy: t.y - ref.y, x: ref.x, y: ref.y, moved: false, hit };
    canvas.setPointerCapture(e.pointerId);
  }, true);

  canvas.addEventListener('pointerup', (e) => {
    if (!active()) return;
    stop(e);
    const t = tileAt(e);
    if (drag) {
      const d = drag;
      drag = null;
      if (d.moved && inside(t)) {
        selected = d.hit;
        if (!moveTo(d.ref, d.x, d.y)) render();
      } else {
        selected = d.hit;
        if (d.hit.kind === 'resident') {
          tab = 'people';
          openPeople.add(d.hit.index);
          reveal = `[data-pi="${d.hit.index}"]`;
        } else {
          tab = 'items';
          reveal = '.ed-inspector';
        }
        render();
      }
      return;
    }
    if (tool && inside(t)) placeAt(t);
  }, true);

  canvas.addEventListener('click', (e) => { if (active()) stop(e); }, true);
  canvas.addEventListener('pointercancel', () => { drag = null; }, true);

  window.addEventListener('keydown', (e) => {
    if (!active()) return;
    const typing = e.target.matches && e.target.matches('input, textarea');
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); return e.shiftKey ? redo() : undo(); }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); return save(); }
    if (typing) return;
    if (e.key === 'Escape') {
      if (tool || selected) { tool = selected = null; render(); } else closeEditor();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      e.preventDefault();
      if (selected.kind === 'item') doc.items.splice(selected.index, 1);
      else doc.residents.splice(selected.index, 1);
      selected = null;
      commit();
    }
  });

  // Cerrar la pestaña con cambios sin guardar pide confirmación.
  window.addEventListener('beforeunload', (e) => {
    if (isOpen && dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  window.addEventListener('langchange', () => {
    labelButtons();
    if (isOpen && !previewing) render();
  });

  // ————————————————————————————————— Dibujo sobre la oficina
  function drawOverlay(ctx, t) {
    const ox = room.x * T, oy = room.y * T;
    ctx.save();
    // cuadrícula, solo en lo arrendado
    const a = space.area(doc, ROOM), ax = ox + a.x0 * T;
    ctx.fillStyle = 'rgba(77,140,255,.22)';
    for (let x = 0; x <= a.w; x++) ctx.fillRect(ax + x * T, oy, 0.5, room.h * T);
    for (let y = 0; y <= room.h; y++) ctx.fillRect(ax, oy + y * T, a.w * T, 0.5);
    ctx.strokeStyle = 'rgba(77,140,255,.8)';
    ctx.strokeRect(ax + 0.5, oy + 0.5, a.w * T - 1, room.h * T - 1);
    // entrada: siempre libre
    ctx.fillStyle = 'rgba(224,74,74,.22)';
    for (const en of world.doorEntries(ROOM)) ctx.fillRect(ox + en.x * T, oy + en.y * T, T, T);

    const ghost = (thing, x, y) => {
      const f = space.footprint(thing);
      const why = space.canPlace(doc, ROOM, thing, x, y, tool && tool.kind === 'move' ? thing : drag ? drag.ref : null);
      ctx.fillStyle = why ? 'rgba(224,74,74,.3)' : 'rgba(52,199,89,.28)';
      ctx.fillRect(ox + x * T, oy + y * T, f.w * T, f.h * T);
      ctx.globalAlpha = 0.75;
      if (thing.kind === 'agent' || thing.kind === 'human') {
        TGL.drawCharacter(ctx, {
          kind: thing.kind, role: 'tenant', body: thing.body, eye: thing.eye, dir: 'down', frame: 0,
          look: { skin: thing.skin, hair: thing.hair, hairStyle: 'short', body: thing.body, legs: '#262b36' },
          px: ox + (x + 0.5) * T, py: oy + y * T + 12,
        }, t);
      } else {
        const sp = sprite(cat.byType[thing.type], thing);
        ctx.drawImage(sp.canvas, ox + x * T - (sp.ox || 0), oy + y * T - sp.top);
      }
      ctx.globalAlpha = 1;
    };

    if (drag && drag.moved) ghost(drag.ref, drag.x, drag.y);
    else if (tool && hover && inside(hover)) {
      if (tool.kind === 'item') ghost({ type: tool.type, variant: tool.variant }, hover.x, hover.y);
      else if (tool.kind === 'resident') ghost(tool.data, hover.x, hover.y);
      else if (tool.kind === 'move') ghost(tool.ref, hover.x, hover.y);
    } else if (hover && inside(hover) && !tool) {
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(ox + hover.x * T, oy + hover.y * T, T, T);
    }

    // selección
    if (selected) {
      const ref = selected.kind === 'item' ? doc.items[selected.index] : doc.residents[selected.index];
      if (ref) {
        const f = space.footprint(ref), top = 1; // incluye la casilla de arriba: los sprites sobresalen
        ctx.strokeStyle = '#ffc367';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.lineDashOffset = -t * 8;
        ctx.strokeRect(ox + ref.x * T + 0.5, oy + (ref.y - top) * T + 0.5, f.w * T - 1, (f.h + top) * T - 1);
        ctx.setLineDash([]);
      }
    }
    ctx.restore();
  }
})();
