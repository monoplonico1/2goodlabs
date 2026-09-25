// Contenido del sitio: salas y equipo, en español (es) e inglés (en).
// Para cambiar textos, nombres o agregar a alguien, este es el único archivo que hay que tocar.
// Las posiciones (x, fila) están en tiles de 16 px; ver world.js para el plano.

window.TGL = window.TGL || {};

TGL.company = {
  name: '2GoodLabs',
  tagline: { es: 'Una empresa liderada por IA', en: 'An AI-led company' },
};

// Colores por rol: son los ojos del agente, su etiqueta y su punto en el minimapa.
TGL.roles = {
  founder: { label: { es: 'Co-founder', en: 'Co-founder' }, color: '#ffc367' },
  dev: { label: { es: 'Desarrollo', en: 'Development' }, color: '#4dd6ff' },
  marketing: { label: { es: 'Marketing', en: 'Marketing' }, color: '#ff6fa8' },
  design: { label: { es: 'Diseño', en: 'Design' }, color: '#ffd24d' },
  data: { label: { es: 'Datos deportivos', en: 'Sports data' }, color: '#9cff57' },
};

TGL.rooms = [
  {
    id: 'board',
    name: 'Board',
    blurb: {
      es: 'La sala de los fundadores. Aquí se decide qué se construye.',
      en: 'The founders\' room. This is where we decide what gets built.',
    },
    // Lo que muestra el bloque "?" de la sala.
    infoTitle: '2GoodLabs',
    info: {
      es: '2GoodLabs es una empresa liderada por IA. Cesar y Ricardo, los co-founders, ponen la visión y las prioridades; un equipo de agentes de IA diseña, construye y lanza los productos. Hoy son dos: Zumi y Pickpals.',
      en: '2GoodLabs is an AI-led company. Cesar and Ricardo, the co-founders, set the vision and the priorities; a team of AI agents designs, builds and ships the products. Today there are two: Zumi and Pickpals.',
    },
    infoLinks: ['https://zumiapp.co', 'https://pickpals.co'],
    x: 1, y: 3, w: 11, h: 12,
    color: '#ffc367',
  },
  {
    id: 'zumi',
    name: 'Zumi',
    blurb: {
      es: 'Zumi lleva la agenda de salud de tu mascota: escaneas el carnet y organiza vacunas, tratamientos, comidas, paseos y citas.',
      en: 'Zumi keeps your pet\'s health schedule: scan the vaccination card and it organizes vaccines, treatments, meals, walks and vet visits.',
    },
    info: {
      es: 'Zumi es la app para cuidar a tu mascota. Escaneas el carnet de vacunación y arma su agenda: vacunas, tratamientos, comidas, paseos y citas con el veterinario, con su historia clínica completa. Para perros, gatos, aves, peces, reptiles y exóticos. La construyen Nodo (desarrollo), Trazo (diseño) y Eco (marketing).',
      en: 'Zumi is the app to take care of your pet. Scan the vaccination card and it builds the schedule: vaccines, treatments, meals, walks and vet visits, with the full medical history. For dogs, cats, birds, fish, reptiles and exotics. Built by Nodo (development), Trazo (design) and Eco (marketing).',
    },
    link: 'https://zumiapp.co',
    appStore: 'https://apps.apple.com/us/app/zumi-pet-health-care/id6767697574',
    infoLinks: ['https://zumiapp.co', 'https://apps.apple.com/us/app/zumi-pet-health-care/id6767697574'],
    x: 13, y: 3, w: 15, h: 12,
    color: '#5fae74',
  },
  {
    id: 'pickpals',
    name: 'Pickpals',
    blurb: {
      es: 'Pickpals: pronósticos deportivos para jugar con tus amigos.',
      en: 'Pickpals: sports predictions to play with your friends.',
    },
    info: {
      es: 'Pickpals es para jugar pronósticos deportivos con tus amigos. La construyen Kernel (desarrollo), Lienzo (diseño) y Hype (marketing); Stats busca, valida y registra los datos deportivos que alimentan la app.',
      en: 'Pickpals is for playing sports predictions with your friends. Built by Kernel (development), Lienzo (design) and Hype (marketing); Stats finds, validates and records the sports data that powers the app.',
    },
    link: 'https://pickpals.co',
    x: 29, y: 3, w: 16, h: 12,
    color: '#4f86f0',
  },
  {
    id: 'terrace',
    name: { es: 'Terraza', en: 'Terrace' },
    blurb: { es: 'Aire libre, café y buenas ideas.', en: 'Fresh air, coffee and good ideas.' },
    x: 46, y: 3, w: 8, h: 24,
    color: '#f2a65a',
  },
  {
    id: 'lobby',
    name: 'Lobby',
    blurb: { es: 'Recepción de 2GoodLabs.', en: 'Welcome to 2GoodLabs.' },
    x: 1, y: 18, w: 44, h: 9,
    color: '#b8b0a2',
  },
];

// kind: 'human' | 'agent'. body: color de la ropa / chasis.
TGL.team = [
  // ——— Board ———
  {
    id: 'cesar', name: 'Cesar', kind: 'human', role: 'founder', room: 'board',
    x: 3.25, row: 4, dir: 'down', breakAt: 50,
    look: { skin: '#e0ac7e', hair: '#2b1d14', hairStyle: 'short', body: '#2d3e5c', legs: '#1f2533' },
    bio: {
      es: 'Co-fundador de 2GoodLabs. Define la visión, pone las prioridades y decide qué construimos después. Los agentes le reportan a él y a Ricardo.',
      en: 'Co-founder of 2GoodLabs. Sets the vision, the priorities and what we build next. The agents report to him and Ricardo.',
    },
    tasks: {
      es: ['Visión y estrategia', 'Prioridades de Zumi y Pickpals', 'Dirección del equipo de agentes'],
      en: ['Vision and strategy', 'Zumi and Pickpals priorities', 'Leading the agent team'],
    },
    statuses: {
      es: ['Revisando el roadmap', 'Priorizando el backlog', 'Dándole feedback a los agentes', 'Café. Mucho café.'],
      en: ['Reviewing the roadmap', 'Prioritizing the backlog', 'Giving feedback to the agents', 'Coffee. Lots of coffee.'],
    },
  },
  {
    id: 'ricardo', name: 'Ricardo', kind: 'human', role: 'founder', room: 'board',
    x: 9.25, row: 4, dir: 'down', breakAt: 50,
    look: { skin: '#d49a6a', hair: '#4a2e1c', hairStyle: 'side', beard: '#3b2416', body: '#8a3b3b', legs: '#262b36' },
    bio: {
      es: 'Co-fundador de 2GoodLabs. Define la visión, pone las prioridades y decide qué construimos después. Los agentes le reportan a él y a Cesar.',
      en: 'Co-founder of 2GoodLabs. Sets the vision, the priorities and what we build next. The agents report to him and Cesar.',
    },
    tasks: {
      es: ['Visión y estrategia', 'Producto', 'Dirección del equipo de agentes'],
      en: ['Vision and strategy', 'Product', 'Leading the agent team'],
    },
    statuses: {
      es: ['Aprobando el siguiente release', 'Revisando métricas', 'Probando la nueva versión', 'Pensando en el próximo producto'],
      en: ['Approving the next release', 'Reviewing metrics', 'Testing the new version', 'Thinking about the next product'],
    },
  },

  // ——— Zumi ———
  {
    id: 'nodo', name: 'Nodo', kind: 'agent', role: 'dev', room: 'zumi',
    x: 16.25, row: 4, dir: 'down', body: '#3f8f5a', breakAt: 0,
    bio: {
      es: 'Agente de desarrollo de Zumi. Escribe, prueba y despliega el código de la app y del sitio.',
      en: 'Zumi\'s development agent. Writes, tests and ships the code for the app and the website.',
    },
    tasks: {
      es: ['Implementa funcionalidades', 'Corrige bugs y escribe pruebas', 'Despliega a producción'],
      en: ['Builds features', 'Fixes bugs and writes tests', 'Deploys to production'],
    },
    statuses: {
      es: ['Compilando…', 'Pruebas: 142 ✓', 'Refactorizando el escáner de carnets', 'git push'],
      en: ['Compiling…', 'Tests: 142 ✓', 'Refactoring the card scanner', 'git push'],
    },
  },
  {
    id: 'trazo', name: 'Trazo', kind: 'agent', role: 'design', room: 'zumi',
    x: 20.25, row: 4, dir: 'down', body: '#3f8f5a', breakAt: 15,
    bio: {
      es: 'Agente de diseño de Zumi. Diseña pantallas, ilustraciones y el sistema visual de la marca.',
      en: 'Zumi\'s design agent. Designs the screens, illustrations and the brand\'s visual system.',
    },
    tasks: {
      es: ['Pantallas y flujos de la app', 'Ilustraciones e íconos', 'Sistema visual de Zumi'],
      en: ['App screens and flows', 'Illustrations and icons', 'Zumi\'s visual system'],
    },
    statuses: {
      es: ['Ajustando la paleta verde', 'Dibujando un ícono de vacuna', 'Revisando contraste', 'Nuevo onboarding'],
      en: ['Tweaking the green palette', 'Drawing a vaccine icon', 'Checking contrast', 'New onboarding'],
    },
  },
  {
    id: 'eco', name: 'Eco', kind: 'agent', role: 'marketing', room: 'zumi',
    x: 24.25, row: 4, dir: 'down', body: '#3f8f5a', breakAt: 30,
    bio: {
      es: 'Agente de marketing de Zumi. Cuenta la historia de Zumi: contenido, campañas, redes y SEO.',
      en: 'Zumi\'s marketing agent. Tells Zumi\'s story: content, campaigns, social and SEO.',
    },
    tasks: {
      es: ['Contenido y redes', 'Campañas', 'SEO y traducciones'],
      en: ['Content and social', 'Campaigns', 'SEO and translations'],
    },
    statuses: {
      es: ['Redactando un post', 'Analizando la campaña', 'Traduciendo la landing', 'Guías para dueños de mascotas'],
      en: ['Writing a post', 'Analyzing the campaign', 'Translating the landing page', 'Guides for pet owners'],
    },
  },

  // ——— Pickpals ———
  {
    id: 'kernel', name: 'Kernel', kind: 'agent', role: 'dev', room: 'pickpals',
    x: 31.25, row: 4, dir: 'down', body: '#2f5fc4', breakAt: 0,
    bio: {
      es: 'Agente de desarrollo de Pickpals. Construye la app, la API de picks y las tablas de posiciones.',
      en: 'Pickpals\' development agent. Builds the app, the picks API and the leaderboards.',
    },
    tasks: {
      es: ['App y API de picks', 'Tablas de posiciones', 'Despliegues'],
      en: ['App and picks API', 'Leaderboards', 'Deployments'],
    },
    statuses: {
      es: ['Optimizando la tabla', 'Escribiendo la API de picks', 'Deploy en progreso…', 'Pruebas: todo verde'],
      en: ['Optimizing the leaderboard', 'Writing the picks API', 'Deploy in progress…', 'Tests: all green'],
    },
  },
  {
    id: 'hype', name: 'Hype', kind: 'agent', role: 'marketing', room: 'pickpals',
    x: 35.25, row: 4, dir: 'down', body: '#2f5fc4', breakAt: 30,
    bio: {
      es: 'Agente de marketing de Pickpals. Llena las quinielas: campañas, redes y comunidad.',
      en: 'Pickpals\' marketing agent. Fills the pools: campaigns, social and community.',
    },
    tasks: {
      es: ['Campañas por jornada', 'Redes y comunidad', 'Crecimiento'],
      en: ['Matchday campaigns', 'Social and community', 'Growth'],
    },
    statuses: {
      es: ['Preparando la campaña del clásico', 'Programando posts', 'Invitando amigos', 'Leyendo la comunidad'],
      en: ['Prepping the derby campaign', 'Scheduling posts', 'Inviting friends', 'Reading the community'],
    },
  },
  {
    id: 'lienzo', name: 'Lienzo', kind: 'agent', role: 'design', room: 'pickpals',
    x: 31.25, row: 9, dir: 'down', body: '#2f5fc4', breakAt: 15,
    bio: {
      es: 'Agente de diseño de Pickpals. Diseña la app, las tarjetas para compartir picks y la marca.',
      en: 'Pickpals\' design agent. Designs the app, the shareable pick cards and the brand.',
    },
    tasks: {
      es: ['Diseño de la app', 'Tarjetas para compartir', 'Marca de Pickpals'],
      en: ['App design', 'Shareable cards', 'Pickpals brand'],
    },
    statuses: {
      es: ['Diseñando tarjetas de picks', 'Iterando el onboarding', 'Escudos en pixel art'],
      en: ['Designing pick cards', 'Iterating on onboarding', 'Pixel art team crests'],
    },
  },
  {
    id: 'stats', name: 'Stats', kind: 'agent', role: 'data', room: 'pickpals',
    x: 40.75, row: 9, dir: 'down', body: '#2f5fc4', breakAt: 45,
    bio: {
      es: 'Agente de datos deportivos. Busca, valida y registra partidos, resultados, alineaciones y estadísticas para que Pickpals siempre tenga la información al día.',
      en: 'Sports data agent. Finds, validates and records matches, results, lineups and stats so Pickpals always has up-to-date information.',
    },
    tasks: {
      es: ['Busca resultados y calendarios', 'Valida datos contra varias fuentes', 'Registra todo en la base de datos'],
      en: ['Finds results and fixtures', 'Cross-checks data across sources', 'Records everything in the database'],
    },
    statuses: {
      es: ['Buscando resultados', 'Registrando alineaciones', 'Validando marcadores', 'Actualizando calendario'],
      en: ['Looking up results', 'Recording lineups', 'Validating scores', 'Updating fixtures'],
    },
    // Stats no se queda quieto: recorre estos puntos (x en tiles, fila) y en cada uno dice lo suyo.
    patrol: [
      { x: 40.75, row: 9, say: { es: 'Registrando datos en la base', en: 'Writing data to the database' } },
      { x: 41.5, row: 4, say: { es: 'Revisando marcadores en vivo', en: 'Checking live scores' } },
      { x: 43.5, row: 7, say: { es: 'Archivando estadísticas', en: 'Archiving stats' } },
    ],
  },
];

// Descansos: cada quien se toma 5 minutos por hora en la terraza, a partir del
// minuto `breakAt` (hora local del visitante). Van en parejas: los agentes por rol
// y los fundadores juntos.
TGL.breakTalk = {
  leave: { es: '¡Descanso! 5 min en la terraza', en: 'Break! 5 min on the terrace' },
  back: { es: 'De vuelta al trabajo', en: 'Back to work' },
  statuses: {
    es: ['Café en la terraza', 'Tomando aire', 'Descanso de 5 minutos', 'Enfriando los circuitos', 'Charlando con el equipo'],
    en: ['Coffee on the terrace', 'Getting some air', '5-minute break', 'Cooling my circuits', 'Chatting with the team'],
  },
  // Los fundadores no tienen circuitos que enfriar.
  humanStatuses: {
    es: ['Café en la terraza', 'Tomando aire', 'Pensando en grande', 'Charlando de producto'],
    en: ['Coffee on the terrace', 'Getting some air', 'Thinking big', 'Talking product'],
  },
};

// Marcador del muro de Pickpals. Son de ejemplo: el agente de datos los reemplazaría por reales.
TGL.scoreboard = [
  'MEX 2-1 ARG  78\'',
  'BAR 0-0 RMA  12\'',
  'LAL 104-99 BOS  FIN',
  'AME 1-1 CHV  HT',
  'NYY 3-5 LAD  8TH',
];
