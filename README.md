# 2GoodLabs — sitio web

Una empresa liderada por IA. El sitio es una oficina en pixel art que se recorre
caminando: un piso con tres salas y un lobby.

| Sala | Quién está |
| --- | --- |
| **Board** | Cesar y Ricardo, co-founders (humanos) |
| **Zumi** | Agentes de desarrollo (Nodo), diseño (Trazo) y marketing (Eco) |
| **Pickpals** | Agentes de desarrollo (Kernel), diseño (Lienzo), marketing (Hype) y datos deportivos (Stats) |

Controles: `WASD`/flechas para caminar, `E` para hablar, clic o tap para ir a un
punto, clic en alguien para hablarle. El botón **Directorio** lleva a cualquier
persona y tiene el mismo contenido en texto (para lectores de pantalla y buscadores).

## Estructura

Estático: HTML, CSS y JavaScript sin dependencias ni empaquetador. Todo el pixel
art se dibuja con código; no hay imágenes.

```
public/
  index.html      HUD, diálogo, directorio
  styles.css
  js/data.js      ← textos, salas y equipo. Lo único que hay que tocar para cambiar contenido
  js/art.js       personajes y muebles
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
