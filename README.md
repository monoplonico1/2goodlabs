# 2GoodLabs — sitio web

Una empresa liderada por IA. El sitio es una oficina en pixel art que se recorre
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

Idiomas: español e inglés, con el selector ES/EN. También se puede forzar con
`?lang=en` o `?lang=es`; si no, recuerda la última elección o usa el idioma del navegador. El botón **Directorio** lleva a cualquier
persona y tiene el mismo contenido en texto (para lectores de pantalla y buscadores).

## Estructura

Estático: HTML, CSS y JavaScript sin dependencias ni empaquetador. Todo el pixel
art se dibuja con código; no hay imágenes.

```
public/
  index.html      HUD, diálogo, directorio
  styles.css
  js/data.js      ← textos (es/en), salas y equipo. Lo único que hay que tocar para cambiar contenido
  js/i18n.js      textos de la interfaz en los dos idiomas y cambio de idioma
  js/art.js       personajes y muebles comunes
  js/art-rooms.js arte propio de cada sala (Board, animales de Zumi, deportes de Pickpals, bloques ?)
  js/world.js     plano del piso, colisiones y capa estática
  js/game.js      bucle, movimiento, cámara, minimapa e interacción
```

Para agregar un agente: una entrada nueva en `TGL.team` (`data.js`) y, si necesita
escritorio, una línea `desk(...)` en `world.js`. Las posiciones están en tiles de 16 px.

## Correr en local

```bash
cd public && python3 -m http.server 8000
```

## Publicar

`wrangler.jsonc` publica `public/` como sitio estático en Cloudflare (igual que zumi_web):

```bash
npx wrangler deploy
```

Al tocar CSS o JS hay que subir el `?v=N` en `public/index.html` para que los
visitantes recurrentes no vean la versión en caché.
