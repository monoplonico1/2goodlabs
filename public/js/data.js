// Contenido del sitio: salas y equipo.
// Para cambiar textos, nombres o agregar a alguien, este es el único archivo que hay que tocar.
// Las posiciones (x, fila) están en tiles de 16 px; ver world.js para el plano.

window.TGL = window.TGL || {};

TGL.company = {
  name: '2GoodLabs',
  tagline: 'Una empresa liderada por IA',
};

// Colores por rol: son los ojos del agente, su etiqueta y su punto en el minimapa.
TGL.roles = {
  founder: { label: 'Co-founder', color: '#ffc367' },
  dev: { label: 'Desarrollo', color: '#4dd6ff' },
  marketing: { label: 'Marketing', color: '#ff6fa8' },
  design: { label: 'Diseño', color: '#ffd24d' },
  data: { label: 'Datos deportivos', color: '#9cff57' },
};

TGL.rooms = [
  {
    id: 'board',
    name: 'Board',
    blurb: 'La sala de los fundadores. Aquí se decide qué se construye.',
    x: 1, y: 3, w: 11, h: 12,
    color: '#ffc367',
  },
  {
    id: 'zumi',
    name: 'Zumi',
    blurb:
      'Zumi lleva la agenda de salud de tu mascota: escaneas el carnet y organiza vacunas, ' +
      'tratamientos, comidas, paseos y citas.',
    link: 'https://zumiapp.co',
    x: 13, y: 3, w: 15, h: 12,
    color: '#5fae74',
  },
  {
    id: 'pickpals',
    name: 'Pickpals',
    blurb: 'Pickpals: pronósticos deportivos para jugar con tus amigos.',
    x: 29, y: 3, w: 16, h: 12,
    color: '#4f86f0',
  },
  {
    id: 'lobby',
    name: 'Lobby',
    blurb: 'Recepción de 2GoodLabs.',
    x: 1, y: 18, w: 44, h: 9,
    color: '#b8b0a2',
  },
];

// kind: 'human' | 'agent'. body: color de la ropa / chasis.
TGL.team = [
  // ——— Board ———
  {
    id: 'cesar', name: 'Cesar', kind: 'human', role: 'founder', room: 'board',
    x: 3.25, row: 4, dir: 'down',
    look: { skin: '#e0ac7e', hair: '#2b1d14', hairStyle: 'short', body: '#2d3e5c', legs: '#1f2533' },
    bio: 'Co-fundador de 2GoodLabs. Define la visión, pone las prioridades y decide qué construimos después. Los agentes le reportan a él y a Ricardo.',
    tasks: ['Visión y estrategia', 'Prioridades de Zumi y Pickpals', 'Dirección del equipo de agentes'],
    statuses: ['Revisando el roadmap', 'Priorizando el backlog', 'Dándole feedback a los agentes', 'Café. Mucho café.'],
  },
  {
    id: 'ricardo', name: 'Ricardo', kind: 'human', role: 'founder', room: 'board',
    x: 9.25, row: 4, dir: 'down',
    look: { skin: '#d49a6a', hair: '#4a2e1c', hairStyle: 'side', body: '#8a3b3b', legs: '#262b36' },
    bio: 'Co-fundador de 2GoodLabs. Define la visión, pone las prioridades y decide qué construimos después. Los agentes le reportan a él y a Cesar.',
    tasks: ['Visión y estrategia', 'Producto', 'Dirección del equipo de agentes'],
    statuses: ['Aprobando el siguiente release', 'Revisando métricas', 'Probando la nueva versión', 'Pensando en el próximo producto'],
  },

  // ——— Zumi ———
  {
    id: 'nodo', name: 'Nodo', kind: 'agent', role: 'dev', room: 'zumi',
    x: 16.25, row: 4, dir: 'down', body: '#3f8f5a',
    bio: 'Agente de desarrollo de Zumi. Escribe, prueba y despliega el código de la app y del sitio.',
    tasks: ['Implementa funcionalidades', 'Corrige bugs y escribe pruebas', 'Despliega a producción'],
    statuses: ['Compilando…', 'Pruebas: 142 ✓', 'Refactorizando el escáner de carnets', 'git push'],
  },
  {
    id: 'trazo', name: 'Trazo', kind: 'agent', role: 'design', room: 'zumi',
    x: 20.25, row: 4, dir: 'down', body: '#3f8f5a',
    bio: 'Agente de diseño de Zumi. Diseña pantallas, ilustraciones y el sistema visual de la marca.',
    tasks: ['Pantallas y flujos de la app', 'Ilustraciones e íconos', 'Sistema visual de Zumi'],
    statuses: ['Ajustando la paleta verde', 'Dibujando un ícono de vacuna', 'Revisando contraste', 'Nuevo onboarding'],
  },
  {
    id: 'eco', name: 'Eco', kind: 'agent', role: 'marketing', room: 'zumi',
    x: 24.25, row: 4, dir: 'down', body: '#3f8f5a',
    bio: 'Agente de marketing de Zumi. Cuenta la historia de Zumi: contenido, campañas, redes y SEO.',
    tasks: ['Contenido y redes', 'Campañas', 'SEO y traducciones'],
    statuses: ['Redactando un post', 'Analizando la campaña', 'Traduciendo la landing', 'Guías para dueños de mascotas'],
  },

  // ——— Pickpals ———
  {
    id: 'kernel', name: 'Kernel', kind: 'agent', role: 'dev', room: 'pickpals',
    x: 31.25, row: 4, dir: 'down', body: '#2f5fc4',
    bio: 'Agente de desarrollo de Pickpals. Construye la app, la API de picks y las tablas de posiciones.',
    tasks: ['App y API de picks', 'Tablas de posiciones', 'Despliegues'],
    statuses: ['Optimizando la tabla', 'Escribiendo la API de picks', 'Deploy en progreso…', 'Pruebas: todo verde'],
  },
  {
    id: 'hype', name: 'Hype', kind: 'agent', role: 'marketing', room: 'pickpals',
    x: 35.25, row: 4, dir: 'down', body: '#2f5fc4',
    bio: 'Agente de marketing de Pickpals. Llena las quinielas: campañas, redes y comunidad.',
    tasks: ['Campañas por jornada', 'Redes y comunidad', 'Crecimiento'],
    statuses: ['Preparando la campaña del clásico', 'Programando posts', 'Invitando amigos', 'Leyendo la comunidad'],
  },
  {
    id: 'lienzo', name: 'Lienzo', kind: 'agent', role: 'design', room: 'pickpals',
    x: 31.25, row: 9, dir: 'down', body: '#2f5fc4',
    bio: 'Agente de diseño de Pickpals. Diseña la app, las tarjetas para compartir picks y la marca.',
    tasks: ['Diseño de la app', 'Tarjetas para compartir', 'Marca de Pickpals'],
    statuses: ['Diseñando tarjetas de picks', 'Iterando el onboarding', 'Escudos en pixel art'],
  },
  {
    id: 'stats', name: 'Stats', kind: 'agent', role: 'data', room: 'pickpals',
    x: 40.75, row: 9, dir: 'down', body: '#2f5fc4',
    bio: 'Agente de datos deportivos. Busca, valida y registra partidos, resultados, alineaciones y estadísticas para que Pickpals siempre tenga la información al día.',
    tasks: ['Busca resultados y calendarios', 'Valida datos contra varias fuentes', 'Registra todo en la base de datos'],
    statuses: ['Buscando resultados', 'Registrando alineaciones', 'Validando marcadores', 'Actualizando calendario'],
    // Stats no se queda quieto: recorre estos puntos (x en tiles, fila) y en cada uno dice lo suyo.
    patrol: [
      { x: 40.75, row: 9, say: 'Registrando datos en la base' },
      { x: 41.5, row: 4, say: 'Revisando marcadores en vivo' },
      { x: 43.5, row: 7, say: 'Archivando estadísticas' },
    ],
  },
];

// Marcador del muro de Pickpals. Son de ejemplo: el agente de datos los reemplazaría por reales.
TGL.scoreboard = [
  'MEX 2-1 ARG  78\'',
  'BAR 0-0 RMA  12\'',
  'LAL 104-99 BOS  FIN',
  'AME 1-1 CHV  HT',
  'NYY 3-5 LAD  8TH',
];
