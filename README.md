# 2GoodLabs — sitio web

Laboratorio de producto de Cesar y Ricardo, dos diseñadores de producto y UX que usan IA como herramienta principal. El sitio es una oficina en pixel art que se recorre
caminando: un piso con tres salas y un lobby.

| Sala | Quién está |
| --- | --- |
| **Board** | Cesar y Ricardo, co-founders (humanos) |
| **Zumi** | Agentes de desarrollo (Nodo), diseño (Trazo) y marketing (Eco) |
| **Pickpals** | Agentes de desarrollo (Kernel), diseño (Lienzo), marketing (Hype) y datos deportivos (Stats) |
| **Terraza** | Al aire libre, a la derecha de Pickpals y del lobby: mesas con sombrilla, barra y luces |

Todos se toman 5 minutos de descanso por hora en la terraza (hora local del
visitante), en parejas: desarrollo a las :00, diseño a las :15, marketing a las :30,
Stats a las :45 y Cesar y Ricardo a las :50. Se configura con `breakAt` en `data.js`. Para verlo sin
esperar: `?break=all` o `?break=<id>` (por ejemplo `?break=stats`).

Controles: `WASD`/flechas para caminar, `E` para hablar, clic o tap para ir a un
punto, clic en alguien para hablarle. Zoom con `+`/`−`, la rueda del mouse, pellizco
en el celular o los botones junto al minimapa; `0` o ⛶ muestra el piso completo.

Cada sala tiene un bloque **?** con información de la empresa y un botón a su sitio
(zumiapp.co, pickpals.co). En Zumi también hay un cartel para descargar la app en el App Store. Los letreros de Zumi y Pickpals también tienen el link debajo.

Idiomas: español en `/` e inglés en `/en/`. El selector ES/EN cambia sin recargar y
actualiza la URL; recuerda la última elección.

**Vista simple**: el botón de arriba muestra todo como una página normal, sin juego, con
el formulario de contacto. Sin JavaScript es lo que se ve. El botón **Directorio** lleva a cualquier
persona y tiene el mismo contenido en texto (para lectores de pantalla y buscadores).

## Estructura

Estático: HTML, CSS y JavaScript sin dependencias. Todo el pixel art se dibuja con
código. Un Worker de Cloudflare sirve `public/`, redirige los dominios y envía el
formulario de contacto.

```
src/index.html      plantilla de la página (editar aquí, no en public/*.html)
build.js            genera public/index.html (es), public/en/index.html, sitemap y robots
worker/index.js     redirecciones .com → .io y POST /api/contact
public/
  js/data.js        ← textos (es/en), salas y equipo. Lo único que hay que tocar para cambiar contenido
  js/i18n.js        textos de la interfaz y cambio de idioma
  js/simple.js      vista simple (página normal sin juego) y formulario de contacto
  js/art.js         personajes y muebles comunes
  js/art-rooms.js   arte propio de cada sala
  js/world.js       plano del piso, colisiones y capa estática
  js/game.js        bucle, movimiento, cámara, minimapa e interacción
  og.png, logo.png  imagen para compartir y logo para buscadores
```

Para agregar un agente: una entrada nueva en `TGL.team` (`data.js`) y, si necesita
escritorio, una línea `desk(...)` en `world.js`. Las posiciones están en tiles de 16 px.

## Build

Después de cambiar `src/index.html` o cualquier archivo de `public/js` o `public/styles.css`:

```bash
node build.js
```

y commitear el resultado. Genera una página por idioma (`/` y `/en/`) con el contenido
de la vista simple ya escrito en el HTML, así los buscadores lo leen sin ejecutar el
juego. También versiona los CSS/JS por su contenido (`?v=…`), así que ya no hay que
subir números a mano.

## Correr en local

```bash
cd public && python3 -m http.server 8000     # solo la página
npx wrangler dev                              # página + worker (contacto y redirecciones)
```

Con `wrangler dev` el formulario no envía correos de verdad: los guarda como `.eml` en
`.wrangler/tmp/` y lo avisa en la consola.

## Publicar

```bash
npx wrangler deploy
```

`wrangler.jsonc` conecta los cuatro dominios (`2goodlabs.io`, `2goodlabs.com` y sus
`www`) como dominios propios del Worker. Los dos dominios tienen que estar en la misma
cuenta de Cloudflare. El principal es **2goodlabs.io**; los otros redirigen con 301.
Para cambiarlo: `PRIMARY` en `worker/index.js` y `TGL.company.url` en `data.js`.

## Contacto

El formulario (en la vista simple y en el buzón rojo del lobby) envía un correo con
[Email Routing](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/) de Cloudflare. Una sola vez:

1. En Cloudflare, `2goodlabs.io` → **Email** → **Email Routing** → activarlo.
2. En **Destination addresses**, agregar el correo donde quieren recibir los mensajes y
   verificarlo (llega un correo de confirmación).
3. En `wrangler.jsonc`, poner ese correo en `CONTACT_TO` (hoy dice `CAMBIAR@ejemplo.com`).
   `CONTACT_FROM` puede quedar como `contacto@2goodlabs.io`.
4. `npx wrangler deploy`.

Los mensajes llegan con *Reply-To* de quien escribió, así que basta con responder.
Hay un campo trampa oculto contra bots; si llega spam, el siguiente paso es
[Turnstile](https://developers.cloudflare.com/turnstile/).

## SEO

- Una URL por idioma con `hreflang`, `canonical` y `sitemap.xml`.
- La vista simple está en el HTML: quién somos, fundadores, productos, agentes.
- Datos estructurados (JSON-LD): la organización, Cesar y Ricardo como fundadores y
  Zumi y Pickpals como sus productos.
- `og.png` para que el link se vea bien al compartirlo.

Pendiente fuera del código: registrar `2goodlabs.io` en
[Google Search Console](https://search.google.com/search-console) y enviar el sitemap, y
enlazar a 2goodlabs.io desde zumiapp.co y pickpals.co ("Un producto de 2GoodLabs").

`og.png` es una captura de la oficina y `logo.png` un logo provisional; si cambia el
diseño, conviene regenerarlos.
