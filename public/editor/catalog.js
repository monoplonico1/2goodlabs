// Catálogo del editor de oficinas: todo lo que se puede poner en un espacio.
//
// Cada objeto: type (id estable, va guardado en los espacios), nombre, tamaño en tiles,
// tier ('free' | 'pro', base para cobrar por diferenciadores), categoría y make(variant)
// que devuelve el sprite. "variants" son versiones del mismo objeto. El color es libre:
// "paint" = el sprite recibe el color directo; "tint" = colores del material que se recolorean.

(function () {
  const art = TGL.art;
  const N = (es, en) => ({ es, en });

  // Paletas de materiales que se pueden recolorear (el primero es el tono base).
  const WOOD = ['#a8743f', '#c48a50', '#7a5230', '#5c3d22'];
  const WOOD_DARK = ['#7a5230', '#c48a50', '#a8743f', '#3d2816'];
  const WHITE = ['#f5f5f7', '#ffffff', '#dcdce2', '#e9e9ee', '#cfd0d6', '#d0d0d6', '#e2e2e8'];

  const items = [
    // Información del espacio: abre el panel con la descripción y los links. Va primero.
    { type: 'info', name: N('Bloque ? (información)', '? block (info)'), cat: 'work', w: 1, h: 1, tier: 'free',
      make: () => art.qblock(), anim: art.qblockAnim, info: true, preview: qPreview },

    // Escritorios y trabajo
    { type: 'desk', name: N('Escritorio', 'Desk'), cat: 'work', w: 2, h: 1, tier: 'free',
      tint: WOOD, make: () => art.desk(2), anim: art.deskScreens(undefined, 'dev') },
    { type: 'desk-imac', name: N('Escritorio todo en uno', 'All-in-one desk'), cat: 'work', w: 2, h: 1, tier: 'pro',
      tint: WHITE, make: () => art.imacDesk(), anim: art.imacScreen },
    { type: 'desk-dual', name: N('Estación doble pantalla', 'Dual-screen station'), cat: 'work', w: 3, h: 1, tier: 'pro',
      tint: WOOD, make: () => art.desk(3, 'dual'), anim: art.deskScreens('dual', 'data') },
    { type: 'chair', name: N('Silla', 'Chair'), cat: 'work', w: 1, h: 1, tier: 'free', paint: '#3d5a8a',
      make: (v, c) => art.chair(c, 'down') },
    { type: 'chair-white', name: N('Silla blanca', 'White chair'), cat: 'work', w: 1, h: 1, tier: 'free',
      tint: ['#e9e9ee', '#ffffff', '#f5f5f7', '#cfd0d6'], make: () => art.whiteChair('down') },
    { type: 'table', name: N('Mesa', 'Table'), cat: 'work', w: 2, h: 1, tier: 'free', tint: WOOD, make: () => art.table(2, 1) },
    { type: 'table-meeting', name: N('Mesa de reuniones', 'Meeting table'), cat: 'work', w: 3, h: 2, tier: 'free', tint: WOOD,
      make: () => art.table(3, 2) },
    { type: 'table-oak', name: N('Mesa de roble con portátiles', 'Oak table with laptops'), cat: 'work', w: 4, h: 3, tier: 'pro',
      tint: ['#dcc39a', '#d4b98e', '#ecdcbf', '#b99a6c'], make: () => art.oakTable(4, 3), anim: art.oakTableScreens(4, 3) },
    { type: 'whiteboard', name: N('Pizarra', 'Whiteboard'), cat: 'work', w: 2, h: 1, tier: 'free',
      variants: ['roadmap', 'chart', 'kanban', 'moodboard'], tint: ['#9aa1ab', '#8a8f98'], make: (v) => art.whiteboard(2, v) },
    { type: 'display', name: N('Pantalla de métricas', 'Metrics display'), cat: 'tech', w: 2, h: 1, tier: 'pro',
      make: () => art.displayStand(), anim: art.displayChart },
    { type: 'server', name: N('Servidor', 'Server rack'), cat: 'tech', w: 1, h: 1, tier: 'pro',
      tint: ['#23272f', '#4a4f58', '#343a45'], make: () => art.serverRack(), anim: art.serverLeds },
    { type: 'printer', name: N('Impresora', 'Printer'), cat: 'tech', w: 1, h: 1, tier: 'free',
      tint: ['#d9dde3', '#ffffff', '#c3c9d2', '#8a8f98'], make: () => art.printer() },
    { type: 'tv-sports', name: N('Pantallas con deportes', 'Sports screens'), cat: 'tech', w: 4, h: 1, tier: 'pro',
      tint: ['#3a2c22', '#5a4636', '#2c2119'], make: () => art.tvConsole(4), anim: art.tvConsoleScreens(4, ['soccer', 'basket']) },

    // Descanso
    { type: 'sofa', name: N('Sofá', 'Sofa'), cat: 'lounge', w: 3, h: 1, tier: 'free', paint: '#6a4c93',
      make: (v, c) => art.sofa(3, c) },
    { type: 'coffee', name: N('Barra de café', 'Coffee bar'), cat: 'lounge', w: 3, h: 1, tier: 'free',
      tint: ['#8a6a4a', '#6b4f35', '#5c4330'], make: () => art.coffeeCounter(3) },
    { type: 'fridge', name: N('Nevera', 'Fridge'), cat: 'lounge', w: 1, h: 1, tier: 'free',
      tint: ['#dfe4ea', '#ffffff', '#aab2be'], make: () => art.fridge() },
    { type: 'water', name: N('Dispensador de agua', 'Water cooler'), cat: 'lounge', w: 1, h: 1, tier: 'free',
      tint: ['#e6e9ee', '#ffffff', '#c3c9d2', '#aab2be'], make: () => art.waterCooler() },
    { type: 'pingpong', name: N('Ping-pong', 'Ping-pong'), cat: 'lounge', w: 4, h: 2, tier: 'pro',
      tint: ['#1f6f45', '#15503a'], make: () => art.pingPong(), anim: art.pingPongPlay },
    { type: 'bookshelf', name: N('Biblioteca', 'Bookshelf'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      tint: WOOD_DARK, make: () => art.bookshelf(2, 7) },
    { type: 'shelf-white', name: N('Repisa blanca', 'White shelf'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      tint: WHITE, make: () => art.whiteShelf(2) },
    { type: 'trophies', name: N('Trofeos', 'Trophies'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      tint: WOOD_DARK, make: () => art.trophyShelf() },
    { type: 'rug', name: N('Tapete', 'Rug'), cat: 'lounge', w: 3, h: 2, tier: 'free', solid: false, floor: true,
      tint: ['#f4e2d0', '#efd6bd', '#d9a77a'], make: () => art.pawRug(3, 2) },

    // Naturaleza y mascotas
    { type: 'plant', name: N('Planta', 'Plant'), cat: 'nature', w: 1, h: 1, tier: 'free',
      tint: ['#b5652f', '#c97a3e', '#8c4a20'], make: () => art.plant(5) },
    { type: 'plant-white', name: N('Planta en maceta blanca', 'Plant, white pot'), cat: 'nature', w: 1, h: 1, tier: 'free',
      tint: ['#f5f5f7', '#ffffff', '#dcdce2'], make: () => art.whitePlant(2) },
    { type: 'tree', name: N('Árbol', 'Tree'), cat: 'nature', w: 2, h: 1, tier: 'pro', make: () => art.tree(4) },
    { type: 'aquarium', name: N('Pecera', 'Aquarium'), cat: 'nature', w: 2, h: 1, tier: 'pro',
      tint: ['#2c4a35', '#3f6b4c', '#244030'], make: () => art.aquarium(), anim: art.fish },
    { type: 'birdcage', name: N('Loro', 'Parrot'), cat: 'nature', w: 1, h: 1, tier: 'pro',
      make: () => art.birdcage(), anim: art.parrot },
    { type: 'cat', name: N('Gato durmiendo', 'Sleeping cat'), cat: 'nature', w: 2, h: 1, tier: 'pro',
      tint: ['#b5652f', '#8c4a20'], make: () => art.petBed(), anim: art.cat },

  ];

  // Superficies: un patrón (dibujo) + un color libre. Los patrones viven en js/world.js.
  const floors = [
    { id: 'plain', name: N('Liso', 'Plain'), tier: 'free', color: '#f1f1f3' },
    { id: 'speckle', name: N('Concreto / alfombra', 'Concrete / carpet'), tier: 'free', color: '#d9d9de' },
    { id: 'planks', name: N('Tablones', 'Planks'), tier: 'free', color: '#cfa06a' },
    { id: 'checker', name: N('Ajedrez', 'Checker'), tier: 'free', color: '#a9d3b3' },
    { id: 'tiles', name: N('Baldosas', 'Tiles'), tier: 'free', color: '#e8e2d6' },
    { id: 'herringbone', name: N('Espiga', 'Herringbone'), tier: 'pro', color: '#b98552' },
    { id: 'neon', name: N('Rejilla neón', 'Neon grid'), tier: 'pro', color: '#16131f' },
  ];
  const walls = [
    { id: 'plain', name: N('Lisa', 'Plain'), tier: 'free', color: '#f7f7f9' },
    { id: 'stripes', name: N('Rayas', 'Stripes'), tier: 'free', color: '#dde6f3' },
    { id: 'wainscot', name: N('Zócalo de madera', 'Wainscot'), tier: 'free', color: '#efe4d0' },
    { id: 'brick', name: N('Ladrillo', 'Brick'), tier: 'pro', color: '#b5654a' },
  ];
  const modes = [
    { id: 'day', name: N('Día', 'Day'), tier: 'free' },
    { id: 'night', name: N('Noche con neón', 'Neon night'), tier: 'pro' },
  ];

  const categories = [
    { id: 'all', name: N('Todo', 'All') },
    { id: 'work', name: N('Trabajo', 'Work') },
    { id: 'tech', name: N('Tecnología', 'Tech') },
    { id: 'lounge', name: N('Descanso', 'Lounge') },
    { id: 'nature', name: N('Naturaleza', 'Nature') },
  ];

  // Colores sugeridos. Además de estos, cualquier color sale del selector libre.
  const palettes = {
    floor: ['#f1f1f3', '#d9d9de', '#8c877e', '#2b2f3a', '#cfa06a', '#8a5a34', '#a9d3b3', '#2f3e5e', '#e9c8c8', '#f3e3b5'],
    wall: ['#f7f7f9', '#efe4d0', '#e2eedc', '#dde6f3', '#f6dcdc', '#fff1c7', '#c9b8e8', '#3a3d45', '#1b2a4a', '#b5654a'],
    item: ['#ffffff', '#d9d9de', '#2b2f3a', '#a8743f', '#5c3d22', '#2f5fc4', '#4dd6ff', '#3f8f5a', '#9cff57', '#6a4c93', '#ff6fa8', '#e04a4a', '#f2a65a', '#ffd24d'],
  };
  const people = {
    body: ['#3d5a8a', '#8a3b3b', '#3f8f5a', '#2f5fc4', '#6a4c93', '#e0a030', '#2b2f3a', '#d9d9de'],
    eye: ['#4dd6ff', '#ff6fa8', '#ffd24d', '#9cff57', '#ffffff', '#ff8a3d'],
    skin: ['#f0c49a', '#e0ac7e', '#c68a5a', '#8d5a3a', '#5c3b26'],
    hair: ['#2b1d14', '#6b4a2b', '#c9a24a', '#a83232', '#d9d9de', '#1d1f24'],
  };

  // Límites del plan base (en la versión de pago, otros planes subirían estos números).
  const plan = { maxItems: 30, maxResidents: 3, maxLinks: 4 };

  const byType = {};
  for (const it of items) byType[it.type] = it;

  // ¿Se le puede cambiar el color? Y cuál es el de fábrica.
  const colorable = (def) => !!(def.paint || def.tint);
  const baseColor = (def) => def.paint || (def.tint && def.tint[0]) || null;

  // Sprite de un objeto puesto, con su versión y su color. Se guarda en caché.
  const cache = new Map();
  function build(def, item) {
    const variant = item && item.variant != null ? item.variant : def.variants && def.variants[0];
    const color = (item && item.color) || null;
    const key = def.type + '|' + (variant || '') + '|' + (color || '');
    let sp = cache.get(key);
    if (sp) return sp;
    if (def.paint) sp = def.make(variant, color || def.paint);
    else {
      sp = def.make(variant);
      if (color && def.tint && color.toLowerCase() !== def.tint[0]) sp = Object.assign({}, sp, { canvas: TGL.color.recolor(sp.canvas, def.tint, color) });
    }
    if (cache.size > 300) cache.clear();
    cache.set(key, sp);
    return sp;
  }

  // El bloque "?" real es solo sombra + animación; para miniaturas y fantasma se dibuja un cuadro quieto.
  let qp = null;
  function qPreview() {
    if (qp) return qp;
    const top = 6, c = TGL.canvas(16, 16 + top), x = c.getContext('2d');
    x.drawImage(art.qblock().canvas, 0, top);
    art.qblockAnim(x, 0, top, 0.25);
    return (qp = { canvas: c, top });
  }

  TGL.catalog = { items, byType, floors, walls, modes, categories, people, palettes, plan, colorable, baseColor, build };
})();
