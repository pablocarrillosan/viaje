#!/usr/bin/env node
/* ============================================================================
   Verificación de los datos geográficos (`npm run check:geo`).
   Comprueba, sin navegador ni red:
     1. Que toda coordenada cae dentro del bbox del viaje (Alicante–Pirineo).
     2. Que los tracks referencian días y planes que EXISTEN en src/data.
     3. Que la longitud dibujada de cada track no se dispara respecto a la
        distancia publicada del plan (el trazado es simplificado: puede quedarse
        corto, pero nunca debería salir más largo).
     4. Que los kilómetros de los tramos coinciden con lo publicado en mapa.js.
   Sale con código 1 si algo falla.
   ========================================================================== */

import { dias } from '../src/data/dias.js'
import { tracks } from '../src/data/geo/tracks.js'
import { tramos, KM_COCHE_TOTAL } from '../src/data/geo/tramos.js'
import { bases, hitos } from '../src/data/geo/bases.js'
import { refugios, refugiosById, ZONAS } from '../src/data/geo/refugios.js'
import { puntos as puntosMeteo, meteoKey } from '../src/data/geo/meteo.js'
import { rutaEtapas } from '../src/data/mapa.js'

const BBOX = { latMin: 38.0, latMax: 43.2, lonMin: -1.6, lonMax: 0.6 }
const errores = []
const avisos = []

const hav = (a, b) => {
  const R = 6371
  const dLa = ((b[0] - a[0]) * Math.PI) / 180
  const dLo = ((b[1] - a[1]) * Math.PI) / 180
  const la1 = (a[0] * Math.PI) / 180
  const la2 = (b[0] * Math.PI) / 180
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const largo = (path) => path.slice(1).reduce((n, p, i) => n + hav(path[i], p), 0)
const parseKm = (v) => {
  const n = String(v || '').replace(/\./g, '').replace(/,/g, '.').match(/\d+(\.\d+)?/g)
  if (!n) return null
  const x = n.map(Number)
  return x.length > 1 ? (x[0] + x[1]) / 2 : x[0]
}

/* 1 · Coordenadas dentro del bbox --------------------------------------- */
const enBbox = ([la, lo], quien) => {
  if (la < BBOX.latMin || la > BBOX.latMax || lo < BBOX.lonMin || lo > BBOX.lonMax)
    errores.push(`Coordenada fuera del bbox en ${quien}: ${la}, ${lo}`)
}
;[...bases, ...hitos].forEach((b) => enBbox(b.coords, `base/hito «${b.id}»`))
tramos.forEach((t) => t.path.forEach((p, i) => enBbox(p, `tramo ${t.id}[${i}]`)))
Object.entries(tracks).forEach(([k, t]) => {
  t.path.forEach((p, i) => enBbox(p, `track ${k}[${i}]`))
  ;(t.pois || []).forEach((p) => enBbox(p.at, `poi de ${k}`))
})

/* 2 · Los tracks apuntan a días y planes reales -------------------------- */
for (const [key, t] of Object.entries(tracks)) {
  const dia = dias.find((d) => d.day === t.day)
  if (!dia) {
    errores.push(`El track ${key} apunta al día ${t.day}, que no existe`)
    continue
  }
  const plan = dia.plans.find((p) => p.plan === t.plan)
  if (!plan) {
    errores.push(`El track ${key} apunta al plan ${t.plan} del día ${t.day}, que no existe`)
    continue
  }
  if (key !== `d${t.day}${t.plan.toLowerCase()}`)
    errores.push(`La clave ${key} no sigue la convención dN+letra`)

  /* 3 · Longitud dibujada vs publicada ---------------------------------- */
  const pub = parseKm(plan.stats.find((s) => s.label === 'Distancia')?.value)
  if (pub) {
    /* Los `path` a mano de las rutas «ida y vuelta» dibujan solo la ida, así que
       cuentan doble. Los importados de un GPX suelen traer la caminata entera y
       vienen marcados con `pathCompleto`: esos no se doblan. */
    const km = largo(t.path) * (t.kind === 'ida-vuelta' && !t.pathCompleto ? 2 : 1)
    if (km > pub * 1.25)
      errores.push(`El track ${key} mide ${km.toFixed(1)} km, más que los ${pub} km publicados`)
    else if (km < pub * 0.75)
      avisos.push(`${key}: trazado simplificado de ${km.toFixed(1)} km frente a ${pub} km publicados`)
  }
}

/* 4 · Tramos vs las cifras ya publicadas en mapa.js ---------------------- */
for (const t of tramos) {
  if (t.kind !== 'traslado') continue
  const etapa = rutaEtapas.find((e) => e.drive && e.drive.includes(`${t.km} km`))
  if (!etapa) avisos.push(`El tramo ${t.id} (${t.km} km) no casa con ninguna etapa de mapa.js`)
  const dibujado = largo(t.path)
  if (dibujado > t.km * 1.1)
    errores.push(`La polilínea de ${t.id} mide ${dibujado.toFixed(0)} km, más que los ${t.km} km de carretera`)
}
const kmMapa = rutaEtapas.reduce((n, e) => n + (parseKm(e.drive?.split('·')[1]) || 0), 0)
if (kmMapa !== KM_COCHE_TOTAL)
  errores.push(`Los km de coche no cuadran: tramos.js suma ${KM_COCHE_TOTAL}, mapa.js suma ${kmMapa}`)

/* 5 · Los trazados pasan por sus puntos de control -------------------------
   Lo mismo que valida `build:tramos`, pero SIN RED: así, si alguien edita un
   `path` a mano o pega un trazado de otro corredor, salta aquí igualmente.
   También avisa si un tramo se queda sin `control`, que es la forma silenciosa
   de que esta comprobación deje de servir para nada. */
const TOL_CONTROL_KM = 3
for (const t of tramos) {
  if (!t.control?.length) {
    avisos.push(`El tramo ${t.id} no declara puntos de control: su trazado no se valida`)
    continue
  }
  for (const [nombre, la, lo] of t.control) {
    const dist = Math.min(...t.path.map((p) => hav([la, lo], p)))
    if (dist > TOL_CONTROL_KM)
      errores.push(
        `El trazado de ${t.id} no pasa por ${nombre}: queda a ${dist.toFixed(1)} km ` +
          `(máx. ${TOL_CONTROL_KM}). ¿Otro corredor, o el punto de control está mal puesto?`,
      )
  }
}

/* 6 · Refugios de la sección #refugios -------------------------------------
   No dibujan nada, pero sí ponen chinchetas en un mapa: validamos que caen en
   el bbox, que no hay ids repetidos, que la zona/tipo son de los permitidos y
   —lo importante— que los tres donde se DUERME coinciden con `bases.js`. Si
   alguien corrige una base y se olvida del refugio, la web se contradice. */
const TIPOS = new Set(['guardado', 'libre', 'cerrado'])
const ZONA_IDS = new Set(ZONAS.map((z) => z.id))
const vistos = new Set()
for (const r of refugios) {
  if (vistos.has(r.id)) errores.push(`Refugio con id duplicado: «${r.id}»`)
  vistos.add(r.id)
  enBbox(r.coords, `refugio «${r.id}»`)
  if (!TIPOS.has(r.tipo)) errores.push(`El refugio «${r.id}» tiene un tipo desconocido: ${r.tipo}`)
  if (!ZONA_IDS.has(r.zona)) errores.push(`El refugio «${r.id}» apunta a la zona inexistente «${r.zona}»`)
  if (r.pais !== 'ES' && r.pais !== 'FR') errores.push(`El refugio «${r.id}» tiene país «${r.pais}»`)
  if (!(r.alt > 500 && r.alt < 3000)) errores.push(`Altitud sospechosa en «${r.id}»: ${r.alt} m`)
  r.dias.forEach((d) => {
    if (!dias.some((x) => x.day === d)) errores.push(`El refugio «${r.id}» apunta al día ${d}, que no existe`)
  })
  /* `planes` es la marca de «cae en el recorrido de esta alternativa»: si el
     plan citado no existe (se renombró una letra, se borró un plan), la marca
     miente en el mapa y hay que enterarse aquí, no en la web. */
  ;(r.planes || []).forEach((ref) => {
    const m = /^(\d+)([A-G])$/.exec(ref)
    if (!m) return errores.push(`El refugio «${r.id}» declara el plan «${ref}», que no tiene forma NX`)
    const dia = dias.find((d) => d.day === Number(m[1]))
    if (!dia) return errores.push(`El refugio «${r.id}» cita el plan ${ref}: el día ${m[1]} no existe`)
    if (!dia.plans.some((p) => p.plan === m[2]))
      errores.push(`El refugio «${r.id}» cita el plan ${ref}, que no existe en el día ${m[1]}`)
  })
  if (r.planes?.length && !r.dias.length)
    avisos.push(`«${r.id}» cae en ${r.planes.join(', ')} pero tiene dias: [] — ¿se te olvidó?`)
}
/* Los que además son base del viaje: misma coordenada (tolerancia 200 m). */
for (const id of ['respomuso', 'goriz', 'linza']) {
  const r = refugiosById[id]
  const b = bases.find((x) => x.id === id)
  if (!r || !b) {
    errores.push(`Falta «${id}» en refugios.js o en bases.js: la web dice que se duerme ahí`)
    continue
  }
  const d = hav(r.coords, b.coords)
  if (d > 0.2)
    errores.push(`«${id}» está en dos sitios: refugios.js y bases.js difieren ${(d * 1000).toFixed(0)} m`)
}

/* --- Puntos meteo (uno por plan) ---------------------------------------- *
   El punto de referencia de meteoblue va en la URL con su altitud, así que un
   número mal puesto no se ve en pantalla: sale un parte plausible pero de otro
   sitio. Se valida que existan los 52, que caigan en el bbox, que la altitud sea
   creíble y que, cuando el plan tiene track, el punto esté sobre el trazado. */
const TIPOS_METEO = new Set(['cima', 'collado', 'ibon', 'refugio', 'valle', 'pueblo'])
const TOL_METEO_KM = 3

const clavesEsperadas = new Set()
for (const d of dias) {
  for (const p of d.plans || []) {
    const k = meteoKey(d.day, p.plan)
    clavesEsperadas.add(k)
    if (!puntosMeteo[k])
      errores.push(`Falta el punto meteo «${k}» (día ${d.day}, plan ${p.plan} · ${p.name})`)
  }
}
for (const [k, m] of Object.entries(puntosMeteo)) {
  if (!clavesEsperadas.has(k)) errores.push(`El punto meteo «${k}» no corresponde a ningún plan`)
  if (!Array.isArray(m.at) || m.at.length !== 2) {
    errores.push(`El punto meteo «${k}» no tiene coordenada válida`)
    continue
  }
  enBbox(m.at, `punto meteo «${k}»`)
  if (!TIPOS_METEO.has(m.tipo)) errores.push(`El punto meteo «${k}» tiene tipo desconocido: «${m.tipo}»`)
  if (!Number.isFinite(m.alt) || m.alt < 300 || m.alt > 3500)
    errores.push(`Altitud poco creíble en el punto meteo «${k}»: ${m.alt} m`)
  if (!m.name) errores.push(`El punto meteo «${k}» no tiene nombre`)

  /* Si el plan tiene track, el punto tiene que estar EN la ruta. Ojo: los tracks
     son bocetos interpolados, de ahí una tolerancia generosa. */
  const t = tracks[k]
  if (t) {
    const cerca = Math.min(...t.path.map((p) => hav(p, m.at)))
    if (cerca > TOL_METEO_KM)
      errores.push(
        `El punto meteo «${k}» (${m.name}) está a ${cerca.toFixed(1)} km del track del mismo plan`,
      )
  }
}
/* Un plan que sube a una cima y declara punto de valle suele ser un copiar-pegar:
   el parte saldría 10 °C más caliente de lo que te vas a encontrar arriba. */
for (const d of dias) {
  for (const p of d.plans || []) {
    const m = puntosMeteo[meteoKey(d.day, p.plan)]
    if (!m) continue
    if (/cima|pico|tresmil|dosmil|alpin/i.test(p.type) && m.alt < 2000)
      avisos.push(`«${p.name}» (día ${d.day}) es de cima y su punto meteo está a ${m.alt} m — ¿es el de arriba?`)
  }
}

/* --- Informe ------------------------------------------------------------ */
console.log(
  `Tracks: ${Object.keys(tracks).length} · Tramos: ${tramos.length} · Bases: ${bases.length} · ` +
    `Refugios: ${refugios.length} (${refugios.filter((r) => r.tipo === 'guardado').length} guardados, ` +
    `${refugios.filter((r) => r.tipo === 'libre').length} libres) · ` +
    `Puntos meteo: ${Object.keys(puntosMeteo).length}/${clavesEsperadas.size}`,
)
console.log(`Kilómetros de coche del bucle: ${KM_COCHE_TOTAL}`)
if (avisos.length) console.log('\nAvisos:\n - ' + avisos.join('\n - '))
if (errores.length) {
  console.error('\nERRORES:\n - ' + errores.join('\n - '))
  process.exit(1)
}
console.log('\nTodo correcto.')
