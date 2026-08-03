/* ============================================================================
   Derivación de capas del mapa a partir de la SELECCIÓN de planes.
   Módulo PURO (sin React ni Leaflet): lo usan tanto <MapLayers> como la
   alternativa textual y el contador de kilómetros de <MapaViaje>, y no arrastra
   Leaflet al bundle inicial.
   ========================================================================== */

import { dias } from '../../data/dias.js'
import { tracks, trackKey } from '../../data/geo/tracks.js'
import { tramos, KM_COCHE_TOTAL } from '../../data/geo/tramos.js'
import { bases, hitos } from '../../data/geo/bases.js'

const statBy = (plan, label) => plan?.stats?.find((s) => s.label === label)?.value || ''

/* "8 km" → 8 · "≈16 km" → 16 · "0–1 km" → 0.5 · "Paseo urbano" → null */
export function parseKm(value) {
  if (!value) return null
  const nums = String(value)
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .match(/\d+(\.\d+)?/g)
  if (!nums) return null
  const n = nums.map(Number)
  return n.length > 1 ? (n[0] + n[1]) / 2 : n[0]
}

function planOf(day, letter) {
  const d = dias.find((x) => x.day === Number(day))
  return d?.plans.find((p) => p.plan === letter) || null
}

/* Plan recomendado de un día (fila `reco` de la tabla comparativa). */
export function recoPlan(day) {
  const d = dias.find((x) => x.day === Number(day))
  const row = d?.compare?.rows?.find((r) => r.type === 'reco')
  if (!row) return null
  const i = row.values.findIndex((v) => v && /recomend/i.test(String(v)))
  return i >= 0 ? d.plans[i]?.plan || null : null
}

/**
 * @param {Object} sel   selección { "5": "A", … } de TripContext
 * @param {'todo'|number} focus  día enfocado o el viaje entero
 * @param {boolean} showSuggested  pintar en fantasma las rutas de los días sin elegir
 */
export function deriveLayers(sel, focus = 'todo', showSuggested = true) {
  const inFocus = (day) => focus === 'todo' || Number(focus) === Number(day)

  const routes = []
  const missing = []

  for (const d of dias) {
    const chosen = sel[String(d.day)]
    const letter = chosen || (showSuggested ? recoPlan(d.day) : null)
    if (!letter) continue

    const plan = planOf(d.day, letter)
    const track = tracks[trackKey(d.day, letter)]

    if (!track) {
      /* `sinRuta` = el plan no tiene recorrido (día de llegada, descanso en el
         camping…). No es un track pendiente, así que no se avisa de él. */
      if (chosen && !plan?.sinRuta) missing.push({ day: d.day, plan: letter, name: plan?.name || '' })
      continue
    }

    routes.push({
      key: trackKey(d.day, letter),
      day: d.day,
      dayId: d.id,
      plan: letter,
      name: track.name || plan?.name || '',
      type: plan?.type || '',
      kind: track.kind,
      path: track.path,
      pois: track.pois || [],
      chosen: Boolean(chosen),
      focused: inFocus(d.day),
      dist: statBy(plan, 'Distancia'),
      desnivel: statBy(plan, 'Desnivel'),
      tiempo: statBy(plan, 'Tiempo'),
    })
  }

  const drives = tramos.map((t) => ({ ...t, focused: inFocus(t.day) }))

  const stops = [
    ...bases.map((b) => ({ ...b, focused: focus === 'todo' || b.days.includes(Number(focus)) })),
    ...hitos.map((h) => ({ ...h, days: [], focused: focus === 'todo' })),
  ]

  /* Kilómetros a pie de los planes REALMENTE elegidos (no de los sugeridos). */
  const kmPie = Object.entries(sel).reduce((n, [day, letter]) => {
    const km = parseKm(statBy(planOf(day, letter), 'Distancia'))
    return km ? n + km : n
  }, 0)

  return {
    routes,
    drives,
    stops,
    missing,
    kmPie: Math.round(kmPie),
    kmCoche: KM_COCHE_TOTAL,
    nChosen: Object.keys(sel).length,
    nWithTrack: routes.filter((r) => r.chosen).length,
  }
}

/* Todos los puntos visibles, para encuadrar el mapa. */
export function boundsOf(layers, focus = 'todo') {
  const pts = []
  layers.routes.filter((r) => r.focused).forEach((r) => pts.push(...r.path))
  if (focus === 'todo') {
    layers.drives.forEach((t) => pts.push(...t.path))
  } else {
    layers.drives.filter((t) => t.focused).forEach((t) => pts.push(...t.path))
    layers.stops.filter((s) => s.focused && s.kind === 'base').forEach((s) => pts.push(s.coords))
  }
  return pts.length >= 2 ? pts : null
}
