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
punto, clic en alguien para hablarle. En pantallas táctiles, arrastrar el dedo
muestra un joystick bajo el dedo (analógico: más lejos, más rápido); un toque sin
arrastrar sigue siendo "ir a ese punto". Zoom con `+`/`−`, la rueda del mouse, pellizco
en el celular o los botones junto al minimapa; `0` o ⛶ muestra el piso completo.

Cada sala tiene un bloque **?** con información de la empresa y un botón a su sitio
(zumiapp.co, pickpals.co). En Zumi también hay un cartel para descargar la app en el App Store. Los letreros de Zumi y Pickpals también tienen el link debajo.

Idiomas: inglés en `/` (por defecto) y español en `/es/`. El selector EN/ES cambia sin
recargar y actualiza la URL. La elección se recuerda: quien eligió español y vuelve a la
portada (`/`) es redirigido a `/es/` antes de cargar nada. Una URL explícita (`/es/`,
`?lang=`) siempre manda. Las direcciones viejas `/en/` redirigen a `/` (en el Worker).
Los recursos se referencian con rutas absolutas (`/js/…`), así que hay que servir `public/`
como raíz.

**Vista simple**: el botón de arriba muestra todo como una página normal, sin juego, con
el formulario de contacto. Sin JavaScript es lo que se ve. El botón **Directorio** lleva a cualquier
persona y tiene el mismo contenido en texto (para lectores de pantalla y buscadores).

## Editor de oficinas (beta)

Un módulo aparte, en `public/editor/`, para arrendar y personalizar espacios en la zona de
arriendo: oficinas y puestos en el coworking. Una cuenta (por ahora este navegador, con su
correo en `tgl-account`) puede arrendar varios (`tgl-myspace`); cada uno se arrienda y se
personaliza por separado. "+ Arrendar un espacio" siempre arrienda uno nuevo; para
personalizar hay que estar en el espacio (aparece "✎ Personalizar …"), y "Mis espacios"
lleva a cada uno. Dos momentos, los dos paso a paso:

1. **Arrendar**: qué (puesto u oficina) → tamaño → dónde (solo lugares que cumplen las
   normas) → confirmar.
2. **Personalizar**: marca → estilo → muebles → personas (un puesto: marca → personas).
   Cambiar de tamaño o de lugar, o pasar de puesto a oficina, vuelve al paso a paso
   (menú ⋯) y conserva lo personalizado que quepa.

Se enciende y apaga en `public/js/features.js`:

| `editor:` | Qué pasa |
| --- | --- |
| `false` | Apagado: sus archivos ni se cargan |
| `'preview'` (actual) | Solo para quien entra con `?editor=1` (se recuerda hasta `?editor=0`) |
| `true` | Encendido para todos |

Qué incluye, pensado para que escale a un producto:

- **Cada espacio es un documento JSON** con versión de esquema (`editor/space.js`): tipo
  (oficina o puesto), tamaño y lugar, identidad, superficies, ambiente, objetos, personas y
  contenido. Es lo que guardaría el servidor. Los guardados de versiones anteriores se migran.
- **Zona de arriendo** (`world.zone`): con el editor encendido, el piso de arriba del
  edificio (donde están las oficinas 101–103 para el público) es la zona de arriendo: el
  coworking (15 m, 10 puestos) a la izquierda y planta libre corrida de 36 m, donde caben
  oficinas S, M, L y XL. Ahí los pasillos verticales llegan solo hasta el pasillo
  horizontal. Un pasillo recorre todo el lado izquierdo del edificio, de arriba al lobby.
- **Lo que se vende es espacio**: 1 casilla = 1 m². Una oficina mide de 8 a 24 m de ancho
  por 8 de fondo (atajos S 8, M 12, L 16, XL 24) y en ella caben ⌈0,9 × ancho⌉ personas y
  2 × ancho objetos. Un puesto en el coworking (4 m²) es para una persona y un agente, y se
  puede pasar a una oficina llevándose la marca, los links y la gente. Piso completo
  (768 m²): próximamente. Precio de ejemplo: US$ 0,25 por m² al mes; puesto US$ 5.
- **Normas del piso**: los pasillos son del edificio y no se venden; toda oficina tiene la
  puerta sobre el pasillo de abajo de su fila; entre una oficina y la planta libre u otra
  oficina hay siempre un pasillo de 2 m que cruza la fila (en la fila B sube hasta el
  pasillo del medio, así siempre se llega a la fila A); junto a una oficina quedan 0 m o al
  menos 8 m libres (sin retazos). El editor solo acepta lugares y anchos que las cumplen.
- **Catálogo** (`editor/catalog.js`): objetos con tamaño, categoría, versiones y
  nivel `free` / `pro`; patrones de piso y pared; ambientes; tamaños y puesto. El editor
  muestra cuánto PRO usa cada espacio.
- **Color libre** en pisos, paredes, muebles, marca y personas (selector, código hex,
  colores de la marca y paleta). Los patrones se dibujan con el color elegido
  (`js/world.js`) y los muebles se recolorean conservando sus luces y sombras
  (`TGL.color.recolor` en `js/art.js`, con la lista `tint` de cada objeto). Los espacios
  guardados con el esquema 1 se migran solos.
- **Reglas**: dentro de la sala, sin choques, la entrada libre y todo alcanzable a pie.
- **Herramientas**: plantillas, deshacer/rehacer, vista "Probar", guardar, y
  exportar/importar JSON (útil para armar a mano los espacios de los primeros clientes).

Las personas que se agregan aparecen en la oficina con sus burbujas y en el directorio, y el
bloque "?" muestra la descripción y los links del espacio.

## Estructura

Estático: HTML, CSS y JavaScript sin dependencias. Todo el pixel art se dibuja con
código. Un Worker de Cloudflare sirve `public/`, redirige los dominios y envía el
formulario de contacto.

```
src/index.html      plantilla de la página (editar aquí, no en public/*.html)
build.js            genera public/index.html (en), public/es/index.html, sitemap y robots
worker/index.js     redirección www → 2goodlabs.com y POST /api/contact
worker/api.js       API del edificio compartido (reservas, publicar) sobre Supabase
supabase/migrations base de datos (tablas, permisos, vencimiento de reservas)
tests/              node --test tests/*.test.*
public/
  js/data.js        ← textos (es/en), salas y equipo. Lo único que hay que tocar para cambiar contenido
  js/i18n.js        textos de la interfaz y cambio de idioma
  js/simple.js      vista simple (página normal sin juego) y formulario de contacto
  js/art.js         personajes y muebles comunes
  js/art-rooms.js   arte propio de cada sala
  js/world.js       plano del piso, colisiones y capa estática
  js/game.js        bucle, movimiento, cámara, minimapa e interacción
  js/features.js    interruptores de módulos en desarrollo
  js/rules.js       normas del piso, catálogo como datos y validación (navegador y Worker)
  editor/           editor de oficinas (beta): catálogo, documento del espacio e interfaz
  og.png, logo.png  imagen para compartir y logo para buscadores
```

El edificio tiene dos plantas de oficinas separadas por pasillos con puertas: arriba,
tres oficinas en arriendo (101, 102 y 103), con un buzón que abre el contacto con el mensaje
ya escrito; abajo, Board, Zumi y Pickpals; y el lobby en la planta baja. Las salas y los
pasillos se definen en `TGL.rooms` (`data.js`) y los muebles de cada sala se ubican relativos
a su esquina (`inRoom` en `world.js`), así una sala se puede mover sin reubicar cada mueble.

Para agregar un agente: una entrada nueva en `TGL.team` (`data.js`), con su posición
relativa a la sala, y si necesita escritorio, una línea `desk(...)` dentro del `inRoom` de
esa sala en `world.js`. Todo se mide en tiles de 16 px.

## Build

Después de cambiar `src/index.html` o cualquier archivo de `public/js` o `public/styles.css`:

```bash
node build.js
```

y commitear el resultado. Genera una página por idioma (`/` y `/es/`) con el contenido
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

El sitio vive en **2goodlabs.com**, conectado como dominio propio del Worker en
`wrangler.jsonc`. Si más adelante se agrega `www.2goodlabs.com` (en `routes`), el worker
ya lo redirige al dominio principal. Para cambiar de dominio: `routes` en
`wrangler.jsonc`, `PRIMARY` en `worker/index.js` y `TGL.company.url` en `data.js`, y
luego `node build.js`.

## Contacto

El formulario (en la vista simple y en el buzón rojo del lobby) envía un correo con
[Email Routing](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/) de Cloudflare. Una sola vez:

1. En Cloudflare, `2goodlabs.com` → **Email** → **Email Routing** → activarlo.
2. En **Destination addresses**, agregar el correo donde quieren recibir los mensajes y
   verificarlo (llega un correo de confirmación).
3. En **Workers & Pages** → **2goodlabs** → **Settings** → **Variables and Secrets** →
   **Add**: tipo **Secret**, nombre `CONTACT_TO`, valor ese correo. Va como secreto y no en
   `wrangler.jsonc` para que el correo no quede en el repositorio; los secretos se
   conservan entre deploys.
   `CONTACT_FROM` puede quedar como `contacto@2goodlabs.com`.
4. No hace falta redeploy: el secreto aplica de inmediato.

Los mensajes llegan con *Reply-To* de quien escribió, así que basta con responder.
Hay un campo trampa oculto contra bots; si llega spam, el siguiente paso es
[Turnstile](https://developers.cloudflare.com/turnstile/).

## Edificio compartido (backend, en construcción)

Cualquiera puede reservar un lugar y armar su espacio; la reserva dura 20 minutos (se puede
alargar 10 una vez) y los demás la ven como "reservado". Para publicar hay que registrarse
con un código que llega al correo. Lo que se publica queda en el edificio para todos.

- **Supabase**: cuentas (anónimas para reservar; correo con código o Google para publicar)
  y base de datos. La estructura está en `supabase/migrations/`: se aplica una vez pegándola
  en el SQL Editor. Las reservas vencidas se borran solas cada minuto (pg_cron).
- **Worker** (`worker/api.js`): decide con `public/js/rules.js`, las mismas normas del
  editor, y guarda con la llave `service_role`, que va como secreto
  `SUPABASE_SERVICE_ROLE_KEY` en Cloudflare (nunca en el repositorio). Si dos personas piden
  el mismo lugar a la vez, la base acepta solo a una (versión por piso).
- **Pruebas**: `node --test tests/*.test.*`. Las de la API corren contra un Postgres local
  con la migración aplicada si se define `PGTEST` (ver `tests/api.test.mjs`).

## SEO

- Una URL por idioma con `hreflang`, `canonical` y `sitemap.xml`.
- La vista simple está en el HTML: quién somos, fundadores, productos, agentes.
- Datos estructurados (JSON-LD): la organización, Cesar y Ricardo como fundadores y
  Zumi y Pickpals como sus productos.
- `og.png` para que el link se vea bien al compartirlo.

Pendiente fuera del código: registrar `2goodlabs.com` en
[Google Search Console](https://search.google.com/search-console) y enviar el sitemap, y
enlazar a 2goodlabs.com desde zumiapp.co y pickpals.co ("Un producto de 2GoodLabs").

`og.png` es una captura de la oficina y `logo.png` un logo provisional; si cambia el
diseño, conviene regenerarlos.
