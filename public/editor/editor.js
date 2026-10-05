// Editor de espacios (beta): oficinas en la zona de arriendo y puestos en el coworking.
// Un navegador puede tener varios; por ahora se guardan solo aquí. Se enciende y apaga desde
// js/features.js.

(function () {
  const cat = TGL.catalog, space = TGL.space, world = TGL.world, game = TGL.game, T = world.T, zone = world.zone;
  let ROOM = null, room = null; // sala del espacio que se está editando

  const L = {
    es: {
      open: 'Mi espacio', create: 'Arrendar un espacio', customizeHere: 'Personalizar {n}',
      mySpacesN: 'Mis espacios · {n}', go: 'Ir', account: 'Tu cuenta', emailLabel: 'Correo de tu cuenta',
      emailHint: 'Todos tus espacios quedan bajo este correo. Por ahora se guarda solo en este navegador.',
      badEmail: 'Ese correo no parece válido.', customizeTip: 'Para personalizar un espacio, entra en él: aparece el botón "Personalizar".',
      officeSize: 'Oficina {s}', noFitNow: 'No cabe en ningún lugar libre ahora', brandColors: 'Colores de tu marca', wStep: 'Paso {n} de {t}', next: 'Siguiente →', prev: '← Atrás', finish: 'Terminar',
      w1Title: '¿Qué quieres arrendar?', w1Hint: 'Puedes cambiarlo después.',
      deskCard: 'Un puesto en el coworking', deskCardNote: 'Un escritorio fijo en la sala compartida: tu avatar, un agente y tu tarjeta con links.',
      officeCard: 'Una oficina propia', officeCardNote: 'Una sala con tus muros, tu letrero, tus muebles y tu equipo.',
      from: 'desde {p}/mes',
      w2Title: '¿De qué tamaño?', w2Hint: 'Todas tienen 8 m de fondo. Pagas por metro cuadrado: con más metros caben más personas y más objetos.',
      people: '{n} personas o agentes',
      w3Title: '¿Dónde?', w3Office: 'Ya la ubicamos en un lugar libre. Toca el plano (o el edificio) para moverla, o usa las flechas. Solo te dejamos elegir lugares con pasillo.',
      w3Desk: 'Toca un puesto verde del plano (o del edificio) para elegirlo.', move: 'Mover',
      w4Title: 'Confirma', w4Hint: 'Por ahora es una prueba: no se cobra nada y se guarda solo en este navegador.',
      sumWhat: 'Qué', sumSize: 'Tamaño', sumWhere: 'Dónde', sumPrice: 'Precio', perMonthLong: '{p} al mes',
      rent: 'Arrendar · {p}/mes', applyChange: 'Guardar el cambio', rented: '¡Listo, es tuyo! Ahora ponle tu marca.',
      changePlace: 'Cambiar tamaño o lugar', stepCount: '{n} de {t}',
      sBrand: 'Marca', sStyle: 'Estilo', sItems: 'Muebles', sPeople: 'Personas', title: 'Editor de oficina', beta: 'BETA',
      homeTitle: 'Zona de arriendo', homeIntro: 'Toca la planta libre del plano para construir ahí una oficina del ancho que quieras, o toca un puesto verde del coworking.',
      newOffice: '+ Oficina', newDesk: '+ Puesto en el coworking', desksFree: '{n} libres', mySpaces: 'Mis espacios', none: 'Todavía no arriendas nada.',
      edit: 'Editar', total: '{n} espacios · {p}/mes', officeN: 'Oficina {n}', deskN: 'Puesto {n}', home: 'Mis espacios',
      noSpace: 'No queda lugar para una oficina de ese ancho ahí.', noDesk: 'No quedan puestos libres.', noWidth: 'Una oficina de {w} m no cabe en ningún lugar libre.',
      widthTitle: 'Ancho', presetHint: 'De 8 a 24 m, de a metro. Atajos:', capacity: 'Caben {p} personas o agentes y {i} objetos.',
      rowLabel: 'Fila {r}', rowA: 'Fila A · arriba', rowB: 'Fila B · abajo', deskHint: 'Toca otro puesto verde del plano para cambiarte.',
      deskColor: 'Color del escritorio', upgrade: 'Mudarse a una oficina →', upgradeNote: 'Te llevas tu marca, tu descripción, tus links y tu gente.',
      upgradeConfirm: '¿Pasar de este puesto a una oficina? El puesto queda libre al guardar.', upgradeDone: 'Ahora es una oficina. Ajusta su ancho y su lugar.',
      legendMine: 'Tu espacio', legendCowork: 'Coworking', legendDesk: 'Puesto libre', floorSoon: 'Piso completo (768 m²): próximamente.',
      deleteAll: 'Borrar todo', deleteAllConfirm: '¿Borrar todos tus espacios de este navegador? No se puede deshacer.', you: 'Tú',
      peopleFullDesk: 'Un puesto tiene lugar para {n}: tú y un agente. En una oficina caben más.',
      peopleFullOffice: 'Con {m} m² caben {n} personas o agentes, y ya están todos. Si agrandas la oficina caben más.',
      tSpace: 'Espacio', tItems: 'Objetos', tStyle: 'Estilo', tBrand: 'Marca', tPeople: 'Personas',
      spaceIntro: 'Lo que se arrienda es espacio: 1 casilla = 1 m². Con más metros caben más personas y más objetos. Lo demás (colores, marca, links, plantillas) es igual en todos los tamaños.',
      perMonth: '/mes', soon: 'Próximamente', upTo: 'Hasta {p} personas · {i} objetos', notHere: 'No cabe en esta sala',
      priceNote: 'Precios de ejemplo: US$ {p} por m² al mes. Lo PRO son extras opcionales.',
      reset: '↺ Empezar de cero', resetConfirm: '¿Vaciar este espacio y empezar de cero? Su tamaño y su lugar se mantienen.',
      resetDone: 'Listo: oficina en blanco. Empieza eligiendo el tamaño.',
      peopleFull: 'La {s} tiene espacio para {n} personas o agentes, y ya están todos.',
      peopleUp: 'Con una {s} caben {n}.', seeSizes: 'Ver tamaños',
      where: 'Ubicación en el piso', whereHint: 'Toca el plano para llevar la oficina a cualquier lugar libre de las dos filas, o usa las flechas. Solo se aceptan lugares que cumplen las normas.',
      slotAt: 'Fila {r} · desde el metro {m}', legendOffice: 'Tu oficina', legendHall: 'Pasillo (del edificio)', legendFree: 'Planta libre',
      rulesTitle: 'Normas del piso',
      rules: ['Los pasillos son del edificio: no se venden ni se cierran.',
        'Toda oficina tiene su puerta sobre el pasillo de abajo de su fila.',
        'Entre una oficina y el espacio libre (u otra oficina) siempre hay un pasillo de 2 m que cruza la fila hasta el pasillo: así siempre se puede llegar a la oficina de al lado.',
        'Al lado de una oficina quedan 0 m o al menos 8 m libres (una oficina S): no quedan retazos.',
        'Una oficina mide de 8 a 24 m de ancho y 8 de fondo. Para más espacio: otra oficina o el piso completo.'],
      shrinkConfirm: '{n} cosas quedan fuera del nuevo tamaño y se quitarán. ¿Seguir?', sizeChanged: 'Ahora tu oficina mide {m} m²',
      undo: 'Deshacer', redo: 'Rehacer', try: 'Probar', save: 'Guardar', saved: 'Guardado', unsaved: 'Cambios sin guardar',
      more: 'Más opciones', export: 'Exportar JSON', import: 'Importar JSON', clearRoom: 'Vaciar este espacio',
      restore: 'Dejar de arrendar este espacio', close: 'Cerrar', back: '✎ Volver al editor',
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
      restoreConfirm: '¿Dejar de arrendar este espacio? Se borra de este navegador.',
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
      open: 'My space', create: 'Rent a space', customizeHere: 'Customize {n}',
      mySpacesN: 'My spaces · {n}', go: 'Go', account: 'Your account', emailLabel: 'Your account email',
      emailHint: 'All your spaces live under this email. For now it is saved only in this browser.',
      badEmail: 'That email does not look valid.', customizeTip: 'To customize a space, walk into it: a "Customize" button shows up.',
      officeSize: 'Office {s}', noFitNow: 'Does not fit in any free spot right now', brandColors: 'Your brand colors', wStep: 'Step {n} of {t}', next: 'Next →', prev: '← Back', finish: 'Finish',
      w1Title: 'What do you want to rent?', w1Hint: 'You can change it later.',
      deskCard: 'A coworking desk', deskCardNote: 'A fixed desk in the shared room: your avatar, one agent and your card with links.',
      officeCard: 'Your own office', officeCardNote: 'A room with your walls, your sign, your furniture and your team.',
      from: 'from {p}/mo',
      w2Title: 'How big?', w2Hint: 'All are 8 m deep. You pay per square meter: more meters fit more people and more objects.',
      people: '{n} people or agents',
      w3Title: 'Where?', w3Office: 'We already put it in a free spot. Tap the plan (or the building) to move it, or use the arrows. Only spots with a hallway are allowed.',
      w3Desk: 'Tap a green desk on the plan (or in the building) to pick it.', move: 'Move',
      w4Title: 'Confirm', w4Hint: 'This is a test for now: nothing is charged and it is saved only in this browser.',
      sumWhat: 'What', sumSize: 'Size', sumWhere: 'Where', sumPrice: 'Price', perMonthLong: '{p} per month',
      rent: 'Rent · {p}/mo', applyChange: 'Save the change', rented: 'Done, it is yours! Now add your brand.',
      changePlace: 'Change size or location', stepCount: '{n} of {t}',
      sBrand: 'Brand', sStyle: 'Style', sItems: 'Furniture', sPeople: 'People', title: 'Office editor', beta: 'BETA',
      homeTitle: 'Rental area', homeIntro: 'Tap the open floor on the plan to build an office there, as wide as you like, or tap a green desk in the coworking.',
      newOffice: '+ Office', newDesk: '+ Coworking desk', desksFree: '{n} free', mySpaces: 'My spaces', none: 'You are not renting anything yet.',
      edit: 'Edit', total: '{n} spaces · {p}/mo', officeN: 'Office {n}', deskN: 'Desk {n}', home: 'My spaces',
      noSpace: 'There is no room for an office that wide there.', noDesk: 'There are no free desks left.', noWidth: 'A {w} m office does not fit in any free spot.',
      widthTitle: 'Width', presetHint: 'From 8 to 24 m, one meter at a time. Shortcuts:', capacity: 'Fits {p} people or agents and {i} objects.',
      rowLabel: 'Row {r}', rowA: 'Row A · top', rowB: 'Row B · bottom', deskHint: 'Tap another green desk on the plan to switch.',
      deskColor: 'Desk color', upgrade: 'Move to an office →', upgradeNote: 'You keep your brand, description, links and people.',
      upgradeConfirm: 'Turn this desk into an office? The desk is freed when you save.', upgradeDone: 'It is an office now. Adjust its width and location.',
      legendMine: 'Your space', legendCowork: 'Coworking', legendDesk: 'Free desk', floorSoon: 'Whole floor (768 m²): coming soon.',
      deleteAll: 'Delete all', deleteAllConfirm: 'Delete all your spaces from this browser? This cannot be undone.', you: 'You',
      peopleFullDesk: 'A desk has room for {n}: you and one agent. An office fits more.',
      peopleFullOffice: 'With {m} m² there is room for {n} people or agents, and they are all here. A wider office fits more.',
      tSpace: 'Space', tItems: 'Objects', tStyle: 'Style', tBrand: 'Brand', tPeople: 'People',
      spaceIntro: 'What you rent is space: 1 tile = 1 m². More meters fit more people and more objects. Everything else (colors, brand, links, templates) is the same at every size.',
      perMonth: '/mo', soon: 'Coming soon', upTo: 'Up to {p} people · {i} objects', notHere: 'Does not fit in this room',
      priceNote: 'Example prices: US$ {p} per m² per month. PRO items are optional extras.',
      reset: '↺ Start over', resetConfirm: 'Empty this space and start over? Its size and location stay.',
      resetDone: 'Done: blank office. Start by choosing the size.',
      peopleFull: 'The {s} has room for {n} people or agents, and they are all here.',
      peopleUp: 'An {s} fits {n}.', seeSizes: 'See sizes',
      where: 'Location on the floor', whereHint: 'Tap the plan to move the office to any free spot in either row, or use the arrows. Only spots that follow the floor rules are accepted.',
      slotAt: 'Row {r} · from meter {m}', legendOffice: 'Your office', legendHall: 'Hallway (building)', legendFree: 'Open floor',
      rulesTitle: 'Floor rules',
      rules: ['Hallways belong to the building: they are never sold or closed.',
        'Every office has its door on the hallway below its row.',
        'Between an office and free space (or another office) there is always a 2 m hallway across the row to the main hallway, so the office next door can always be reached.',
        'Next to an office there are either 0 m or at least 8 m free (an S office): no useless leftovers.',
        'An office is 8 to 24 m wide and 8 m deep. For more space: another office or the whole floor.'],
      shrinkConfirm: '{n} things fall outside the new size and will be removed. Continue?', sizeChanged: 'Your office is now {m} m²',
      undo: 'Undo', redo: 'Redo', try: 'Try it', save: 'Save', saved: 'Saved', unsaved: 'Unsaved changes',
      more: 'More options', export: 'Export JSON', import: 'Import JSON', clearRoom: 'Empty this space',
      restore: 'Stop renting this space', close: 'Close', back: '✎ Back to editor',
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
      restoreConfirm: 'Stop renting this space? It is deleted from this browser.',
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
  let saved = space.load();   // los espacios guardados en este navegador
  let view = 'edit';          // 'wizard' (arrendar, paso a paso) | 'edit' (personalizar)
  let doc = null;             // el espacio que se está editando
  let history = [], hIndex = -1;
  let tab = 'space', category = 'all';
  let tool = null;       // { kind: 'item', type, variant, color } | { kind: 'resident', data, index? } | { kind: 'move', ref }
  let selected = null;   // { kind: 'item' | 'resident', index }
  let hover = null;      // casilla relativa a la sala bajo el puntero
  let drag = null;       // { ref, startX, startY, dx, dy, moved }
  let message = null, messageTimer = null;
  let upgradedFrom = null;           // puesto que pasa a oficina (se libera al guardar)
  let lastTab = null, reveal = null; // para conservar el scroll del panel entre renders
  const openPeople = new Set();      // tarjetas de personas abiertas (índices)

  // ————————————————————————————————— DOM
  const btn = document.createElement('button');
  btn.id = 'btn-editor';
  btn.type = 'button';
  btn.className = 'panel ed-open';
  document.body.appendChild(btn);

  // Personalizar el espacio en el que estoy, y la lista de mis espacios (con "Ir").
  const here = document.createElement('button');
  here.type = 'button';
  here.className = 'panel ed-here';
  here.hidden = true;
  document.body.appendChild(here);
  const mineBtn = document.createElement('button');
  mineBtn.type = 'button';
  mineBtn.className = 'panel ed-mine-btn';
  mineBtn.hidden = true;
  document.body.appendChild(mineBtn);
  const minePanel = document.createElement('div');
  minePanel.className = 'panel ed-mine';
  minePanel.hidden = true;
  document.body.appendChild(minePanel);

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
    btn.innerHTML = '+ ' + esc(tr('create')) + ' <span class="ed-badge">' + tr('beta') + '</span>';
    mineBtn.textContent = fill('mySpacesN', { n: saved.length });
    mineBtn.hidden = isOpen || !saved.length;
    if (!saved.length) minePanel.hidden = true;
    backPill.textContent = tr('back');
    updateHere();
  }

  // ————————————————————————————————— Dónde estoy
  // Se personaliza solo el espacio en el que está el jugador: su oficina o junto a su puesto.
  const account = (() => { try { return JSON.parse(localStorage.getItem('tgl-account') || '{}'); } catch (e) { return {}; } })();
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  function spaceAtPlayer() {
    const p = game.playerTile(), q = world.roomAt(p.x, p.y);
    const office = q && saved.find((d) => d.kind === 'office' && d.id === q.id);
    if (office) return office;
    const cw = world.room('cowork');
    return saved.find((d) => {
      if (d.kind !== 'desk') return false;
      const k = zone.DESKS[d.desk], dx = cw.x + k.x, dy = cw.y + k.y;
      return p.x >= dx - 1 && p.x <= dx + 2 && p.y >= dy && p.y <= dy + 2;
    }) || null;
  }
  let hereId = null;
  function updateHere() {
    const d = isOpen ? null : spaceAtPlayer();
    const id = d ? d.id : null;
    here.hidden = !d;
    if (d && (id !== hereId || here.dataset.lang !== TGL.lang)) here.innerHTML = '✎ ' + esc(fill('customizeHere', { n: spaceName(d) }));
    here.dataset.lang = TGL.lang;
    hereId = id;
  }
  setInterval(updateHere, 250);
  here.addEventListener('click', () => {
    const d = spaceAtPlayer();
    if (!d) return;
    openPanel();
    editSpace(d);
  });

  // Ir a un espacio: el jugador aparece en la entrada, por dentro.
  function goTo(d) {
    if (d.kind === 'desk') {
      const cw = world.room('cowork'), k = zone.DESKS[d.desk];
      game.teleport(cw.x + k.x, cw.y + k.y + 2, 'up');
    } else {
      const q = world.room(d.id);
      game.teleport(q.x + Math.floor(q.w / 2) - 1, q.y + q.h - 1, 'up');
    }
    game.setFocus(null);
    updateHere();
  }
  function renderMine() {
    const total = saved.reduce((n, d) => n + space.price(d), 0);
    minePanel.innerHTML = `
      <div class="ed-mine-head"><strong>${esc(tr('mySpaces'))}</strong><small>${esc(fill('total', { n: saved.length, p: money(total) }))}</small></div>
      ${saved.map((d) => `<div class="ed-mine-row"><i style="--c:${d.identity.primary}"></i><span><strong>${esc(spaceName(d))}</strong><small>${esc(d.kind === 'desk' ? 'Coworking · ' + fill('deskN', { n: d.desk + 1 }) : fill('officeN', { n: d.number }) + ' · ' + space.m2(d) + ' m²')}</small></span><button type="button" class="ed-btn" data-go="${d.id}">${esc(tr('go'))}</button></div>`).join('')}
      <p class="ed-note">${esc(tr('customizeTip'))}</p>
      ${account.email ? `<p class="ed-note">${esc(tr('account'))}: <strong>${esc(account.email)}</strong></p>` : ''}`;
  }
  mineBtn.addEventListener('click', () => {
    minePanel.hidden = !minePanel.hidden;
    if (!minePanel.hidden) renderMine();
  });
  minePanel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    minePanel.hidden = true;
    goTo(saved.find((d) => d.id === b.dataset.go));
  });

  // ————————————————————————————————— Abrir y cerrar
  // Dos momentos: arrendar (un paso a paso: qué, tamaño, dónde, confirmar) y personalizar
  // (también por pasos: marca, estilo, muebles, personas). Cada persona arrienda un espacio.
  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
  const others = () => saved.filter((d) => d.id !== doc.id);
  const othersAfterSave = () => saved.filter((d) => d.id !== doc.id && d.id !== upgradedFrom);
  const spaceName = (d) => d.identity.name || (d.kind === 'desk' ? fill('deskN', { n: d.desk + 1 }) : fill('officeN', { n: d.number }));

  // Muestra en el edificio lo guardado o, mientras se arrienda o edita, el borrador.
  function show() {
    space.render(doc ? others().concat(cleanDoc()) : saved);
    ROOM = doc ? doc.id : null;
    room = doc ? world.room(doc.kind === 'desk' ? 'cowork' : doc.id) : null;
  }

  // La cámara: la zona de arriendo completa al elegir, o el espacio con algo de contexto.
  let lastFocus = '';
  const wholeZone = () => view === 'wizard' && wiz.step !== 'confirm';
  const focusKey = () => (room && !wholeZone() ? [view, room.x, room.y, room.w].join() : 'zone');
  const refocus = () => { if (isOpen && !previewing && focusKey() !== lastFocus) requestAnimationFrame(focusRoom); };
  function focusRoom() {
    const mobile = isMobile();
    let f = { x: 0, y: 0, w: MAP.w, h: MAP.h };
    if (room && !wholeZone()) {
      const w = Math.max(room.w + 4, 20);
      f = { x: Math.max(0, room.x + Math.floor(room.w / 2) - Math.floor(w / 2)), y: room.y - 2, w, h: room.h + 2 };
    }
    lastFocus = focusKey();
    game.setFocus(Object.assign(f, {
      padR: mobile ? 0 : panel.offsetWidth + 24,
      padB: mobile ? panel.offsetHeight : 0,
      padT: mobile ? 56 : 0,
    }));
  }

  function openPanel() {
    isOpen = true;
    previewing = false;
    document.body.classList.add('editing');
    panel.hidden = false;
    btn.hidden = true;
    minePanel.hidden = true;
    labelButtons();
    game.setFrozen(true);
    game.overlays.add(drawOverlay);
  }
  // El botón de arriba siempre es para arrendar un espacio nuevo.
  function openEditor() {
    openPanel();
    startWizard('new');
  }

  function closeEditor(force) {
    if (!force && view === 'edit' && dirty && !confirm(tr('leaveConfirm'))) return;
    isOpen = previewing = false;
    view = 'edit';
    doc = wiz = null;
    dirty = false;
    tool = selected = drag = null;
    show();
    document.body.classList.remove('editing');
    panel.hidden = true;
    backPill.hidden = true;
    btn.hidden = false;
    labelButtons();
    game.overlays.delete(drawOverlay);
    game.setFocus(null);
    game.setFrozen(false);
  }

  // ————————————————————————————————— Arrendar, paso a paso
  // wiz: { mode: 'new' | 'change' | 'upgrade', step, kind, back (el espacio antes del cambio) }
  let wiz = null;
  const STEPS = { new: { desk: ['kind', 'place', 'confirm'], office: ['kind', 'size', 'place', 'confirm'] }, change: { desk: ['place', 'confirm'], office: ['size', 'place', 'confirm'] } };
  const stepsOf = () => STEPS[wiz.mode === 'upgrade' ? 'change' : wiz.mode][wiz.kind];

  function startWizard(mode) {
    view = 'wizard';
    tool = selected = drag = null;
    const back = mode === 'new' ? null : clone(doc);
    wiz = { mode, kind: mode === 'upgrade' ? 'office' : back ? back.kind : null, back };
    wiz.step = mode === 'new' ? 'kind' : stepsOf()[0];
    doc = back ? clone(back) : null;
    if (mode === 'upgrade') draftOffice(clone(back).identity, 8);
    show();
    render();
    requestAnimationFrame(focusRoom);
  }
  // Borrador de oficina de ancho w en el primer lugar libre (o el más chico que quepa).
  // Punto de referencia para ubicar el borrador: si es nueva, donde está el jugador; si se
  // cambia el tamaño de una que ya existe, donde está la oficina.
  function anchor(d) {
    if (d.x != null && wiz.mode !== 'new') { const r = zone.ROWS.find((q) => q.id === d.row); return { x: d.x + d.w / 2, y: r.y + r.h / 2 }; }
    const p = game.playerTile();
    return { x: p.x, y: p.y };
  }
  // Distancia de un punto a una fila (a su tramo más cercano).
  function rowDist(r, pt) {
    const dy = pt.y < r.y ? r.y - pt.y : pt.y >= r.y + r.h ? pt.y - (r.y + r.h - 1) : 0;
    const dx = Math.min(...r.bays.map((b) => (pt.x < b.L ? b.L - pt.x : pt.x > b.R ? pt.x - b.R : 0)));
    return dx + dy * 2;
  }
  // El lugar válido más cercano al punto: primero la fila más cercana, después las demás.
  function nearestPlace(list, d, w, pt) {
    const rows = zone.ROWS.slice().sort((a, b) => rowDist(a, pt) - rowDist(b, pt));
    for (const r of rows) {
      const ok = space.startsFor(list, d, r.id, w), want = pt.x - w / 2;
      if (ok.length) return { row: r.id, x: ok.reduce((best, s) => (Math.abs(s - want) < Math.abs(best - want) ? s : best), ok[0]) };
    }
    return null;
  }
  function draftOffice(identity, w) {
    const d = doc && doc.kind === 'office' ? doc : Object.assign(space.empty('office'), wiz.back && wiz.mode === 'change' ? { id: wiz.back.id } : {});
    const list = saved.filter((o) => !wiz.back || o.id !== wiz.back.id);
    const place = nearestPlace(list, d, w, anchor(d));
    if (!place) return false;
    const rowBefore = d.x != null ? d.row : null;
    Object.assign(d, place, { w });
    if (!d.number || place.row !== rowBefore) d.number = space.numberFor(list, d, place.row);
    if (identity) d.identity = identity;
    doc = d;
    return true;
  }
  function draftDesk() {
    const list = saved.filter((o) => !wiz.back || o.id !== wiz.back.id);
    const free = space.freeDesks(list);
    if (!free.length) return false;
    const d = Object.assign(space.empty('desk'), wiz.back && wiz.back.kind === 'desk' ? { id: wiz.back.id } : {});
    // el puesto libre más cercano al jugador
    const p = game.playerTile(), cw = world.room('cowork');
    const dist = (n) => Math.abs(cw.x + zone.DESKS[n].x + 1 - p.x) + Math.abs(cw.y + zone.DESKS[n].y + 1 - p.y);
    d.desk = free.reduce((best, n) => (dist(n) < dist(best) ? n : best), free[0]);
    d.residents = [{ kind: 'human', name: tr('you'), title: '', bio: '', lines: [], x: 0, y: 0, body: cat.people.body[0], eye: cat.people.eye[0], skin: cat.people.skin[1], hair: cat.people.hair[0] }];
    doc = d;
    return true;
  }
  function wizGo(dir) {
    const steps = stepsOf(), i = steps.indexOf(wiz.step) + dir;
    if (i < 0) return;
    if (i >= steps.length) return confirmRent();
    wiz.step = steps[i];
    show();
    render();
    refocus();
  }
  function chooseKind(kind) {
    wiz.kind = kind;
    doc = null;
    // una oficina empieza con el ancho más chico que quepa en algún lugar
    const ok = kind === 'desk' ? draftDesk() : officeWidths().some((w) => draftOffice(null, w));
    if (!ok) return flash(tr(kind === 'desk' ? 'noDesk' : 'noSpace'), true);
    wizGo(1);
  }
  function chooseSize(w) {
    if (!draftOffice(null, w)) return flash(fill('noWidth', { w }), true);
    show();
    render();
  }

  // Confirmar: lo nuevo se guarda tal cual; un cambio de tamaño o lugar conserva todo lo
  // personalizado que todavía quepa.
  function confirmRent() {
    let next = cleanDoc();
    if (wiz.back) {
      const keep = { id: next.id, kind: next.kind, w: next.w, row: next.row, x: next.x, number: next.number, desk: next.desk };
      const base = clone(wiz.back);
      if (wiz.mode === 'upgrade') base.residents = base.residents.map((p, i) => Object.assign(p, { x: 1 + i * 2, y: 2 }));
      next = space.sanitize(Object.assign(base, keep));
      const lost = wiz.back.items.length + wiz.back.residents.length - next.items.length - next.residents.length;
      if (lost > 0 && !confirm(fill('shrinkConfirm', { n: lost }))) return;
    }
    if (wiz.mode !== 'change' && next.kind === 'office' && !next.items.some((it) => it.type === 'info')) {
      // el bloque "?" va de una, cerca de la puerta: así la descripción y los links se ven
      const a = space.area(next), door = space.entriesOf(a)[0];
      const spots = [];
      for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) spots.push({ x, y, d: Math.abs(x - door.x) + Math.abs(y - door.y) });
      spots.sort((p, q) => (p.d < 2) - (q.d < 2) || p.d - q.d);
      const spot = spots.find((p) => !space.canPlace(next, { type: 'info' }, p.x, p.y));
      if (spot) next.items.push({ type: 'info', x: spot.x, y: spot.y });
    }
    const email = panel.querySelector('[data-email]');
    if (email && email.value && !isEmail(email.value)) return flash(tr('badEmail'), true);
    if (email && email.value) {
      account.email = email.value.trim();
      try { localStorage.setItem('tgl-account', JSON.stringify(account)); } catch (e) { /* sin guardado */ }
    }
    const list = saved.filter((d) => d.id !== next.id && (!wiz.back || d.id !== wiz.back.id)).concat(next);
    if (!space.save(list)) return flash(tr('saveError'), true);
    saved = list;
    const isNew = wiz.mode === 'new';
    wiz = null;
    editSpace(next);
    goTo(next); // se personaliza estando ahí
    requestAnimationFrame(focusRoom);
    if (isNew) flash(tr('rented'));
  }

  // ————————————————————————————————— Personalizar, por pasos
  const editSteps = () => (doc.kind === 'desk' ? ['brand', 'people'] : ['brand', 'style', 'items', 'people']);
  function editSpace(d) {
    view = 'edit';
    doc = clone(d);
    history = [JSON.stringify(doc)];
    hIndex = 0;
    dirty = false;
    tool = selected = drag = null;
    openPeople.clear();
    tab = 'brand';
    show();
    render();
    requestAnimationFrame(focusRoom);
  }
  function editGo(dir) {
    const steps = editSteps(), i = steps.indexOf(tab) + dir;
    if (i < 0) return;
    if (i >= steps.length) { save(); return closeEditor(true); }
    tab = steps[i];
    tool = selected = null;
    render();
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
    show();
    render();
    refocus();
  }
  function undo() {
    if (hIndex <= 0) return;
    hIndex--;
    doc = JSON.parse(history[hIndex]);
    selected = tool = null;
    dirty = true;
    show();
    render();
    refocus();
  }
  function redo() {
    if (hIndex >= history.length - 1) return;
    hIndex++;
    doc = JSON.parse(history[hIndex]);
    selected = tool = null;
    dirty = true;
    show();
    render();
    refocus();
  }
  // Antes de guardar, lo que está a medio escribir (frases vacías, links incompletos) se limpia.
  function save() {
    if (!doc) return;
    doc = cleanDoc();
    const list = othersAfterSave().concat(doc);
    if (!space.save(list)) { render(); return flash(tr('saveError'), true); }
    saved = clone(list);
    upgradedFrom = null;
    dirty = false;
    show();
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
    else if (p[0] === 'deskColor') doc.deskColor = v || null;
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
    const here = view === 'wizard' ? 'w-' + wiz.step : tab;
    const scroll = oldBody && lastTab === here ? oldBody.scrollTop : 0;
    if (view === 'wizard') renderWizard();
    else renderEdit();
    lastTab = here;
    const body = panel.querySelector('.ed-body');
    body.scrollTop = scroll;
    if (reveal) {
      const el = body.querySelector(reveal);
      if (el) el.scrollIntoView({ block: 'nearest' });
      reveal = null;
    }
    renderFoot();
  }

  // ————————————————————————————————— Panel del paso a paso
  function renderWizard() {
    const steps = wiz.kind ? stepsOf() : STEPS.new.office;
    const n = steps.indexOf(wiz.step) + 1;
    const body = { kind: wizKind, size: wizSize, place: wizPlace, confirm: wizConfirm }[wiz.step]();
    panel.innerHTML = `
      <header class="ed-head">
        <div class="ed-head-title"><small>${esc(fill('wStep', { n, t: steps.length }))}</small><strong>${esc(tr({ kind: 'w1Title', size: 'w2Title', place: 'w3Title', confirm: 'w4Title' }[wiz.step]))}</strong></div>
        <button type="button" class="ed-icon" data-act="close" aria-label="${esc(tr('close'))}">✕</button>
      </header>
      <div class="ed-progress">${steps.map((st, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <div class="ed-body">${body}</div>
      <footer class="ed-foot"></footer>`;
  }
  function wizKind() {
    const card = (kind, title, note, price) => `
      <button type="button" class="ed-choice" data-act="kind" data-v="${kind}">
        <strong>${esc(tr(title))}</strong><small>${esc(tr(note))}</small><b>${esc(price)}</b>
      </button>`;
    return `
      ${card('desk', 'deskCard', 'deskCardNote', money(cat.desk.price) + tr('perMonth'))}
      ${card('office', 'officeCard', 'officeCardNote', fill('from', { p: money(Math.round(8 * 8 * cat.pricePerM2)) }))}
      <p class="ed-hint">${esc(tr('w1Hint'))}</p>`;
  }
  // Anchos que caben en algún lugar libre ahora mismo.
  function officeWidths() {
    const list = saved.filter((o) => !wiz.back || o.id !== wiz.back.id), d = Object.assign(space.empty('office'), { id: doc && doc.id });
    const out = [];
    for (let w = zone.RULES.minWidth; w <= zone.RULES.maxWidth; w++) if (space.fitPlace(list, d, zone.ROWS[0].id, null, w)) out.push(w);
    return out;
  }
  // Los tamaños de siempre (S, M, L, XL) y, además, los anchos exactos que caben en el piso.
  function wizSize() {
    const fit = officeWidths();
    const presets = cat.sizes.filter((z) => !z.soon);
    const widths = [...new Set(presets.map((z) => z.w).concat(fit))].sort((a, b) => a - b);
    return `
      <p class="ed-hint">${esc(tr('w2Hint'))}</p>
      ${widths.map((w) => {
        const z = presets.find((o) => o.w === w), d = { w, kind: 'office' }, fits = fit.includes(w);
        return `<button type="button" class="ed-choice${doc && doc.w === w ? ' on' : ''}" data-act="wsize" data-v="${w}" ${fits ? '' : 'disabled'}>
          <span class="ed-size-plan">${sizePlan(w)}</span>
          <span><strong>${esc(z ? fill('officeSize', { s: nm(z) }) : fill('officeSize', { s: w + ' m' }))}</strong><small>${w} × 8 m · ${w * 8} m²</small><small>${esc(fits ? fill('people', { n: space.limits(d).maxResidents }) : tr('noFitNow'))}</small></span>
          <b>${money(Math.round(w * 8 * cat.pricePerM2))}${esc(tr('perMonth'))}</b>
        </button>`;
      }).join('')}
      <p class="ed-note">${esc(tr('floorSoon'))}</p>`;
  }
  function wizPlace() {
    if (doc.kind === 'desk') return `<p class="ed-hint">${esc(tr('w3Desk'))}</p>${zoneMap()}`;
    const ok = space.startsFor(others(), doc, doc.row), i = ok.indexOf(doc.x);
    return `
      <p class="ed-hint">${esc(tr('w3Office'))}</p>
      ${zoneMap()}
      <div class="ed-row ed-where-row">
        <button type="button" class="ed-icon" data-act="slot" data-v="-1" ${i <= 0 ? 'disabled' : ''} aria-label="◀">◀</button>
        <span>${esc(fill('slotAt', { r: doc.row, m: doc.x }))}</span>
        <button type="button" class="ed-icon" data-act="slot" data-v="1" ${i >= ok.length - 1 ? 'disabled' : ''} aria-label="▶">▶</button>
      </div>
      <details class="ed-rules"><summary>${esc(tr('rulesTitle'))}</summary><ol>${tr('rules').map((r) => `<li>${esc(r)}</li>`).join('')}</ol></details>`;
  }
  function wizConfirm() {
    const row = (k, v) => `<div class="ed-sum-row"><span>${esc(tr(k))}</span><strong>${esc(v)}</strong></div>`;
    const desk = doc.kind === 'desk';
    return `
      <div class="ed-summary">
        ${row('sumWhat', tr(desk ? 'deskCard' : 'officeCard'))}
        ${desk ? '' : row('sumSize', doc.w + ' × 8 m · ' + space.m2(doc) + ' m²')}
        ${row('sumWhere', desk ? 'Coworking · ' + fill('deskN', { n: doc.desk + 1 }) : fill('officeN', { n: doc.number }) + ' · ' + fill('rowLabel', { r: doc.row }))}
        ${row('sumPrice', fill('perMonthLong', { p: money(space.price(doc)) }))}
      </div>
      ${wiz.mode === 'new' ? field(tr('emailLabel'), `<input type="email" data-email value="${esc(account.email || '')}" placeholder="tu@correo.com" autocomplete="email">`) + `<p class="ed-note">${esc(tr('emailHint'))}</p>` : ''}
      <p class="ed-hint">${esc(tr('w4Hint'))}</p>`;
  }
  function sizePlan(w) {
    const k = 2.5;
    let lines = '';
    for (let x = 4; x < w; x += 4) lines += `<line x1="${x * k}" y1="0" x2="${x * k}" y2="${8 * k}"/>`;
    return `<svg viewBox="0 0 ${w * k} ${8 * k}" width="${w * k}" height="${8 * k}" aria-hidden="true"><rect width="${w * k}" height="${8 * k}" rx="2"/>${lines}</svg>`;
  }

  // ————————————————————————————————— Panel de personalizar
  function renderEdit() {
    const steps = editSteps();
    if (!steps.includes(tab)) tab = steps[0];
    const n = steps.indexOf(tab) + 1;
    const label = { brand: 'sBrand', style: 'sStyle', items: 'sItems', people: 'sPeople' };
    panel.innerHTML = `
      <header class="ed-head">
        <div class="ed-head-title"><strong>${esc(spaceName(doc))}</strong><small>${esc(doc.kind === 'desk' ? 'Coworking · ' + fill('deskN', { n: doc.desk + 1 }) : fill('officeN', { n: doc.number }) + ' · ' + space.m2(doc) + ' m²')} · ${money(space.price(doc))}${esc(tr('perMonth'))}</small></div>
        <button type="button" class="ed-icon" data-act="close" aria-label="${esc(tr('close'))}">✕</button>
      </header>
      <div class="ed-tools">
        <button type="button" class="ed-icon" data-act="undo" title="${esc(tr('undo'))}" aria-label="${esc(tr('undo'))}" ${hIndex <= 0 ? 'disabled' : ''}>↶</button>
        <button type="button" class="ed-icon" data-act="redo" title="${esc(tr('redo'))}" aria-label="${esc(tr('redo'))}" ${hIndex >= history.length - 1 ? 'disabled' : ''}>↷</button>
        <button type="button" class="ed-btn" data-act="preview">▶ ${esc(tr('try'))}</button>
        <details class="ed-more"><summary class="ed-icon" title="${esc(tr('more'))}" aria-label="${esc(tr('more'))}">⋯</summary>
          <div class="ed-menu">
            <button type="button" data-act="change">${esc(tr('changePlace'))}</button>
            ${doc.kind === 'desk' ? `<button type="button" data-act="upgrade">${esc(tr('upgrade'))}</button>` : ''}
            <button type="button" data-act="export">${esc(tr('export'))}</button>
            <button type="button" data-act="import">${esc(tr('import'))}</button>
            <button type="button" data-act="clear">${esc(tr('clearRoom'))}</button>
            <button type="button" data-act="restore">${esc(tr('restore'))}</button>
          </div>
        </details>
        <button type="button" class="ed-btn ed-primary" data-act="save">${esc(tr('save'))}</button>
      </div>
      <nav class="ed-tabs ed-stepper">${steps.map((id, i) => `<button type="button" data-tab="${id}" class="${tab === id ? 'on' : ''}"><i>${i + 1}</i>${esc(tr(label[id]))}</button>`).join('')}</nav>
      <div class="ed-body">${renderTab()}</div>
      <footer class="ed-foot"></footer>`;
  }

  function renderTab() {
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

  // ————————————————————————————————— Plano de la zona de arriendo
  // Dibuja lo que el edificio tiene construido ahora (filas, pasillos, oficinas, coworking).
  // Se puede tocar: en la lista, para crear o abrir; editando, para mover la oficina o el puesto.
  // Tamaño del plano: toda la zona de arriendo (con la línea de la izquierda).
  const MAP = { w: Math.max(...zone.ROWS.flatMap((r) => r.bays.map((b) => b.R))) + 2, h: Math.max(...zone.ROWS.map((r) => r.hallY)) + 2 };
  function zoneMap() {
    const rc = (x, y, w, h, c, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${extra || ''}/>`;
    const txt = (x, y, t, c) => `<text x="${x}" y="${y}" fill="${c}" font-size="2.2" text-anchor="middle" font-family="Silkscreen, monospace">${esc(t)}</text>`;
    const hall = '#a8a295';
    const mine = new Set(saved.map((d) => d.id).concat(doc ? [doc.id] : []));
    let svg = rc(0, 0, MAP.w, MAP.h, '#2f2925');
    for (const [x, y, w, h] of world.room('hall').rects) if (y < MAP.h) svg += rc(x, y, w, Math.min(h, MAP.h - y), hall);
    for (const row of zone.ROWS) {
      for (const run of row.runs || []) {
        const len = run.e - run.s + 1;
        if (run.t === 'free') svg += rc(run.s, row.y, len, row.h, '#cdc9c0');
        else if (run.t === 'hall') svg += rc(run.s, row.up ? row.y - 3 : row.y, len, row.hallY - row.y + (row.up ? 3 : 0), hall);
        else if (run.t === 'cowork') {
          svg += rc(run.s, row.y, len, row.h, '#f2c48f');
          zone.DESKS.forEach((d, n) => {
            const owner = (doc ? others().concat(doc) : saved).find((o) => o.kind === 'desk' && o.desk === n);
            const c = !owner ? '#3f8f5a' : doc && owner.id === doc.id ? '#ffc367' : mine.has(owner.id) ? '#c98a2c' : '#8a6a4a';
            svg += rc(run.s + d.x, row.y + d.y, 2, 1, c, owner && doc && owner.id === doc.id ? ' stroke="#8a5a1a" stroke-width="0.3"' : '');
          });
        } else {
          const cur = doc && run.t === doc.id;
          svg += rc(run.s, row.y, len, row.h, cur ? '#ffc367' : '#f6dcaa', cur ? ' stroke="#8a5a1a" stroke-width="0.4"' : '');
          const q = world.room(run.t);
          if (q && q.office) svg += txt(run.s + len / 2, row.y + row.h / 2 + 0.8, q.office, '#5c3d22');
        }
      }
      svg += txt(row.bays[0].L - 0.5, row.y + row.h / 2 + 0.8, row.id, '#ffffff');
    }
    return `<div class="ed-where">
      <svg viewBox="0 0 ${MAP.w} ${MAP.h}" data-act="zonemap" role="img" aria-label="${esc(tr('where'))}">${svg}</svg>
      <div class="ed-legend"><span><i style="--c:#ffc367"></i>${esc(tr('legendMine'))}</span><span><i style="--c:#cdc9c0"></i>${esc(tr('legendFree'))}</span><span><i style="--c:${hall}"></i>${esc(tr('legendHall'))}</span><span><i style="--c:#3f8f5a"></i>${esc(tr('legendDesk'))}</span></div>
    </div>`;
  }
  // Qué hay en una casilla del plano.
  function zoneHit(tx, ty) {
    for (const row of zone.ROWS) {
      if (ty < (row.up ? row.y - 3 : row.y - 3) || ty > row.y + row.h + 2) continue;
      const inRow = ty >= row.y && ty < row.y + row.h;
      for (const run of row.runs || []) {
        if (tx < run.s || tx > run.e || !inRow) continue;
        if (run.t === 'cowork') {
          const n = zone.DESKS.findIndex((d) => tx - run.s >= d.x && tx - run.s < d.x + 2 && ty - row.y >= d.y && ty - row.y <= d.y + 1);
          return { kind: 'cowork', desk: n, row: row.id, x: tx };
        }
        if (run.t !== 'free' && run.t !== 'hall') return { kind: 'office', id: run.t, row: row.id, x: tx };
      }
      return { kind: 'free', row: row.id, x: tx };
    }
    return null;
  }
  // Tocar el plano (o el edificio) en la casilla (tx, ty): al elegir dónde, mueve el borrador.
  function pickZone(tx, ty) {
    if (view !== 'wizard' || wiz.step !== 'place') return;
    const hit = zoneHit(tx, ty);
    if (!hit) return;
    if (doc.kind === 'desk') {
      if (hit.kind !== 'cowork' || hit.desk < 0 || hit.desk === doc.desk) return;
      if (!space.freeDesks(others(), doc).includes(hit.desk)) return flash(tr('noDesk'), true);
      doc.desk = hit.desk;
      return changed();
    }
    moveOffice(hit.row, hit.x - Math.floor(doc.w / 2));
  }
  // Lleva la oficina al lugar válido más cercano en esa fila.
  function moveOffice(row, x) {
    const ok = space.startsFor(others(), doc, row);
    if (!ok.length) return flash(tr('noSpace'), true);
    const next = ok.reduce((best, s) => (Math.abs(s - x) < Math.abs(best - x) ? s : best), ok[0]);
    if (row === doc.row && next === doc.x) return;
    if (row !== doc.row) doc.number = space.numberFor(others(), doc, row);
    doc.row = row;
    doc.x = next;
    changed();
  }
  // En el paso a paso no hay historial: solo se redibuja.
  function changed() {
    if (view !== 'wizard') return commit();
    show();
    render();
    refocus();
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
      <h3 class="ed-h">${esc(tr('brandColors'))}</h3>
      ${brandColor('primary')}
      ${brandColor('accent')}
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

  const BRAND_COLORS = ['#1d1f24', '#1b2a4a', '#2c4a35', '#6a4c93', '#8a3b3b', '#b5654a', '#ffc367', '#4dd6ff', '#9cff57', '#ff6fa8', '#f2a65a', '#ffffff'];
  const brandColor = (key) => `<div class="ed-field"><span>${esc(tr(key))}</span>${colorControl('identity.' + key, doc.identity[key], BRAND_COLORS, { brand: false })}</div>`;
  function renderBrand() {
    const id = doc.identity;
    const info = cat.byType.info, hasInfo = doc.kind === 'desk' || doc.items.some((it) => cat.byType[it.type].info);
    const infoBox = hasInfo ? '' : `<div class="ed-infobox${hasInfo ? '' : ' missing'}">
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
      ${infoBox}
      ${field(tr('about'), `<textarea rows="3" maxlength="280" data-field="content.about">${esc(doc.content.about)}</textarea>`)}
      <div class="ed-field"><span>${esc(tr('links'))}</span>${links}
        ${doc.content.links.length < cat.plan.maxLinks ? `<button type="button" class="ed-btn" data-act="link">${esc(tr('addLink'))}</button>` : ''}
        <small class="ed-note">${esc(tr('badUrl'))}</small></div>
      ${doc.kind === 'desk' ? `<div class="ed-field"><span>${esc(tr('deskColor'))}</span>${colorControl('deskColor', doc.deskColor || cat.baseColor(cat.byType.desk), cat.palettes.item, { reset: true, isOriginal: !doc.deskColor })}</div>` : ''}`;
  }

  // Por qué no se puede agregar a nadie más, y qué lo permitiría.
  function peopleFull() {
    const n = space.limits(doc).maxResidents;
    const up = doc.kind === 'desk' || doc.w < zone.RULES.maxWidth;
    return `<div class="ed-callout">
      <p>${esc(doc.kind === 'desk' ? fill('peopleFullDesk', { n }) : fill('peopleFullOffice', { m: space.m2(doc), n }))}</p>
      ${up ? `<button type="button" class="ed-btn" data-tab="space">${esc(tr('seeSizes'))}</button>` : ''}
    </div>`;
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
          ${doc.kind === 'desk' ? '' : `<button type="button" class="ed-btn" data-act="prelocate" data-i="${i}">${esc(tr('relocate'))}</button>`}
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
      ${full ? peopleFull() : ''}
      ${cards || `<p class="ed-hint">${esc(tr('noPeople'))}</p>`}`;
  }

  function renderFoot() {
    const foot = panel.querySelector('.ed-foot');
    if (!foot) return;
    const status = (fallback) => `<p class="ed-status ${message && message.bad ? 'bad' : ''}">${esc(message ? message.text : fallback)}</p>`;
    if (view === 'wizard') {
      const steps = wiz.kind ? stepsOf() : STEPS.new.office, i = steps.indexOf(wiz.step);
      const last = i === steps.length - 1;
      const nextLabel = last ? (wiz.mode === 'new' ? fill('rent', { p: money(space.price(doc)) }) : tr('applyChange')) : tr('next');
      foot.innerHTML = `
        ${message ? status('') : ''}
        <div class="ed-nav">
          <button type="button" class="ed-btn" data-act="wprev" ${i <= 0 && wiz.mode === 'new' ? 'disabled' : ''}>${esc(tr('prev'))}</button>
          ${wiz.step === 'kind' ? '' : `<button type="button" class="ed-btn ed-primary" data-act="wnext">${esc(nextLabel)}</button>`}
        </div>`;
      return;
    }
    const steps = editSteps(), i = steps.indexOf(tab), last = i === steps.length - 1;
    foot.innerHTML = `
      ${status(dirty ? tr('unsaved') : tr('localNote'))}
      <div class="ed-nav">
        <button type="button" class="ed-btn" data-act="eprev" ${i <= 0 ? 'disabled' : ''}>${esc(tr('prev'))}</button>
        <span class="ed-nav-count">${esc(fill('stepCount', { n: i + 1, t: steps.length }))}</span>
        <button type="button" class="ed-btn ed-primary" data-act="enext">${esc(last ? tr('finish') : tr('next'))}</button>
      </div>`;
    // El botón dice si lo que se ve ya está guardado.
    const sb = panel.querySelector('[data-act=save]');
    if (sb) {
      const done = !dirty && saved.some((d) => d.id === doc.id);
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
      case 'kind': return chooseKind(v);
      case 'wsize': return chooseSize(Number(v));
      case 'wnext': return wizGo(1);
      case 'wprev':
        // el primer paso de un cambio vuelve a personalizar, sin tocar nada
        if (wiz.mode !== 'new' && stepsOf().indexOf(wiz.step) === 0) return editSpace(wiz.back);
        return wizGo(-1);
      case 'enext': return editGo(1);
      case 'eprev': return editGo(-1);
      case 'change': return startWizard('change');
      case 'upgrade': return startWizard('upgrade');
      case 'zonemap': {
        const box = el.getBoundingClientRect();
        return pickZone(Math.floor(((e.clientX - box.left) / box.width) * MAP.w), Math.floor(((e.clientY - box.top) / box.height) * MAP.h));
      }

      case 'undo': return undo();
      case 'redo': return redo();
      case 'save': return save();
      case 'preview': return startPreview();
      case 'export': return exportJson();
      case 'import': return fileInput.click();
      case 'clear':
        if (!confirm(tr('clearConfirm'))) return;
        return resetSpace();
      case 'reset':
        if (!confirm(tr('resetConfirm'))) return;
        return resetSpace();
      case 'restore': {
        if (!confirm(tr('restoreConfirm'))) return;
        const list = others();
        if (!space.save(list)) return flash(tr('saveError'), true);
        saved = list;
        doc = null;
        return closeEditor(true);
      }
      case 'pick': {
        if (doc.items.length >= space.limits(doc).maxItems) return flash(tr('full'), true);
        const def = cat.byType[el.dataset.type];
        tool = tool && tool.type === def.type ? null : { kind: 'item', type: def.type, variant: def.variants && def.variants[0] };
        selected = null;
        return render();
      }
      case 'variant': sel.variant = v; return commit();
      case 'slot': {
        // de a 4 m, o hasta el siguiente lugar permitido de la fila
        const ok = space.startsFor(others(), doc, doc.row), cur = doc.x, dir = Number(v);
        const next = dir > 0 ? ok.find((x) => x >= cur + 4) ?? ok.find((x) => x > cur) : [...ok].reverse().find((x) => x <= cur - 4) ?? [...ok].reverse().find((x) => x < cur);
        if (next == null) return;
        doc.x = next;
        return changed();
      }
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
        // Las plantillas son para 16 m: si cabe en la misma fila, la oficina se ajusta a ese ancho.
        const keep = { id: doc.id, kind: 'office', row: doc.row, x: doc.x, w: doc.w, number: doc.number };
        const ok = space.startsFor(others(), doc, doc.row, 16);
        if (ok.length) Object.assign(keep, { w: 16, x: ok.reduce((b, x) => (Math.abs(x - doc.x) < Math.abs(b - doc.x) ? x : b), ok[0]) });
        doc = space.sanitize(Object.assign(clone(space.templates.find((t) => t.id === v).doc), keep));
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
        const data = {
          kind, name: kind === 'agent' ? 'Agent' : 'Alex', title: '', bio: '', lines: [],
          body: cat.people.body[doc.residents.length % cat.people.body.length],
          eye: cat.people.eye[0], skin: cat.people.skin[1], hair: cat.people.hair[0], x: 0, y: 0,
        };
        // En un puesto cada uno tiene su lugar frente al escritorio; en una oficina se ubica.
        if (doc.kind === 'desk') {
          doc.residents.push(data);
          openPeople.add(doc.residents.length - 1);
          return commit();
        }
        tool = { kind: 'resident', data };
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

  // Vaciar el espacio: se mantienen su tipo, su tamaño y su lugar.
  function resetSpace() {
    const keep = { id: doc.id, kind: doc.kind, w: doc.w, row: doc.row, x: doc.x, number: doc.number, desk: doc.desk };
    doc = Object.assign(space.empty(doc.kind), keep);
    selected = tool = drag = null;
    openPeople.clear();
    commit();
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
    const door = world.doorEntries(doc.id)[0] || { x: 0, y: room.h - 1 };
    const spots = [];
    for (let y = 0; y < room.h; y++) for (let x = 0; x < room.w; x++) spots.push({ x, y, d: Math.abs(x - door.x) + Math.abs(y - door.y) });
    spots.sort((a, b) => (a.d < 2) - (b.d < 2) || a.d - b.d);
    const item = { type: 'info' };
    const spot = spots.find((p) => !space.canPlace(doc, item, p.x, p.y));
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
    typingTimer = setTimeout(show, el.dataset.color ? 60 : 200);
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
    show();
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
    a.download = (doc.kind === 'desk' ? 'puesto-' + (doc.desk + 1) : 'oficina-' + doc.number) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    f.text().then((txt) => {
      // Se importa el contenido; el tipo, el tamaño y el lugar siguen siendo los de este espacio.
      const keep = { id: doc.id, kind: doc.kind, w: doc.w, row: doc.row, x: doc.x, number: doc.number, desk: doc.desk };
      doc = space.sanitize(Object.assign(JSON.parse(txt), keep));
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
    const a = space.area(doc);
    return t.x >= a.x0 && t.y >= 0 && t.x < a.x0 + a.w && t.y < room.h;
  };
  const active = () => isOpen && !previewing;
  // Se arman objetos y personas sobre el edificio solo al editar una oficina; en lo demás,
  // tocar el edificio es como tocar el plano (abrir un espacio, crear uno, cambiar de puesto).
  const building = () => view === 'edit' && doc && doc.kind === 'office';
  const absTile = (e) => {
    const [wx, wy] = game.worldFromEvent(e);
    return [Math.floor(wx / T), Math.floor(wy / T)];
  };

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
      const why = space.canPlace(doc, item, t.x, t.y);
      if (why) return flash(tr(why), true);
      doc.items.push(item);
      if (doc.items.length >= space.limits(doc).maxItems) tool = null;
      return commit();
    }
    if (tool.kind === 'resident') {
      const p = Object.assign({}, tool.data, { x: t.x, y: t.y });
      const why = space.canPlace(doc, p, t.x, t.y);
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
    const why = space.canPlace(doc, ref, x, y, ref);
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
    if (!building()) { stop(e); canvas.style.cursor = 'pointer'; return; }
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
    if (!building()) return;
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
    if (!building()) return pickZone(...absTile(e));
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
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected && building()) {
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
    ctx.save();
    // Mis espacios (y el que se edita) con un borde punteado.
    const dashed = (x, y, w, h, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.lineDashOffset = -t * 6;
      ctx.strokeRect(x * T + 0.5, y * T + 0.5, w * T - 1, h * T - 1);
      ctx.setLineDash([]);
    };
    const cw = world.room('cowork');
    const list = doc ? others().concat(doc) : saved;
    for (const d of list) {
      const cur = doc && d.id === doc.id;
      if (d.kind === 'desk') { const k = zone.DESKS[d.desk]; dashed(cw.x + k.x, cw.y + k.y - 1, 2, 3, cur ? '#ffc367' : 'rgba(255,195,103,.6)'); }
      else if (!cur) { const q = world.room(d.id); if (q) dashed(q.x, q.y, q.w, q.h, 'rgba(255,195,103,.6)'); }
    }
    if (!building()) { ctx.restore(); return; }
    const ox = room.x * T, oy = room.y * T;
    // cuadrícula, solo en lo arrendado
    const a = space.area(doc), ax = ox + a.x0 * T;
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
      const why = space.canPlace(doc, thing, x, y, tool && tool.kind === 'move' ? thing : drag ? drag.ref : null);
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
  labelButtons();
})();
