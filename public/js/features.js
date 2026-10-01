// Interruptores de funciones en desarrollo.
//
// editor (editor de oficinas, carpeta /editor):
//   false     → apagado del todo: sus archivos ni se cargan.
//   'preview' → solo para quien entre con ?editor=1 (se recuerda en este navegador
//               hasta entrar con ?editor=0). El público no lo ve.
//   true      → encendido para todos.

(function () {
  TGL.features = { editor: 'preview' };

  function enabled(name) {
    const mode = TGL.features[name];
    if (mode === true) return true;
    if (mode !== 'preview') return false;
    const q = new URLSearchParams(location.search).get(name);
    try {
      if (q === '1') localStorage.setItem('tgl-feature-' + name, '1');
      if (q === '0') localStorage.removeItem('tgl-feature-' + name);
      return localStorage.getItem('tgl-feature-' + name) === '1';
    } catch (e) {
      return q === '1';
    }
  }
  TGL.featureOn = enabled;

  // Carga un módulo: su CSS y sus scripts en orden, con la misma versión que este archivo.
  const v = ((document.currentScript && document.currentScript.src) || '').split('?v=')[1] || '';
  function load(dir, css, scripts) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = dir + css + '?v=' + v;
    document.head.appendChild(link);
    for (const f of scripts) {
      const s = document.createElement('script');
      s.src = dir + f + '?v=' + v;
      s.async = false;
      document.body.appendChild(s);
    }
  }

  if (enabled('editor')) load('/editor/', 'editor.css', ['catalog.js', 'space.js', 'editor.js']);
})();
