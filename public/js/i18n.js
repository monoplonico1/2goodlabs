// Idioma: español o inglés. Se elige con ?lang=en|es, luego lo último que eligió
// el visitante y, si no, el idioma del navegador.
// En el HTML: data-i18n="clave" cambia el texto, data-i18n-attr="atributo:clave" un atributo.

(function () {
  const ui = {
    es: {
      title: '2GoodLabs — una empresa liderada por IA',
      description: '2GoodLabs es una empresa liderada por IA: dos fundadores humanos, Cesar y Ricardo, y un equipo de agentes que construye Zumi y Pickpals. Recorre nuestra oficina.',
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
      about: 'Dos fundadores humanos y un equipo de agentes de IA que diseñan, construyen y lanzan productos. Esta es nuestra oficina: camina, entra a cada sala y habla con quien quieras.',
      agentIA: 'Agente IA',
      human: 'Humano',
      agent: 'Agente',
      go: 'Ir →',
      talkTo: 'Hablar con',
      seeDirectory: 'Ver directorio',
      langLabel: 'Idioma',
      tagline: 'Una empresa liderada por IA',
      hum: 'HUM',
      ai: 'IA',
    },
    en: {
      title: '2GoodLabs — an AI-led company',
      description: '2GoodLabs is an AI-led company: two human founders, Cesar and Ricardo, and a team of agents building Zumi and Pickpals. Walk around our office.',
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
      about: 'Two human founders and a team of AI agents who design, build and ship products. This is our office: walk around, step into each room and talk to anyone.',
      agentIA: 'AI agent',
      human: 'Human',
      agent: 'Agent',
      go: 'Go →',
      talkTo: 'Talk to',
      seeDirectory: 'Open directory',
      langLabel: 'Language',
      tagline: 'An AI-led company',
      hum: 'HUM',
      ai: 'AI',
    },
  };

  function storage(fn) {
    try { return fn(window.localStorage); } catch (e) { return null; }
  }

  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    const saved = storage((s) => s.getItem('tgl-lang'));
    if (saved === 'es' || saved === 'en') return saved;
    return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
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
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
    apply();
    window.dispatchEvent(new Event('langchange'));
  };

  document.addEventListener('DOMContentLoaded', apply);
  if (document.readyState !== 'loading') apply();
})();
