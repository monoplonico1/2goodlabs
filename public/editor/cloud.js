// Conexión con el servidor: la sesión de Supabase Auth (anónima para reservar, con correo
// para publicar) y la API del edificio (/api, ver worker/api.js). Sin librerías: la API de
// Supabase Auth se llama directo.
//
// La URL y la llave anon de Supabase son públicas (las protege la seguridad de la base, no el
// secreto). En pruebas se pueden cambiar con window.TGL_CLOUD antes de cargar este archivo.

(function () {
  const CFG = Object.assign({
    url: 'https://dltseetbrbvnyzsdebtp.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdHNlZXRicmJ2bnl6c2RlYnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTA4NTQsImV4cCI6MjEwNzAyNjg1NH0.3WuhkY6HIDgvi3mjB-yoANP_gfZSPVkRx5DJAZenZHc',
    api: '/api/',
  }, window.TGL_CLOUD || {});
  const KEY = 'tgl-session';

  // Un error con el código que manda el servidor ('taken', 'expired', 'login', …).
  class CloudError extends Error {
    constructor(code, data) {
      super(code);
      this.code = code;
      this.data = data || {};
    }
  }

  // ————————————————————————————————— Sesión
  let session = (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } })();
  function keep(s, quiet) {
    session = s && s.access_token ? {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600),
      user: { id: s.user.id, email: s.user.email || null, is_anonymous: !!s.user.is_anonymous },
    } : null;
    try {
      if (session) localStorage.setItem(KEY, JSON.stringify(session));
      else localStorage.removeItem(KEY);
    } catch (e) { /* sin guardado: la sesión dura lo que la pestaña */ }
    if (!quiet) listeners.forEach((fn) => fn(session));
  }
  const listeners = new Set();

  async function auth(path, body, opts) {
    const res = await fetch(CFG.url + '/auth/v1/' + path, {
      method: (opts && opts.method) || 'POST',
      headers: Object.assign({ apikey: CFG.anon, 'Content-Type': 'application/json' },
        opts && opts.token ? { Authorization: 'Bearer ' + opts.token } : {}),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new CloudError(data.error_code || data.code || 'auth', Object.assign({ status: res.status }, data));
    return data;
  }

  // La sesión vigente; se renueva sola si está por vencer.
  let refreshing = null;
  async function current() {
    if (!session) return null;
    if (session.expires_at - 60 > Date.now() / 1000) return session;
    if (!refreshing) {
      refreshing = auth('token?grant_type=refresh_token', { refresh_token: session.refresh_token })
        .then(keep)
        .catch((e) => { if (e.data.status === 400 || e.data.status === 401) keep(null); })
        .finally(() => { refreshing = null; });
    }
    await refreshing;
    return session;
  }
  // Para reservar no hace falta registrarse: se crea una sesión anónima.
  async function ensure() {
    const s = await current();
    if (s) return s;
    keep(await auth('signup', { data: {} }));
    return session;
  }

  // ————————————————————————————————— Registro e ingreso con código
  // Paso 1: pedir el código. Si la sesión es anónima, el correo se le agrega a esa misma cuenta
  // (todo lo reservado sigue siendo suyo). Si ese correo ya tiene cuenta, se entra a ella.
  // Devuelve el modo con el que hay que verificar el código.
  async function sendCode(email) {
    const s = await current();
    if (s && s.user.is_anonymous) {
      try {
        await auth('user', { email }, { method: 'PUT', token: s.access_token });
        return 'link';
      } catch (e) {
        if (!/exists|registered/i.test(e.code + ' ' + (e.data.msg || e.data.message || ''))) throw e;
      }
    }
    await auth('otp', { email, create_user: true });
    return 'login';
  }
  // Paso 2: el código de 6 dígitos. En modo 'login' la sesión cambia de cuenta; lo reservado
  // como anónimo pasa a ella (claim).
  async function verifyCode(email, token, mode) {
    const before = session;
    const out = await auth('verify', { type: mode === 'link' ? 'email_change' : 'email', email, token });
    // se avisa del cambio de cuenta cuando lo reservado ya pasó a ella
    keep(out, true);
    try {
      if (mode === 'login' && before && before.user.is_anonymous && before.user.id !== session.user.id) {
        await call('claim', { anon: before.access_token }).catch((e) => {
          if (e.code !== 'not_found') throw e; // sin reserva anónima: nada que pasar
        });
      }
    } finally {
      listeners.forEach((fn) => fn(session));
    }
    return session;
  }
  async function signOut() {
    const s = session;
    keep(null);
    if (s) auth('logout', null, { token: s.access_token }).catch(() => {});
  }

  // ————————————————————————————————— API del edificio
  let skew = 0; // reloj del servidor − reloj de aquí (ms)
  async function call(action, body) {
    const s = await current();
    const res = await fetch(CFG.api + action, {
      method: body !== undefined ? 'POST' : 'GET',
      headers: Object.assign({ 'Content-Type': 'application/json' }, s ? { Authorization: 'Bearer ' + s.access_token } : {}),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'network' }));
    if (data.now) skew = Date.parse(data.now) - Date.now();
    if (!data.ok) throw new CloudError(data.error || 'server', data);
    return data;
  }

  TGL.cloud = {
    CloudError,
    get session() { return session; },
    get user() { return session ? session.user : null; },
    get registered() { return !!(session && !session.user.is_anonymous && session.user.email); },
    now: () => Date.now() + skew,
    onSession: (fn) => listeners.add(fn),
    ensure, current, sendCode, verifyCode, signOut,
    version: () => call('version'),
    building: () => call('building'),
    mine: () => call('mine'),
    hold: (body) => ensure().then(() => call('hold', body)),
    move: (body) => call('move', body),
    saveDoc: (id, doc) => call('doc', { id, doc }),
    publish: (id, doc) => call('publish', { id, doc }),
    release: (id) => call('release', { id }),
    extend: (id) => call('extend', { id }),
  };
})();
