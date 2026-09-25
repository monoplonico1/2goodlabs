// Genera las páginas publicadas a partir de src/index.html y de public/js/data.js:
//
//   public/index.html      español (/)
//   public/en/index.html   inglés (/en/)
//   public/sitemap.xml, public/robots.txt
//
// Cada idioma tiene su propia URL para que los buscadores indexen los dos, y la vista
// simple va escrita en el HTML para que el contenido se lea sin ejecutar el juego.
//
// Ejecutar después de cambiar src/index.html o cualquier archivo de public/js o
// public/styles.css, y commitear el resultado:  node build.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Carga el contenido (data.js, textos de i18n.js y la vista simple) sin navegador.
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['data.js', 'i18n.js', 'simple.js']) vm.runInContext(read('public/js/' + f), sandbox, { filename: f });
const TGL = sandbox.TGL;
const SITE = TGL.company.url.replace(/\/$/, '');

// Versión de los assets = huella de su contenido: cambia sola cuando cambian.
const assets = ['public/styles.css', ...fs.readdirSync(path.join(PUB, 'js')).sort().map((f) => 'public/js/' + f)];
const version = crypto.createHash('sha1').update(assets.map(read).join('\n')).digest('hex').slice(0, 8);

const LANGS = {
  es: { path: '/', base: '', out: 'index.html', ogLocale: 'es_ES', ogLocaleAlt: 'en_US' },
  en: { path: '/en/', base: '../', out: 'en/index.html', ogLocale: 'en_US', ogLocaleAlt: 'es_ES' },
};

const t = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);

function jsonld(lang) {
  const org = SITE + '/#org';
  const founders = TGL.team.filter((m) => m.kind === 'human');
  const products = TGL.rooms.filter((r) => r.link);
  const graph = [
    {
      '@type': 'Organization',
      '@id': org,
      name: '2GoodLabs',
      url: SITE + '/',
      logo: SITE + '/logo.png',
      description: t(TGL.company.about, lang),
      founder: founders.map((m) => ({ '@id': SITE + '/#' + m.id })),
    },
    ...founders.map((m) => ({
      '@type': 'Person',
      '@id': SITE + '/#' + m.id,
      name: m.name,
      jobTitle: t(m.title, lang),
      worksFor: { '@id': org },
      ...(m.links && m.links.length ? { url: m.links[0], sameAs: m.links } : {}),
    })),
    ...products.map((r) => ({
      '@type': r.appStore ? 'MobileApplication' : 'WebApplication',
      name: t(r.name, lang),
      url: r.link,
      description: t(r.info, lang),
      applicationCategory: r.id === 'zumi' ? 'HealthApplication' : 'SportsApplication',
      ...(r.appStore ? { operatingSystem: 'iOS', installUrl: r.appStore, sameAs: [r.appStore] } : { operatingSystem: 'Web' }),
      publisher: { '@id': org },
    })),
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: '2GoodLabs',
      inLanguage: Object.keys(LANGS),
      publisher: { '@id': org },
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c')
    .split('\n')
    .map((l) => '  ' + l)
    .join('\n');
}

const alternates = [
  ...Object.entries(LANGS).map(([l, c]) => `  <link rel="alternate" hreflang="${l}" href="${SITE}${c.path}">`),
  `  <link rel="alternate" hreflang="x-default" href="${SITE}/">`,
].join('\n');

const template = read('src/index.html').replace(/<!--\s*Plantilla[\s\S]*?-->\n/, '');

for (const [lang, c] of Object.entries(LANGS)) {
  const ui = TGL.uiStrings[lang];
  const html = template
    .replace(/\{\{t:(\w+)\}\}/g, (_, k) => {
      if (ui[k] === undefined) throw new Error('Falta el texto "' + k + '" en i18n.js');
      return String(ui[k]).replace(/"/g, '&quot;');
    })
    .replace(/\{\{lang\}\}/g, lang)
    .replace(/\{\{base\}\}/g, c.base)
    .replace(/\{\{v\}\}/g, version)
    .replace(/\{\{site\}\}/g, SITE)
    .replace(/\{\{canonical\}\}/g, SITE + c.path)
    .replace(/\{\{ogLocale\}\}/g, c.ogLocale)
    .replace(/\{\{ogLocaleAlt\}\}/g, c.ogLocaleAlt)
    .replace('{{alternates}}', alternates)
    .replace('{{jsonld}}', jsonld(lang))
    .replace('{{simple}}', TGL.renderSimple(lang).replace(/^\n/, ''));
  const leftover = html.match(/\{\{[^}]+\}\}/);
  if (leftover) throw new Error('Marcador sin reemplazar: ' + leftover[0]);
  const out = path.join(PUB, c.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, '<!-- Generado por build.js a partir de src/index.html. No editar a mano. -->\n' + html);
}

const today = new Date().toISOString().slice(0, 10);
const links = Object.entries(LANGS)
  .map(([l, c]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${c.path}"/>`)
  .join('\n');
fs.writeFileSync(
  path.join(PUB, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(LANGS)
  .map((c) => `  <url>\n    <loc>${SITE}${c.path}</loc>\n    <lastmod>${today}</lastmod>\n${links}\n  </url>`)
  .join('\n')}
</urlset>
`,
);
fs.writeFileSync(path.join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Listo (v=${version}): public/index.html, public/en/index.html, sitemap.xml, robots.txt`);
