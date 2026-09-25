// Worker de Cloudflare: sirve public/ y además
//   1. redirige 2goodlabs.com y los www al dominio principal (2goodlabs.io);
//   2. recibe el formulario de contacto (POST /api/contact) y lo envía por correo
//      con Email Routing de Cloudflare (binding CONTACT_EMAIL, ver wrangler.jsonc).

import { EmailMessage } from 'cloudflare:email';

const PRIMARY = '2goodlabs.io';
const REDIRECT_HOSTS = ['2goodlabs.com', 'www.2goodlabs.com', 'www.2goodlabs.io'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (REDIRECT_HOSTS.includes(url.hostname)) {
      url.hostname = PRIMARY;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/contact') return contact(request, env);

    return env.ASSETS.fetch(request);
  },
};

// ————————————————————————————————— Contacto

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

async function contact(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });

  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  // Sin JavaScript el formulario hace un POST normal: devolvemos al visitante a la página.
  const reply = (ok, status) => {
    if (wantsJson) return Response.json({ ok }, { status });
    const back = new URL(request.headers.get('Referer') || '/', request.url);
    back.search = 'contacto=' + (ok ? 'ok' : 'error');
    back.hash = 'contacto';
    return Response.redirect(back.toString(), 303);
  };

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 400);
  }
  const field = (k, max) => String(form.get(k) || '').trim().slice(0, max);
  const name = field('name', 100).replace(/[\r\n]+/g, ' ');
  const email = field('email', 200);
  const message = field('message', 5000);
  const lang = field('lang', 5) === 'en' ? 'en' : 'es';

  // Campo trampa: las personas no lo ven; si viene lleno es un bot. Fingimos éxito.
  if (field('website', 200)) return reply(true, 200);
  if (!name || !message || !EMAIL_RE.test(email)) return reply(false, 400);

  if (!env.CONTACT_EMAIL || !env.CONTACT_FROM || !env.CONTACT_TO) {
    console.error('Contacto sin configurar: faltan CONTACT_EMAIL, CONTACT_FROM o CONTACT_TO');
    return reply(false, 503);
  }

  const body = [
    `Nombre: ${name}`,
    `Correo: ${email}`,
    `Idioma: ${lang}`,
    `Página: ${request.headers.get('Referer') || '-'}`,
    '',
    message,
  ].join('\n');

  const raw = [
    `From: 2GoodLabs <${env.CONTACT_FROM}>`,
    `To: ${env.CONTACT_TO}`,
    `Reply-To: ${email}`,
    `Subject: ${encodeHeader('Contacto 2GoodLabs: ' + name)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${PRIMARY}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(body).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');

  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    console.error('No se pudo enviar el correo de contacto', err);
    return reply(false, 502);
  }
  return reply(true, 200);
}

function base64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// Asuntos con acentos: codificación MIME (RFC 2047).
function encodeHeader(text) {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${base64(text)}?=`;
}
