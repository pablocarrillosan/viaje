/* ============================================================================
   GEO · Punto de referencia METEOROLÓGICO de cada plan (los 52).
   ----------------------------------------------------------------------------
   Clave = MISMA convención que `art` / `profile` / `tracks`: plan B del día 5 →
   'd5b'. Así, añadir un plan nuevo solo pide añadir su clave aquí; ningún
   componente ni dato del día cambia.

   ¿QUÉ PUNTO SE ELIGE? El **más alto y más expuesto** de la ruta (cima, collado,
   ibón), NO el aparcamiento. En montaña el parte que importa es el de arriba: en
   los planes de este viaje hay hasta 2.000 m de diferencia entre la salida y la
   cima, o sea unos 12 °C y otro régimen de viento por completo.

   ⚠ PRECISIÓN. `at` está tomado de `tracks.js` cuando el plan tiene track (para
   no tener dos verdades) y, si no, de la cima/ibón/pueblo publicado. Da igual
   afinar más: el modelo de meteoblue trabaja con una malla de unos 4 km, así que
   ±1 km no cambia el pronóstico. Lo que SÍ cambia mucho es `alt`, que va en la
   URL y meteoblue usa para corregir la temperatura — por eso se declara a mano
   en vez de dejar que la saque de su propio modelo de elevación.

   `tipo`: 'cima' · 'collado' · 'ibon' · 'refugio' · 'valle' · 'pueblo'
   ========================================================================== */

export const puntos = {
  /* ---- Día 1 · Sallent de Gállego (Valle de Tena) ------------------------ */
  d1a: { name: 'Sallent de Gállego', at: [42.7714, -0.3336], alt: 1305, tipo: 'pueblo' },
  d1b: { name: 'Sallent de Gállego · río Aguas Limpias', at: [42.7714, -0.3336], alt: 1305, tipo: 'pueblo' },
  d1c: { name: 'Mirador sobre el embalse de Lanuza', at: [42.7568, -0.3215], alt: 1290, tipo: 'valle' }, // tracks d1c.end
  d1d: { name: 'Embalse de La Sarra', at: [42.7861, -0.3452], alt: 1440, tipo: 'valle' }, // tracks d2a.start
  d1e: { name: 'Ibón de Tramacastilla', at: [42.7392, -0.2864], alt: 1730, tipo: 'ibon' },

  /* ---- Día 2 · subida a Respomuso ---------------------------------------- */
  d2a: { name: 'Refugio de Respomuso', at: [42.8169, -0.2876], alt: 2220, tipo: 'refugio' }, // tracks d2a.end
  d2b: { name: 'Circo de Piedrafita · zona de vivac', at: [42.808, -0.276], alt: 2450, tipo: 'ibon' }, // tracks d2b.end
  d2c: { name: 'Ibones de Anayet', at: [42.7845, -0.447], alt: 2233, tipo: 'ibon' }, // tracks d2c.end
  d2d: { name: 'Refugio de Bachimaña', at: [42.7576, -0.2213], alt: 2200, tipo: 'refugio' },
  d2e: { name: 'Ibón de Espelunciecha', at: [42.7897, -0.3742], alt: 1900, tipo: 'ibon' },
  d2f: { name: 'Peña Foratata · cima', at: [42.7906, -0.3441], alt: 2341, tipo: 'cima' },

  /* ---- Día 3 · el primer tresmil ----------------------------------------- */
  d3a: { name: 'Gran Facha · cima', at: [42.8253, -0.2352], alt: 3005, tipo: 'cima' },
  d3b: { name: 'Ibón de Llena Cantal', at: [42.8073, -0.2727], alt: 2450, tipo: 'ibon' },
  d3c: { name: 'Balaitús · cima', at: [42.8497, -0.2617], alt: 3144, tipo: 'cima' },
  d3d: { name: 'Collado de Tebarray', at: [42.7936, -0.256], alt: 2782, tipo: 'collado' },
  d3e: { name: 'Pico Anayet · cima', at: [42.7831, -0.4532], alt: 2559, tipo: 'cima' }, // tracks d3e.end
  d3f: { name: 'Pic de Peyreget · cima', at: [42.8386, -0.4361], alt: 2487, tipo: 'cima' },

  /* ---- Día 4 · descanso en el Valle de Tena ------------------------------ */
  d4a: { name: 'Embalse de Lanuza', at: [42.7568, -0.3215], alt: 1280, tipo: 'valle' },
  d4b: { name: 'Baños de Panticosa', at: [42.7628, -0.2374], alt: 1636, tipo: 'valle' },
  d4c: { name: 'Ibón de Piedrafita', at: [42.7261, -0.2725], alt: 1620, tipo: 'ibon' },
  d4d: { name: 'Fuerte de Santa Elena · Biescas', at: [42.6483, -0.3185], alt: 900, tipo: 'valle' },

  /* ---- Día 5 · Ordesa, Cola de Caballo y Soaso -------------------------- */
  d5a: { name: 'Refugio de Góriz', at: [42.6652, 0.0161], alt: 2200, tipo: 'refugio' }, // tracks d5a.end
  d5b: { name: 'Cascada Cola de Caballo', at: [42.6595, 0.0056], alt: 1760, tipo: 'valle' },
  d5c: { name: 'Mirador de Calcilarruego · Faja de Pelay', at: [42.6329, -0.0323], alt: 1950, tipo: 'collado' },
  d5d: { name: 'Circo de Soaso · balcón alto', at: [42.644, -0.006], alt: 1950, tipo: 'collado' },
  d5e: { name: 'Faja Racón', at: [42.6465, -0.045], alt: 1650, tipo: 'valle' },
  d5f: { name: 'Punta Acuta · cima', at: [42.636, -0.073], alt: 2242, tipo: 'cima' },

  /* ---- Día 6 · el día grande -------------------------------------------- */
  d6a: { name: 'Monte Perdido · cima', at: [42.667, 0.033], alt: 3355, tipo: 'cima' }, // tracks d6a.end
  d6b: { name: 'Taillón · cima', at: [42.6994, -0.0417], alt: 3144, tipo: 'cima' },
  d6c: { name: 'Refugio de Góriz', at: [42.6652, 0.0161], alt: 2200, tipo: 'refugio' },
  d6d: { name: 'Brecha de Rolando', at: [42.6959, -0.0339], alt: 2807, tipo: 'collado' },
  d6e: { name: 'Pico Marboré · cima', at: [42.6905, 0.0244], alt: 3248, tipo: 'cima' },

  /* ---- Día 7 · descanso en Sobrarbe ------------------------------------- */
  d7a: { name: 'Aínsa · murallas', at: [42.4183, 0.14], alt: 589, tipo: 'pueblo' }, // tracks d7a
  d7b: { name: 'San Nicolás de Bujaruelo', at: [42.706, -0.08], alt: 1338, tipo: 'valle' },
  d7c: { name: 'Puente de los Navarros · río Ara', at: [42.644, -0.0975], alt: 1060, tipo: 'valle' },
  d7d: { name: 'Cañón de Añisclo · miradores', at: [42.548, 0.043], alt: 950, tipo: 'valle' },

  /* ---- Día 8 · Selva de Oza y Aguas Tuertas ----------------------------- */
  d8a: { name: 'Llanos de Aguas Tuertas', at: [42.859, -0.628], alt: 1620, tipo: 'valle' }, // tracks d8a.end
  d8b: { name: 'Ibón de Estanés', at: [42.79, -0.618], alt: 1760, tipo: 'ibon' },
  d8c: { name: 'Meandros de Aguas Tuertas', at: [42.852, -0.642], alt: 1600, tipo: 'valle' },
  d8d: { name: 'Castillo de Acher · cima', at: [42.839, -0.7], alt: 2384, tipo: 'cima' },
  d8e: { name: 'Boca del Infierno', at: [42.829, -0.703], alt: 1050, tipo: 'valle' },
  d8f: { name: 'Bisaurín · cima', at: [42.783, -0.654], alt: 2670, tipo: 'cima' },

  /* ---- Día 9 · Valle de Ansó, Linza ------------------------------------- */
  d9a: { name: 'Mesa de los Tres Reyes · cima', at: [42.945, -0.7222], alt: 2428, tipo: 'cima' }, // tracks d9a.end
  d9b: { name: 'Petrechema · cima', at: [42.9327, -0.7554], alt: 2371, tipo: 'cima' },
  d9c: { name: 'Ibón de Acherito', at: [42.8926, -0.7259], alt: 1875, tipo: 'ibon' },
  d9d: { name: 'Bosque de Gamueta', at: [42.9021, -0.7594], alt: 1450, tipo: 'valle' },
  d9e: { name: 'Paquiza de Linzola · cima', at: [42.9256, -0.7796], alt: 2107, tipo: 'cima' },
  d9f: { name: 'Peña Ezcaurri · cima', at: [42.8747, -0.8347], alt: 2045, tipo: 'cima' },

  /* ---- Día 10 · regreso con paradas ------------------------------------- */
  d10a: { name: 'Jaca', at: [42.5711, -0.5497], alt: 820, tipo: 'pueblo' },
  d10b: { name: 'San Juan de la Peña · monasterio viejo', at: [42.5089, -0.669], alt: 1220, tipo: 'valle' }, // tracks d10b.end
  d10c: { name: 'Castillo de Loarre', at: [42.3247, -0.6083], alt: 1070, tipo: 'valle' },
  d10d: { name: 'Santa Cruz de la Serós', at: [42.5216, -0.6739], alt: 790, tipo: 'pueblo' },
  d10e: { name: 'Mallos de Riglos', at: [42.3489, -0.7211], alt: 750, tipo: 'valle' },
}

/* Misma función-clave que tracks.js, para que no se separen nunca. */
export const meteoKey = (day, plan) => `d${Number(day)}${String(plan).toLowerCase()}`

export const getPunto = (day, plan) => puntos[meteoKey(day, plan)] || null

export const TOTAL_PUNTOS = Object.keys(puntos).length

/* ---------------------------------------------------------------------------
   URLs de meteoblue.

   El widget es un iframe: gratis, sin clave y sin script de terceros. El formato
   de la ruta es `{lat}N{lon}E{alt}_{zona horaria}`; la longitud oeste va con
   signo menos delante de la E (42.7714N-0.3336E1305), tal cual lo genera su
   propio configurador. Declarar la altitud es lo que hace que el parte sea el de
   la cima y no el del fondo del valle.

   ⚠ El widget solo llega a 7 días. Es el horizonte de meteoblue, no un ajuste:
   para una fecha más lejana no hay pronóstico que enseñar. `diasHasta()` sirve
   para avisarlo en pantalla en vez de mostrar una caja con días que no son.
--------------------------------------------------------------------------- */
const ZONA = 'Europe%2FMadrid'

const loc = (p) => `${p.at[0].toFixed(4)}N${p.at[1].toFixed(4)}E${Math.round(p.alt)}_${ZONA}`

export const MAX_DIAS_WIDGET = 7

export function widgetUrl(p, { dias = MAX_DIAS_WIDGET, lang = 'es' } = {}) {
  const q = new URLSearchParams({
    geoloc: 'fixed',
    nocurrent: '0',
    noforecast: '0',
    days: String(Math.min(dias, MAX_DIAS_WIDGET)),
    tempunit: 'CELSIUS',
    windunit: 'KILOMETER_PER_HOUR',
    precipunit: 'MILLIMETER',
    coloured: 'coloured',
    pictoicon: '1',
    maxtemperature: '1',
    mintemperature: '1',
    windspeed: '1',
    windgust: '1',
    winddirection: '1',
    uv: '1',
    humidity: '0',
    precipitation: '1',
    precipitationprobability: '1',
    spot: '1',
    pressure: '0',
    layout: 'light',
  })
  return `https://www.meteoblue.com/${lang}/tiempo/widget/daily/${loc(p)}?${q}`
}

/* Página completa de meteoblue. Se enlaza la de 14 días, no la de 7: el widget ya
   cubre la semana, y son los días 8-14 los que empiezan a tocar el viaje. */
export const paginaUrl = (p, { lang = 'es' } = {}) =>
  `https://www.meteoblue.com/${lang}/tiempo/14-dias/${loc(p)}`

export const semanaUrl = (p, { lang = 'es' } = {}) =>
  `https://www.meteoblue.com/${lang}/tiempo/semana/${loc(p)}`

/* Meteograma multimodelo: es lo útil a más de una semana vista, porque enseña
   la dispersión entre modelos en vez de un número que aún no se sostiene. */
export const multimodelUrl = (p, { lang = 'es' } = {}) =>
  `https://www.meteoblue.com/${lang}/tiempo/pronostico/multimodel/${loc(p)}`

/* Días que faltan para una fecha 'YYYY-MM-DD', contando desde hoy a medianoche. */
export function diasHasta(fecha, hoy = new Date()) {
  const [a, m, d] = fecha.split('-').map(Number)
  const objetivo = Date.UTC(a, m - 1, d)
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((objetivo - base) / 86400000)
}
