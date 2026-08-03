/* ============================================================================
   GEO · Tracks de las rutas de montaña.
   ----------------------------------------------------------------------------
   Clave = MISMA convención que `art`/`profile`: plan B del día 5 → 'd5b'.
   Un plan sin track no rompe nada: el mapa pinta solo la base y lo dice.

   ⚠ TRAZADO APROXIMADO a partir de waypoints reales (aparcamientos, ibones,
   collados, cimas, refugios) verificados uno a uno. La línea entre waypoints se
   interpola a mano: sirve para situar la ruta en el valle, NO para navegar.
   Los datos duros de cada ruta (distancia, desnivel, tiempo) viven en
   `src/data/dias/*` — aquí solo la geometría, para no duplicar cifras.

   `kind`: 'ida' · 'ida-vuelta' · 'circular' · 'paseo'
   ========================================================================== */

export const tracks = {
  /* ---- Día 1 · Plan C (recomendado) -------------------------------------- */
  d1c: {
    day: 1,
    plan: 'C',
    name: 'Mirador de Lanuza al atardecer',
    kind: 'ida-vuelta',
    start: [42.7714, -0.3336],
    end: [42.7568, -0.3215],
    path: [
      [42.7714, -0.3336],
      [42.7683, -0.3298],
      [42.7648, -0.3266],
      [42.761, -0.3239],
      [42.7568, -0.3215],
    ],
    pois: [
      { at: [42.7714, -0.3336], label: 'Sallent de Gállego · salida' },
      { at: [42.7568, -0.3215], label: 'Mirador sobre el embalse · Lanuza enfrente' },
    ],
  },

  /* ---- Día 2 · Plan A (recomendado) --------------------------------------
     La Sarra → refugio de Respomuso por el GR-11 (Aguas Limpias). Termina
     arriba: hoy se duerme a 2.220 m, así que el track es de ida. */
  d2a: {
    day: 2,
    plan: 'A',
    name: 'Refugio de Respomuso (2.220 m)',
    kind: 'ida',
    start: [42.7861, -0.3452],
    end: [42.8169, -0.2876],
    path: [
      [42.7861, -0.3452], // parking de La Sarra · 1.440 m
      [42.7887, -0.3468], // Puente de las Faxas
      [42.7925, -0.344],
      [42.7985, -0.3305], // Paso del Onso · 1 h 10
      [42.8055, -0.3186], // Llano Cheto
      [42.809, -0.312],
      [42.811, -0.304], // barranco de Arriel
      [42.814, -0.296],
      [42.8169, -0.2876], // refugio de Respomuso · 2.220 m
    ],
    pois: [
      { at: [42.7861, -0.3452], label: 'Parking de La Sarra · 1.440 m' },
      { at: [42.7985, -0.3305], label: 'Paso del Onso · estrecho del Aguas Limpias' },
      { at: [42.8055, -0.3186], label: 'Llano Cheto' },
      { at: [42.8169, -0.2876], label: 'Refugio de Respomuso · 2.220 m' },
    ],
  },

  /* ---- Día 2 · Plan B (vivac legal) --------------------------------------
     Misma subida, siguiendo por encima del refugio hacia Llena Cantal. El
     punto final es orientativo: hay que vivaquear a más de 100 m del agua. */
  d2b: {
    day: 2,
    plan: 'B',
    name: 'Vivac en el circo de Piedrafita',
    kind: 'ida',
    start: [42.7861, -0.3452],
    end: [42.808, -0.276],
    path: [
      [42.7861, -0.3452], // La Sarra
      [42.7887, -0.3468],
      [42.7925, -0.344],
      [42.7985, -0.3305], // Paso del Onso
      [42.8055, -0.3186], // Llano Cheto
      [42.809, -0.312],
      [42.811, -0.304],
      [42.814, -0.296],
      [42.8169, -0.2876], // refugio de Respomuso
      [42.8125, -0.282],
      [42.808, -0.276], // zona alta del circo · ibón de Llena Cantal
    ],
    pois: [
      { at: [42.8169, -0.2876], label: 'Refugio de Respomuso · último agua segura' },
      { at: [42.808, -0.276], label: 'Ibón de Llena Cantal · 2.450 m (vivac a +100 m del agua)' },
    ],
  },

  /* ---- Día 2 · Plan C ----------------------------------------------------- */
  d2c: {
    day: 2,
    plan: 'C',
    name: 'Ibones de Anayet',
    kind: 'ida-vuelta',
    start: [42.7852, -0.4085],
    end: [42.7845, -0.447],
    path: [
      [42.7852, -0.4085], // parking Corral de las Mulas · 1.626 m
      [42.7871, -0.4122],
      [42.7889, -0.4158],
      [42.7906, -0.4198],
      [42.792, -0.4238], // parking de Anayet (fin del asfalto)
      [42.7916, -0.4279],
      [42.7899, -0.4312], // entrada del barranco de Culivillas
      [42.7879, -0.4341],
      [42.7862, -0.4374],
      [42.7852, -0.441],
      [42.7846, -0.4442],
      [42.7845, -0.447], // ibones
    ],
    pois: [
      { at: [42.7852, -0.4085], label: 'Parking Corral de las Mulas · 1.626 m' },
      { at: [42.7899, -0.4312], label: 'Barranco de Culivillas' },
      { at: [42.7845, -0.447], label: 'Ibones de Anayet · 2.233 m' },
    ],
  },

  /* ---- Día 3 · Plan A (recomendado) --------------------------------------
     Del refugio al Gran Facha y vuelta, y desde el refugio, bajada a La Sarra:
     el `path` dibuja la jornada entera, por eso es de tipo 'ida'. */
  d3a: {
    day: 3,
    plan: 'A',
    name: 'Gran Facha (3.005 m)',
    kind: 'ida',
    start: [42.8169, -0.2876],
    end: [42.7861, -0.3452],
    path: [
      [42.8169, -0.2876], // refugio de Respomuso · 2.220 m
      [42.813, -0.272], // embalse de Campoplano
      [42.8103, -0.2555], // ibones de la Facha
      [42.81, -0.244], // collado de la Facha · frontera
      [42.8086, -0.2378], // cima · 3.005 m
      [42.81, -0.244],
      [42.8103, -0.2555],
      [42.813, -0.272],
      [42.8169, -0.2876], // de vuelta al refugio a por las mochilas
      [42.814, -0.296],
      [42.811, -0.304],
      [42.809, -0.312],
      [42.8055, -0.3186], // Llano Cheto
      [42.7985, -0.3305], // Paso del Onso
      [42.7925, -0.344],
      [42.7887, -0.3468],
      [42.7861, -0.3452], // La Sarra
    ],
    pois: [
      { at: [42.8169, -0.2876], label: 'Refugio de Respomuso · salida a las 6:30' },
      { at: [42.813, -0.272], label: 'Embalse de Campoplano' },
      { at: [42.81, -0.244], label: 'Collado de la Facha · frontera' },
      { at: [42.8086, -0.2378], label: 'Gran Facha · 3.005 m' },
      { at: [42.7861, -0.3452], label: 'La Sarra · fin de la jornada' },
    ],
  },

  /* ---- Día 3 · Plan E ----------------------------------------------------- */
  d3e: {
    day: 3,
    plan: 'E',
    name: 'Pico Anayet (2.559 m)',
    kind: 'ida-vuelta',
    start: [42.7852, -0.4085],
    end: [42.7831, -0.4532],
    path: [
      [42.7852, -0.4085], // parking Corral de las Mulas
      [42.7871, -0.4122],
      [42.7889, -0.4158],
      [42.7906, -0.4198],
      [42.792, -0.4238], // parking de Anayet
      [42.7916, -0.4279],
      [42.7899, -0.4312], // barranco de Culivillas
      [42.7879, -0.4341],
      [42.7862, -0.4374],
      [42.7852, -0.441],
      [42.7846, -0.4442],
      [42.7845, -0.447], // ibones de Anayet
      [42.7861, -0.4505],
      [42.7872, -0.4541], // collado bajo el Vértice
      [42.7855, -0.4556],
      [42.7841, -0.4544],
      [42.7831, -0.4532], // cima
    ],
    pois: [
      { at: [42.7845, -0.447], label: 'Ibones de Anayet' },
      { at: [42.7872, -0.4541], label: 'Collado del Vértice · 2.545 m' },
      { at: [42.7831, -0.4532], label: 'Pico Anayet · trepada final' },
    ],
  },

  /* ---- Día 4 · Plan A (recomendado) -------------------------------------- */
  d4a: {
    day: 4,
    plan: 'A',
    name: 'Lanuza y atardecer en el embalse',
    kind: 'circular',
    start: [42.7714, -0.3336],
    end: [42.7714, -0.3336],
    path: [
      [42.7714, -0.3336],
      [42.766, -0.328],
      [42.76, -0.3235],
      [42.755, -0.32],
      [42.7514, -0.3186],
      [42.748, -0.315],
      [42.746, -0.323],
      [42.752, -0.329],
      [42.759, -0.333],
      [42.766, -0.336],
      [42.7714, -0.3336],
    ],
    pois: [
      { at: [42.7514, -0.3186], label: 'Lanuza · casas de piedra' },
      { at: [42.748, -0.315], label: 'Presa del embalse' },
    ],
  },

  /* ---- Día 5 · Plan A (recomendado) -------------------------------------- */
  d5a: {
    day: 5,
    plan: 'A',
    name: 'Cola de Caballo + dormir en Góriz',
    kind: 'ida',
    start: [42.6494, -0.0598],
    end: [42.6652, 0.0161],
    path: [
      [42.6494, -0.0598], // Pradera de Ordesa
      [42.6478, -0.0562],
      [42.6489, -0.0521],
      [42.6471, -0.0486],
      [42.6483, -0.0447],
      [42.6462, -0.0412],
      [42.6472, -0.0372],
      [42.6451, -0.0338], // valle del Arazas
      [42.646, -0.0298],
      [42.644, -0.0262],
      [42.6449, -0.0221],
      [42.643, -0.0186],
      [42.6442, -0.0146],
      [42.6426, -0.0108],
      [42.6441, -0.0068],
      [42.6428, -0.0029],
      [42.6446, 0.0004], // Gradas de Soaso
      [42.6462, 0.0038],
      [42.6482, 0.0068],
      [42.6494, 0.0104],
      [42.6501, 0.0132],
      [42.6507, 0.0155], // Cola de Caballo
      [42.6521, 0.0186],
      [42.6541, 0.0202],
      [42.6563, 0.0196],
      [42.6584, 0.0181],
      [42.6606, 0.0173],
      [42.663, 0.0169],
      [42.6652, 0.0161], // Refugio de Góriz
    ],
    pois: [
      { at: [42.6494, -0.0598], label: 'Pradera de Ordesa · lanzadera' },
      { at: [42.6446, 0.0004], label: 'Gradas de Soaso' },
      { at: [42.6507, 0.0155], label: 'Cascada Cola de Caballo' },
      { at: [42.6652, 0.0161], label: 'Refugio de Góriz · 2.200 m' },
    ],
  },

  /* ---- Día 6 · Plan A (recomendado) -------------------------------------- */
  d6a: {
    day: 6,
    plan: 'A',
    name: 'Monte Perdido (3.355 m)',
    kind: 'ida-vuelta',
    start: [42.6652, 0.0161],
    end: [42.667, 0.033],
    path: [
      [42.6652, 0.0161], // Refugio de Góriz
      [42.6664, 0.0179],
      [42.6659, 0.0202],
      [42.6675, 0.0214],
      [42.6668, 0.0238],
      [42.6685, 0.0247], // la Escupidera
      [42.6678, 0.027],
      [42.6696, 0.0279],
      [42.669, 0.0301],
      [42.6706, 0.0296], // Lago Helado
      [42.6712, 0.0318],
      [42.6696, 0.0327],
      [42.6683, 0.0339],
      [42.667, 0.033], // cima
    ],
    pois: [
      { at: [42.6652, 0.0161], label: 'Refugio de Góriz · salida de noche' },
      { at: [42.6685, 0.0247], label: 'La Escupidera' },
      { at: [42.6706, 0.0296], label: 'Lago Helado' },
      { at: [42.667, 0.033], label: 'Cima · 3.355 m' },
    ],
  },

  /* ---- Día 7 · Plan A (recomendado) -------------------------------------- */
  d7a: {
    day: 7,
    plan: 'A',
    name: 'Aínsa y sus murallas',
    kind: 'paseo',
    start: [42.4183, 0.14],
    end: [42.4183, 0.14],
    path: [
      [42.4183, 0.14],
      [42.4188, 0.1385],
      [42.419, 0.137],
      [42.4188, 0.1352],
      [42.4183, 0.134],
      [42.4176, 0.1348],
      [42.418, 0.1372],
      [42.4183, 0.14],
    ],
    pois: [
      { at: [42.419, 0.137], label: 'Plaza Mayor' },
      { at: [42.4183, 0.134], label: 'Castillo y murallas · atardecer' },
    ],
  },

  /* ---- Día 8 · Plan A (recomendado) -------------------------------------- */
  d8a: {
    day: 8,
    plan: 'A',
    name: 'Aguas Tuertas',
    kind: 'ida-vuelta',
    start: [42.841, -0.6554],
    end: [42.859, -0.628],
    path: [
      [42.841, -0.6554],
      [42.844, -0.65],
      [42.847, -0.645],
      [42.85, -0.64],
      [42.853, -0.636],
      [42.856, -0.633],
      [42.859, -0.628],
    ],
    pois: [
      { at: [42.841, -0.6554], label: 'Parking de Guarrinza' },
      { at: [42.853, -0.636], label: 'Meandros de Aguas Tuertas' },
      { at: [42.859, -0.628], label: 'Dolmen de Aguas Tuertas' },
    ],
  },

  /* ---- Día 9 · Plan A (recomendado) -------------------------------------- */
  d9a: {
    day: 9,
    plan: 'A',
    name: 'Mesa de los Tres Reyes (2.428 m)',
    kind: 'ida-vuelta',
    start: [42.9153, -0.7847],
    end: [42.945, -0.7222],
    path: [
      [42.9153, -0.7847],
      [42.922, -0.779],
      [42.929, -0.772],
      [42.935, -0.765],
      [42.939, -0.753],
      [42.942, -0.742],
      [42.944, -0.732],
      [42.945, -0.7222],
    ],
    pois: [
      { at: [42.9153, -0.7847], label: 'Refugio de Linza · 1.340 m' },
      { at: [42.935, -0.765], label: 'Paso de los Sarrios' },
      { at: [42.945, -0.7222], label: 'Cima · Navarra, Aragón y Bearn' },
    ],
  },

  /* ---- Día 10 · Plan B (recomendado) ------------------------------------- */
  d10b: {
    day: 10,
    plan: 'B',
    name: 'San Juan de la Peña',
    kind: 'paseo',
    start: [42.5142, -0.6739],
    end: [42.5089, -0.669],
    path: [
      [42.5142, -0.6739],
      [42.5125, -0.672],
      [42.5105, -0.67],
      [42.5089, -0.669],
    ],
    pois: [
      { at: [42.5142, -0.6739], label: 'Monasterio nuevo' },
      { at: [42.5089, -0.669], label: 'Monasterio viejo · bajo la roca' },
    ],
  },
}

/* Clave de track a partir de día y letra de plan: (5,'A') → 'd5a'. */
export const trackKey = (day, plan) => `d${day}${String(plan).toLowerCase()}`

export const getTrack = (day, plan) => tracks[trackKey(day, plan)] || null

export const TOTAL_TRACKS = Object.keys(tracks).length
