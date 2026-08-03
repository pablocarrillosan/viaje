#!/usr/bin/env node
/* ============================================================================
   Regenera la GEOMETRÍA REAL de los trayectos en coche (`npm run build:tramos`).

   Las polilíneas de `src/data/geo/tramos.js` estaban trazadas a mano sobre los
   pueblos y puertos de cada vía: seguían el corredor, pero no eran la
   carretera. Este script pide a OSRM el trazado exacto, lo simplifica
   (Douglas–Peucker) y escribe `src/data/geo/tramos.generado.js` para que
   puedas revisarlo y sustituir los `path`.

   REQUIERE RED (usa el OSRM público, que es de cortesía: no abuses).

   UNA SOLA PETICIÓN POR TRAMO: origen → destino, SIN puntos de paso. De ahí
   salen a la vez los km, el tiempo y la geometría.

   Esto es un cambio respecto a la primera versión, que mandaba los waypoints
   dibujados a mano como puntos de paso «para que OSRM eligiera el corredor
   correcto». Era contraproducente: esos waypoints son aproximados, OSRM está
   obligado a pasar EXACTAMENTE por cada uno, y cuando alguno cae a unos metros
   de la calzada o en una horquilla de Cotefablo engancha mal y hace ida y
   vuelta para rectificar. Inflaba Sallent→Torla a 99 km / 5 h 12 (19 km/h)
   cuando son 45 km, y devolvía un trazado con marchas atrás.

   No hacen falta: en estos seis tramos el corredor alternativo más próximo es
   entre 26 y 129 km más largo, así que la ruta rápida ya es la buena. En vez
   de forzarla, se COMPRUEBA: cada tramo declara en tramos.js un array
   `control` con los puntos por los que tiene que pasar (Cotefablo, Ansó,
   Ayerbe…) y el script mide la distancia de la polilínea a cada uno.

   Al terminar imprime `OSRM vs. publicado`, marca los tramos que se desvían
   ≥5 % en km y avisa de cualquier punto de control que quede lejos del
   trazado.

   Códigos de salida: 0 = todo bien · 1 = algún tramo falló o algún punto de
   control no se cumple. Si fallan TODOS no se escribe nada (antes dejaba un
   `generado = []` que parecía válido); si falla solo alguno, se escribe con un
   aviso de PARCIAL en la cabecera.
   ========================================================================== */

import { writeFile } from 'node:fs/promises'
import { tramos } from '../src/data/geo/tramos.js'

const OSRM = 'https://router.project-osrm.org/route/v1/driving/'

/* Simplificación del trazado. 150 m es invisible al zoom del mapa (que enseña
   valles enteros) y evita meter ~2.500 puntos en tramos.js. */
const TOLERANCIA_M = 150

/* Cuánto puede alejarse el trazado de un punto de control antes de dar aviso.
   3 km: las coordenadas de los pueblos son del centro y muchas variantes los
   bordean; el túnel de Cotefablo, en cambio, está sobre la propia calzada. */
const TOLERANCIA_CONTROL_KM = 3

/* Douglas–Peucker sobre coordenadas geográficas (aprox. plano local). */
const perp = (p, a, b) => {
  const x = (p[1] - a[1]) * Math.cos((p[0] * Math.PI) / 180) * 111320
  const y = (p[0] - a[0]) * 110540
  const bx = (b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180) * 111320
  const by = (b[0] - a[0]) * 110540
  const len = Math.hypot(bx, by)
  return len === 0 ? Math.hypot(x, y) : Math.abs(x * by - y * bx) / len
}
function simplify(pts, tol) {
  if (pts.length < 3) return pts
  let max = 0
  let idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perp(pts[i], pts[0], pts[pts.length - 1])
    if (d > max) [max, idx] = [d, i]
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]]
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)]
}

const round = (p) => [Number(p[0].toFixed(5)), Number(p[1].toFixed(5))]

const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const xy = ([la, lo]) => `${lo},${la}`

async function osrm(coords, overview) {
  const geo = overview === 'false' ? '' : '&geometries=geojson'
  const res = await fetch(`${OSRM}${coords}?overview=${overview}${geo}`)
  if (!res.ok) throw new Error(`OSRM ${res.status}`)
  const route = (await res.json()).routes?.[0]
  if (!route) throw new Error('OSRM no devuelve ruta')
  return route
}

/* Distancia en km entre dos puntos [lat, lon]. */
const hav = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180
  const dLa = rad(b[0] - a[0])
  const dLo = rad(b[1] - a[1])
  const x =
    Math.sin(dLa / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLo / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(x))
}

/* Distancia mínima de un punto a la polilínea (por vértices; con el trazado
   simplificado a 150 m es más que suficiente para saber si pasa por un pueblo). */
const distAlTrazado = (punto, path) => Math.min(...path.map((p) => hav(punto, p)))

/* Una petición por tramo: origen → destino, sin puntos de paso.
   Km, tiempo y geometría salen todos de aquí. */
async function pedirTramo(tramo) {
  const route = await osrm(`${xy(tramo.path[0])};${xy(tramo.path.at(-1))}`, 'full')
  const pts = route.geometry.coordinates.map(([lo, la]) => [la, lo])
  return {
    path: simplify(pts, TOLERANCIA_M).map(round),
    puntosCrudos: pts.length,
    kmOsrm: Math.round(route.distance / 1000),
    minOsrm: Math.round(route.duration / 60),
  }
}

/* ¿La ruta que ha elegido OSRM pasa por donde tiene que pasar? */
function revisarControles(tramo, path) {
  return (tramo.control ?? [])
    .map(([nombre, la, lo]) => ({ nombre, dist: distAlTrazado([la, lo], path) }))
    .filter((c) => c.dist > TOLERANCIA_CONTROL_KM)
}

/* Un reintento: el OSRM público limita por ratio y devuelve 429 de vez en cuando. */
async function conReintento(fn) {
  try {
    return await fn()
  } catch {
    process.stdout.write('reintentando… ')
    await espera(3000)
    return await fn()
  }
}

const out = []
const fallos = []
const desvios = []
for (const t of tramos) {
  process.stdout.write(`· ${t.id} … `)
  try {
    const g = await conReintento(() => pedirTramo(t))
    const fuera = revisarControles(t, g.path)
    if (fuera.length) desvios.push({ id: t.id, fuera })
    console.log(
      `${g.kmOsrm} km / ${g.minOsrm} min (publicado: ${t.km} km / ${t.time}) · ` +
        `${g.path.length} puntos de ${g.puntosCrudos}` +
        (fuera.length ? `  ← ${fuera.length} punto(s) de control lejos` : ''),
    )
    out.push({ id: t.id, km: t.km, time: t.time, kind: t.kind, ...g })
  } catch (e) {
    console.log(`ERROR: ${e.message}`)
    fallos.push({ id: t.id, motivo: e.message })
  }
  await espera(1200) // cortesía con el OSRM público
}

/* ---- Nada que escribir: no dejamos un fichero vacío que parezca válido ---- */
if (out.length === 0) {
  console.error(`\n✗ Fallaron los ${fallos.length} tramos. NO se escribe nada.`)
  console.error('  Comprueba la conexión (el script necesita salir a router.project-osrm.org).')
  process.exit(1)
}

/* ---- Resumen de discrepancias: el motivo real de correr esto ------------- */
const hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`
const signo = (n) => (n >= 0 ? `+${n}` : `${n}`)

console.log('\nOSRM vs. publicado en mapa.js / tramos.js')
console.log(`  ${'tramo'.padEnd(16)} ${'OSRM'.padStart(8)} ${'publicado'.padStart(10)} ${'dif'.padStart(11)}   tiempo`)
const desviados = []
for (const r of out) {
  const dif = r.kmOsrm - r.km
  const pct = Math.round((dif / r.km) * 100)
  if (Math.abs(pct) >= 5) desviados.push(r.id)
  console.log(
    `  ${r.id.padEnd(16)} ${String(r.kmOsrm).padStart(5)} km ${String(r.km).padStart(7)} km ` +
      `${(signo(dif) + ' km').padStart(8)} ${(signo(pct) + '%').padStart(5)}   ` +
      `${hm(r.minOsrm).padStart(7)} vs ${r.time ?? '—'}${Math.abs(pct) >= 5 ? '   ← REVISAR' : ''}`,
  )
}

const traslados = out.filter((r) => r.kind === 'traslado')
const kmOsrmTotal = traslados.reduce((n, r) => n + r.kmOsrm, 0)
const kmPubTotal = traslados.reduce((n, r) => n + r.km, 0)
if (out.length === tramos.length) {
  console.log(`\n  BUCLE (solo traslados): ${kmOsrmTotal} km reales vs ${kmPubTotal} km publicados · ${signo(kmOsrmTotal - kmPubTotal)} km`)
}

/* ---- ¿Ha elegido OSRM el corredor que queremos? -------------------------- */
if (desvios.length) {
  console.log('\n⚠ Puntos de control fuera del trazado:')
  for (const d of desvios) {
    for (const c of d.fuera) {
      console.log(`    ${d.id.padEnd(16)} ${c.nombre} a ${c.dist.toFixed(1)} km del trazado`)
    }
  }
  console.log(`    La ruta rápida no pasa por donde dice \`via\` en tramos.js. O la carretera`)
  console.log(`    está cortada en los datos de OSM, o el punto de control está mal puesto.`)
  console.log(`    NO copies estos \`path\` sin mirar antes qué corredor ha cogido.`)
} else {
  console.log(`\n✓ Todos los puntos de control caen a menos de ${TOLERANCIA_CONTROL_KM} km del trazado.`)
}

const destino = new URL('../src/data/geo/tramos.generado.js', import.meta.url)
await writeFile(
  destino,
  `/* Generado por scripts/build-tramos.mjs · ${new Date().toISOString().slice(0, 10)}
   Copia cada \`path\` al tramo correspondiente de tramos.js.

   Todo sale de UNA petición origen→destino sin puntos de paso, así que los
   tres campos son coherentes entre sí: el \`path\` es exactamente la ruta que
   mide \`kmOsrm\` y dura \`minOsrm\`.

   Campos:
     km        → lo que publica ahora tramos.js (para comparar)
     kmOsrm    → distancia real de la ruta. Este es el que debe ir a tramos.js
     minOsrm      y mapa.js (a los tramos de montaña se les suma el margen de
                  agosto; ver la cabecera de tramos.js).
     path      → geometría simplificada a ${TOLERANCIA_M} m, en [lat, lon].
     puntosCrudos → cuántos puntos devolvió OSRM antes de simplificar.
${
  desvios.length
    ? `\n   ⚠ CONTROLES FUERA: ${desvios
        .map((d) => `${d.id} (${d.fuera.map((c) => c.nombre).join(', ')})`)
        .join(' · ')}\n   Revisa qué corredor ha cogido antes de copiar esos \`path\`.\n`
    : `\n   ✓ Los puntos de control de cada tramo caen sobre el trazado: OSRM ha\n     elegido los corredores correctos (Cotefablo, Ansó, Ayerbe…).\n`
}${
     fallos.length
       ? `\n   ⚠ PARCIAL: faltan ${fallos.length} de ${tramos.length} tramos (${fallos
           .map((f) => f.id)
           .join(', ')}).\n   NO sustituyas tramos.js a partir de este fichero sin volver a generarlo entero.\n`
       : ''
   } */\n\nexport const generado = ${JSON.stringify(out, null, 2)}\n`,
)
console.log(`\nEscrito ${destino.pathname} · ${out.length}/${tramos.length} tramos`)

if (desviados.length) {
  console.log(`\n⚠ ${desviados.length} tramo(s) con ≥5 % de desviación: ${desviados.join(', ')}`)
  console.log('  Los km publicados y los de OSRM no cuadran: decide cuál es el bueno.')
}

/* ---- Fallo parcial: se escribe, pero el script NO sale con éxito --------- */
if (fallos.length) {
  console.error(`\n✗ ${fallos.length} de ${tramos.length} tramos fallaron:`)
  for (const f of fallos) console.error(`    ${f.id}: ${f.motivo}`)
  console.error('  El fichero generado está INCOMPLETO. Vuelve a lanzarlo antes de copiar nada.')
  process.exit(1)
}

/* Un corredor equivocado no es un aviso cosmético: significa que el `path` que
   acabamos de escribir no es la carretera del viaje. Sale con error. */
if (desvios.length) {
  console.error(`\n✗ ${desvios.length} tramo(s) no pasan por sus puntos de control.`)
  process.exit(1)
}

console.log('\n✓ Todos los tramos regenerados y por el corredor correcto.')
