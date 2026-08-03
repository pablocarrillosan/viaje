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

/* --- Informe ------------------------------------------------------------ */
console.log(`Tracks: ${Object.keys(tracks).length} · Tramos: ${tramos.length} · Bases: ${bases.length}`)
console.log(`Kilómetros de coche del bucle: ${KM_COCHE_TOTAL}`)
if (avisos.length) console.log('\nAvisos:\n - ' + avisos.join('\n - '))
if (errores.length) {
  console.error('\nERRORES:\n - ' + errores.join('\n - '))
  process.exit(1)
}
console.log('\nTodo correcto.')
