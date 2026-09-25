// Idioma: español o inglés. Se elige con ?lang=en|es, luego lo último que eligió
// el visitante y, si no, el idioma del navegador.
// En el HTML: data-i18n="clave" cambia el texto, data-i18n-attr="atributo:clave" un atributo.

(function () {
  const ui = {
    es: {
      title: '2GoodLabs — Laboratorio de producto con IA',
      description: '2GoodLabs es el laboratorio de producto de Cesar y Ricardo, dos diseñadores de producto y UX que trabajan con IA como herramienta principal. Aquí construimos Zumi y Pickpals. Recorre nuestra oficina.',
      officeLabel: 'Oficina de 2GoodLabs en pixel art. Usa las flechas o WASD para caminar, E para hablar. El directorio tiene el mismo contenido en texto.',
      directory: 'Directorio',
      closeDirectory: 'Cerrar directorio',
      close: 'Cerrar',
      founders: 'fundadores',
      agentsActive: 'agentes activos',
      controls: 'caminar · <kbd>E</kbd> hablar · clic para ir',
      controlsLabel: 'Controles',
      minimapLabel: 'Minimapa: clic para caminar a ese punto',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      zoomFit: 'Ver todo el piso',
      zoomLabel: 'Zoom',
      room: 'Sala',
      now: 'Ahora mismo',
      about: 'Dos diseñadores de producto y UX, y la IA como herramienta principal: cada agente representa tareas que hacemos con ella. Esta es nuestra oficina: camina, entra a cada sala y habla con quien quieras.',
      agentIA: 'Agente IA',
      human: 'Humano',
      agent: 'Agente',
      go: 'Ir →',
      talkTo: 'Hablar con',
      seeDirectory: 'Ver directorio',
      langLabel: 'Idioma',
      tagline: TGL.company.tagline.es,
      hum: 'HUM',
      ai: 'IA',
      moreInfo: 'Más sobre',
      visit: 'Visitar',
      bark: '¡Guau!',
      getOn: 'Descárgala en el',
      getZumi: 'Descargar Zumi en el App Store',
      appStoreBtn: 'Descargar en el App Store ↗',
      simpleView: 'Vista simple',
      officeView: 'Volver a la oficina',
      writeUs: 'Escríbenos',
      portfolio: 'Portafolio',
      officeAlt: 'La oficina de 2GoodLabs en pixel art',
    },
    en: {
      title: '2GoodLabs — AI-powered product lab',
      description: '2GoodLabs is the product lab of Cesar and Ricardo, two product and UX designers who use AI as their main tool. This is where we build Zumi and Pickpals. Walk around our office.',
      officeLabel: '2GoodLabs office in pixel art. Use the arrow keys or WASD to walk, E to talk. The directory has the same content as text.',
      directory: 'Directory',
      closeDirectory: 'Close directory',
      close: 'Close',
      founders: 'founders',
      agentsActive: 'active agents',
      controls: 'walk · <kbd>E</kbd> talk · click to go',
      controlsLabel: 'Controls',
      minimapLabel: 'Minimap: click to walk there',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      zoomFit: 'Fit the whole floor',
      zoomLabel: 'Zoom',
      room: 'Room',
      now: 'Right now',
      about: 'Two product and UX designers, with AI as our main tool: every agent stands for work we do with it. This is our office: walk around, step into each room and talk to anyone.',
      agentIA: 'AI agent',
      human: 'Human',
      agent: 'Agent',
      go: 'Go →',
      talkTo: 'Talk to',
      seeDirectory: 'Open directory',
      langLabel: 'Language',
      tagline: TGL.company.tagline.en,
      hum: 'HUM',
      ai: 'AI',
      moreInfo: 'More about',
      visit: 'Visit',
      bark: 'Woof!',
      getOn: 'Download on the',
      getZumi: 'Get Zumi on the App Store',
      appStoreBtn: 'Download on the App Store ↗',
      simpleView: 'Simple view',
      officeView: 'Back to the office',
      writeUs: 'Write to us',
      portfolio: 'Portfolio',
      officeAlt: 'The 2GoodLabs office in pixel art',
    },
  };

  // build.js usa los textos para generar el HTML de cada idioma; ahí no hay navegador.
  TGL.uiStrings = ui;
  if (typeof document === 'undefined') return;

  function storage(fn) {
    try { return fn(window.localStorage); } catch (e) { return null; }
  }

  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    const saved = storage((s) => s.getItem('tgl-lang'));
    if (saved === 'es' || saved === 'en') return saved;
    // Cada idioma tiene su URL (/ y /en/): manda el idioma del HTML servido.
    return document.documentElement.lang === 'en' ? 'en' : 'es';
  }

  TGL.lang = initialLang();

  // Texto en el idioma actual: acepta {es, en} o un texto plano.
  TGL.t = function (v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v[TGL.lang] !== undefined ? v[TGL.lang] : v.es;
    return v;
  };
  TGL.ui = (key) => ui[TGL.lang][key];

  function apply() {
    document.documentElement.lang = TGL.lang;
    document.title = TGL.ui('title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = TGL.ui('description');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = TGL.ui(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr, TGL.ui(key));
      });
    });
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === TGL.lang));
    });
  }

  TGL.setLang = function (lang) {
    if (lang === TGL.lang) return;
    TGL.lang = lang;
    storage((s) => s.setItem('tgl-lang', lang));
    syncPath();
    apply();
    window.dispatchEvent(new Event('langchange'));
  };

  // En el sitio publicado, la URL sigue al idioma (/ ↔ /en/) sin recargar.
  function syncPath() {
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) url.searchParams.set('lang', TGL.lang);
    const p = url.pathname.replace(/index\.html$/, '');
    if (p === '/' || p === '/en/') url.pathname = TGL.lang === 'en' ? '/en/' : '/';
    if (url.href !== location.href) history.replaceState(null, '', url);
  }
  syncPath();

  document.addEventListener('DOMContentLoaded', apply);
  if (document.readyState !== 'loading') apply();
})();
