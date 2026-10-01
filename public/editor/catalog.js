// Catálogo del editor de oficinas: todo lo que se puede poner en un espacio.
//
// Cada objeto: type (id estable, va guardado en los espacios), nombre, tamaño en tiles,
// tier ('free' | 'pro', base para cobrar por diferenciadores), categoría y make(variant)
// que devuelve el sprite. "variants" son colores o versiones del mismo objeto.

(function () {
  const art = TGL.art;
  const N = (es, en) => ({ es, en });

  const COLORS = ['#3d5a8a', '#6b3a3a', '#3f8f5a', '#2b2f3a', '#6a4c93', '#c9c9ce', '#e04a4a', '#f2a65a'];

  const items = [
    // Escritorios y trabajo
    { type: 'desk', name: N('Escritorio', 'Desk'), cat: 'work', w: 2, h: 1, tier: 'free',
      make: () => art.desk(2), anim: art.deskScreens(undefined, 'dev') },
    { type: 'desk-imac', name: N('Escritorio todo en uno', 'All-in-one desk'), cat: 'work', w: 2, h: 1, tier: 'pro',
      make: () => art.imacDesk(), anim: art.imacScreen },
    { type: 'desk-dual', name: N('Estación doble pantalla', 'Dual-screen station'), cat: 'work', w: 3, h: 1, tier: 'pro',
      make: () => art.desk(3, 'dual'), anim: art.deskScreens('dual', 'data') },
    { type: 'chair', name: N('Silla', 'Chair'), cat: 'work', w: 1, h: 1, tier: 'free', variants: COLORS,
      make: (v) => art.chair(v, 'down') },
    { type: 'chair-white', name: N('Silla blanca', 'White chair'), cat: 'work', w: 1, h: 1, tier: 'free',
      make: () => art.whiteChair('down') },
    { type: 'table', name: N('Mesa', 'Table'), cat: 'work', w: 2, h: 1, tier: 'free', make: () => art.table(2, 1) },
    { type: 'table-meeting', name: N('Mesa de reuniones', 'Meeting table'), cat: 'work', w: 3, h: 2, tier: 'free',
      make: () => art.table(3, 2) },
    { type: 'table-oak', name: N('Mesa de roble con portátiles', 'Oak table with laptops'), cat: 'work', w: 4, h: 3, tier: 'pro',
      make: () => art.oakTable(4, 3), anim: art.oakTableScreens(4, 3) },
    { type: 'whiteboard', name: N('Pizarra', 'Whiteboard'), cat: 'work', w: 2, h: 1, tier: 'free',
      variants: ['roadmap', 'chart', 'kanban', 'moodboard'], make: (v) => art.whiteboard(2, v) },
    { type: 'display', name: N('Pantalla de métricas', 'Metrics display'), cat: 'tech', w: 2, h: 1, tier: 'pro',
      make: () => art.displayStand(), anim: art.displayChart },
    { type: 'server', name: N('Servidor', 'Server rack'), cat: 'tech', w: 1, h: 1, tier: 'pro',
      make: () => art.serverRack(), anim: art.serverLeds },
    { type: 'printer', name: N('Impresora', 'Printer'), cat: 'tech', w: 1, h: 1, tier: 'free', make: () => art.printer() },
    { type: 'tv-sports', name: N('Pantallas con deportes', 'Sports screens'), cat: 'tech', w: 4, h: 1, tier: 'pro',
      make: () => art.tvConsole(4), anim: art.tvConsoleScreens(4, ['soccer', 'basket']) },

    // Descanso
    { type: 'sofa', name: N('Sofá', 'Sofa'), cat: 'lounge', w: 3, h: 1, tier: 'free', variants: COLORS,
      make: (v) => art.sofa(3, v) },
    { type: 'coffee', name: N('Barra de café', 'Coffee bar'), cat: 'lounge', w: 3, h: 1, tier: 'free',
      make: () => art.coffeeCounter(3) },
    { type: 'fridge', name: N('Nevera', 'Fridge'), cat: 'lounge', w: 1, h: 1, tier: 'free', make: () => art.fridge() },
    { type: 'water', name: N('Dispensador de agua', 'Water cooler'), cat: 'lounge', w: 1, h: 1, tier: 'free',
      make: () => art.waterCooler() },
    { type: 'pingpong', name: N('Ping-pong', 'Ping-pong'), cat: 'lounge', w: 4, h: 2, tier: 'pro',
      make: () => art.pingPong(), anim: art.pingPongPlay },
    { type: 'bookshelf', name: N('Biblioteca', 'Bookshelf'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      make: () => art.bookshelf(2, 7) },
    { type: 'shelf-white', name: N('Repisa blanca', 'White shelf'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      make: () => art.whiteShelf(2) },
    { type: 'trophies', name: N('Trofeos', 'Trophies'), cat: 'lounge', w: 2, h: 1, tier: 'free',
      make: () => art.trophyShelf() },
    { type: 'rug', name: N('Tapete', 'Rug'), cat: 'lounge', w: 3, h: 2, tier: 'free', solid: false, floor: true,
      make: () => art.pawRug(3, 2) },

    // Naturaleza y mascotas
    { type: 'plant', name: N('Planta', 'Plant'), cat: 'nature', w: 1, h: 1, tier: 'free', make: () => art.plant(5) },
    { type: 'plant-white', name: N('Planta en maceta blanca', 'Plant, white pot'), cat: 'nature', w: 1, h: 1, tier: 'free',
      make: () => art.whitePlant(2) },
    { type: 'tree', name: N('Árbol', 'Tree'), cat: 'nature', w: 2, h: 1, tier: 'pro', make: () => art.tree(4) },
    { type: 'aquarium', name: N('Pecera', 'Aquarium'), cat: 'nature', w: 2, h: 1, tier: 'pro',
      make: () => art.aquarium(), anim: art.fish },
    { type: 'birdcage', name: N('Loro', 'Parrot'), cat: 'nature', w: 1, h: 1, tier: 'pro',
      make: () => art.birdcage(), anim: art.parrot },
    { type: 'cat', name: N('Gato durmiendo', 'Sleeping cat'), cat: 'nature', w: 2, h: 1, tier: 'pro',
      make: () => art.petBed(), anim: art.cat },

    // Información del espacio: abre el panel con la descripción y los links.
    { type: 'info', name: N('Bloque de información', 'Info block'), cat: 'work', w: 1, h: 1, tier: 'free',
      make: () => art.qblock(), anim: art.qblockAnim, info: true },
  ];

  const floors = [
    { id: 'white', name: N('Blanco', 'White'), tier: 'free', swatch: '#f1f1f3' },
    { id: 'concrete', name: N('Concreto', 'Concrete'), tier: 'free', swatch: '#d9d9de' },
    { id: 'oak', name: N('Roble', 'Oak'), tier: 'free', swatch: '#cfa06a' },
    { id: 'mint', name: N('Alfombra menta', 'Mint carpet'), tier: 'free', swatch: '#a9d3b3' },
    { id: 'navy', name: N('Alfombra azul', 'Navy carpet'), tier: 'free', swatch: '#2f3e5e' },
    { id: 'neon', name: N('Neón', 'Neon'), tier: 'pro', swatch: '#16131f' },
  ];
  const walls = [
    { id: 'white', name: N('Blanco', 'White'), tier: 'free', swatch: '#f7f7f9' },
    { id: 'cream', name: N('Crema', 'Cream'), tier: 'free', swatch: '#efe4d0' },
    { id: 'mint', name: N('Menta', 'Mint'), tier: 'free', swatch: '#e2eedc' },
    { id: 'sky', name: N('Cielo', 'Sky'), tier: 'free', swatch: '#dde6f3' },
    { id: 'graphite', name: N('Grafito', 'Graphite'), tier: 'pro', swatch: '#3a3d45' },
    { id: 'brand', name: N('Color de marca', 'Brand color'), tier: 'pro', swatch: null },
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

  // Colores sugeridos para personas.
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

  TGL.catalog = { items, byType, floors, walls, modes, categories, people, plan };
})();
