// Vista de texto (botón "?"): dos pestañas, qué es 2GoodLabs (el manifiesto) y los
// fundadores (quiénes somos, productos, agentes y contacto), como página normal, sin juego.
// La misma función arma el HTML en el navegador (al cambiar de idioma) y en build.js,
// que lo deja escrito en index.html para buscadores y para quien no usa JavaScript.

(function () {
  const text = {
    es: {
      back: '← Volver al edificio',
      whatTab: '¿Qué es esto?', foundersTab: 'Los fundadores',
      aboutTitle: 'Quiénes somos',
      foundersTitle: 'Fundadores',
      productsTitle: 'Productos',
      agentsTitle: 'El equipo de agentes',
      agentsNote: 'Cada agente representa tareas que hacemos nosotros con IA.',
      contactTitle: 'Contacto',
      contactNote: 'Por ahora estamos concentrados en nuestros productos, pero siempre es bueno conocer gente. Escríbenos.',
      name: 'Nombre',
      email: 'Correo',
      message: 'Mensaje',
      send: 'Enviar',
      sending: 'Enviando…',
      sent: '¡Gracias! Te escribiremos pronto.',
      error: 'No se pudo enviar. Intenta de nuevo en un rato.',
      agent: 'Agente',
      appStore: 'App Store',
    },
    en: {
      back: '← Back to the building',
      whatTab: 'What is this?', foundersTab: 'The founders',
      aboutTitle: 'Who we are',
      foundersTitle: 'Founders',
      productsTitle: 'Products',
      agentsTitle: 'The agent team',
      agentsNote: 'Every agent stands for work we do ourselves with AI.',
      contactTitle: 'Contact',
      contactNote: 'We are focused on our own products for now, but it is always good to meet people. Write to us.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      sending: 'Sending…',
      sent: 'Thanks! We will get back to you soon.',
      error: 'It could not be sent. Please try again later.',
      agent: 'Agent',
      appStore: 'App Store',
    },
  };
  TGL.simpleText = text;

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label || host(url))} ↗</a>`;

  TGL.renderSimple = function (lang, tab) {
    const L = text[lang], M = TGL.manifesto[lang];
    tab = tab || 'what';
    const panel = (id) => `class="s-panel" data-panel="${id}" role="tabpanel"${tab === id ? '' : ' data-off'}`;
    const t = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
    const role = (m) => t(TGL.roles[m.role].label);
    const person = (m) => `
        <li class="s-person" style="--role:${TGL.roles[m.role].color}">
          <canvas data-face="${m.id}" width="48" height="48" aria-hidden="true"></canvas>
          <div>
            <h4>${esc(m.name)}</h4>
            <p class="s-role">${esc(m.title ? t(m.title) : (m.kind === 'agent' ? L.agent + ' · ' : '') + role(m))}</p>
            <p>${esc(t(m.bio))}</p>
            ${(m.links || []).map((u) => `<p>${link(u)}</p>`).join('')}
          </div>
        </li>`;
    const founders = TGL.team.filter((m) => m.kind === 'human');
    const products = TGL.rooms.filter((r) => r.link);

    return `
      <header class="s-head">
        <div>
          <h1 class="s-logo">2GoodLabs</h1>
          <p class="s-tag">${esc(t(TGL.company.tagline))}</p>
        </div>
        <button type="button" class="s-back" data-simple-close>${esc(L.back)}</button>
      </header>

      <nav class="s-tabs" role="tablist">
        ${['what', 'founders'].map((id) => `<button type="button" role="tab" data-stab="${id}" aria-selected="${tab === id}">${esc(L[id + 'Tab'])}</button>`).join('')}
      </nav>

      <div ${panel('what')}>
      <section class="s-manifesto">
        <h3 class="s-mtitle">${esc(M.title)}</h3>
        <p class="s-lead">${esc(M.lead)}</p>
        ${M.body.map((p) => `<p>${esc(p)}</p>`).join('')}
      </section>
      <section>
        <h2>${esc(M.stepsTitle)}</h2>
        <ol class="s-steps">${M.steps.map(([h, p]) => `<li><strong>${esc(h)}</strong><span>${esc(p)}</span></li>`).join('')}</ol>
        <p class="s-closing">${esc(M.closing)}</p>
        <button type="button" class="s-cta" data-simple-rent>${esc(M.cta)}</button>
      </section>
      </div>

      <div ${panel('founders')}>
      <section>
        <h2>${esc(L.aboutTitle)}</h2>
        <p class="s-lead">${esc(t(TGL.company.about))}</p>
      </section>

      <section>
        <h2>${esc(L.foundersTitle)}</h2>
        <ul class="s-people">${founders.map(person).join('')}</ul>
      </section>

      <section>
        <h2>${esc(L.productsTitle)}</h2>
        <div class="s-products">
          ${products.map((r) => `
          <article class="s-product" style="--room:${r.color}">
            <h3>${esc(t(r.name))}</h3>
            <p>${esc(t(r.info))}</p>
            <p class="s-links">${link(r.link)}${r.appStore ? ' ' + link(r.appStore, L.appStore) : ''}</p>
          </article>`).join('')}
        </div>
      </section>

      <section>
        <h2>${esc(L.agentsTitle)}</h2>
        <p>${esc(L.agentsNote)}</p>
        ${products.map((r) => `
        <h3 class="s-team" style="--room:${r.color}">${esc(t(r.name))}</h3>
        <ul class="s-people">${TGL.team.filter((m) => m.room === r.id).map(person).join('')}</ul>`).join('')}
      </section>

      <section id="contacto">
        <h2>${esc(L.contactTitle)}</h2>
        <p>${esc(L.contactNote)}</p>
        <form class="s-form" method="post" action="/api/contact">
          <input type="hidden" name="lang" value="${lang}">
          <label>${esc(L.name)}<input name="name" autocomplete="name" required maxlength="100"></label>
          <label>${esc(L.email)}<input name="email" type="email" autocomplete="email" required maxlength="200"></label>
          <label>${esc(L.message)}<textarea name="message" rows="5" required maxlength="5000"></textarea></label>
          <label class="s-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
          <button type="submit">${esc(L.send)}</button>
          <p class="s-status" role="status"></p>
        </form>
      </section>
      </div>

      <footer class="s-foot">© ${new Date().getFullYear()} 2GoodLabs · <a href="${esc(TGL.company.url)}">${esc(host(TGL.company.url))}</a></footer>`;
  };

  if (typeof document === 'undefined') return;

  // ————————————————————————————————— En el navegador
  const $ = (s) => document.querySelector(s);
  const view = $('#simple');
  if (!view) return;

  let tab = 'what';
  function render() {
    // lo escrito en el formulario de contacto no se pierde al cambiar de pestaña o de idioma
    const form = view.querySelector('.s-form'), keep = form ? [...form.elements].map((el) => el.value) : null;
    view.innerHTML = TGL.renderSimple(TGL.lang, tab);
    const again = view.querySelector('.s-form');
    if (keep && again) [...again.elements].forEach((el, i) => { if (el.type !== 'hidden' && el.type !== 'submit' && keep[i] != null) el.value = keep[i]; });
    drawFaces();
  }
  function setTab(id) {
    if (id === tab) return;
    tab = id;
    view.querySelectorAll('[data-stab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.stab === id)));
    view.querySelectorAll('[data-panel]').forEach((p) => p.toggleAttribute('data-off', p.dataset.panel !== id));
    view.scrollTop = 0;
    drawFaces();
  }
  function drawFaces() {
    if (!TGL.drawFace) return;
    view.querySelectorAll('canvas[data-face]').forEach((c) => {
      const m = TGL.team.find((p) => p.id === c.dataset.face);
      if (m) TGL.drawFace(c, m);
    });
  }

  TGL.simpleOpen = () => document.body.classList.contains('simple-open');
  // prefill: texto para el mensaje (por ejemplo, la oficina por la que preguntan).
  TGL.openSimple = function (anchor, prefill) {
    document.body.classList.add('simple-open');
    const target = anchor && view.querySelector('#' + anchor);
    const inPanel = target && target.closest('[data-panel]');
    if (inPanel) setTab(inPanel.dataset.panel);
    view.scrollTop = 0;
    drawFaces();
    if (target) target.scrollIntoView();
    const msg = view.querySelector('.s-form textarea');
    if (prefill && msg && (!msg.value || msg.dataset.prefilled === '1')) {
      msg.value = prefill;
      msg.dataset.prefilled = '1';
    }
    const focus = target ? target.querySelector('input') : view.querySelector('[data-simple-close]');
    if (focus) focus.focus({ preventScroll: !!target });
    $('#btn-simple').setAttribute('aria-expanded', 'true');
  };
  TGL.closeSimple = function () {
    document.body.classList.remove('simple-open');
    $('#btn-simple').setAttribute('aria-expanded', 'false');
    const office = $('#office');
    if (office) office.focus({ preventScroll: true });
  };

  $('#btn-simple').addEventListener('click', () => (TGL.simpleOpen() ? TGL.closeSimple() : TGL.openSimple()));
  view.addEventListener('click', (e) => {
    if (e.target.closest('[data-simple-close]')) return TGL.closeSimple();
    const t = e.target.closest('[data-stab]');
    if (t) return setTab(t.dataset.stab);
    // "Encuentra tu lugar": de vuelta al edificio, con el paso a paso para arrendar
    if (e.target.closest('[data-simple-rent]')) {
      TGL.closeSimple();
      const rent = $('#btn-editor');
      if (rent) rent.click();
    }
  });
  // Si la persona edita el mensaje sugerido, ya es suyo: no se vuelve a reemplazar.
  view.addEventListener('input', (e) => { if (e.target.matches('textarea')) delete e.target.dataset.prefilled; });

  view.addEventListener('submit', async (e) => {
    const form = e.target.closest('.s-form');
    if (!form) return;
    e.preventDefault();
    const L = text[TGL.lang], status = form.querySelector('.s-status'), btn = form.querySelector('button');
    btn.disabled = true;
    status.className = 's-status';
    status.textContent = L.sending;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = L.sent;
      status.classList.add('ok');
    } catch (err) {
      status.textContent = L.error;
      status.classList.add('bad');
    }
    btn.disabled = false;
  });

  // Sin JavaScript el formulario hace un POST normal y el worker vuelve aquí con ?contacto=ok|error.
  const result = new URLSearchParams(location.search).get('contacto');

  window.addEventListener('langchange', render);
  render();
  if (result) {
    TGL.openSimple('contacto');
    const status = view.querySelector('.s-status');
    status.textContent = text[TGL.lang][result === 'ok' ? 'sent' : 'error'];
    status.classList.add(result === 'ok' ? 'ok' : 'bad');
  }
})();
