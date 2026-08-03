#!/usr/bin/env node
/* ============================================================================
   Convierte tracks de GPS reales (.gpx) en entradas de `src/data/geo/tracks.js`.
   `npm run import:gpx`

   POR QUÉ EXISTE
   Los tracks originales eran bocetos de 4 a 29 puntos interpolados a mano entre
   waypoints. Sobre el mapa se ven como rectas que cruzan crestas y barrancos, y
   miden mucho menos que la ruta real (Monte Perdido: 5,0 km dibujados frente a
   los 14 publicados). Un GPX de verdad trae un punto cada 5-20 m.

   CÓMO SE USA
   1. Descarga el GPX (Wikiloc, la app que uses…) de cada ruta.
   2. Déjalo en `gpx/` con el nombre de su clave: día 2 plan C → `gpx/d2c.gpx`.
      Es la misma convención `dNx` que ya usan `tracks.js` y los SVG.
   3. `npm run import:gpx` → escribe `src/data/geo/tracks.generado.js`.
   4. Revisa la tabla y copia las entradas a `tracks.js`.

   NO NECESITA RED NI DEPENDENCIAS.

   QUÉ COMPRUEBA (y por qué puede fallar)
   · Que el track cae dentro del Pirineo aragonés: un GPX equivocado se detecta
     al instante.
   · Que su longitud cuadra con la distancia publicada en el día. Si no cuadra,
     o el GPX no es de esa ruta o la ficha del día tiene la distancia mal.
   · Que la clave `dNx` corresponde a un día y un plan que existen.

   Sale con código 1 si algo de eso falla: no quieres copiar a ciegas.
   ========================================================================== */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dias } from '../src/data/dias.js'
import { tracks as tracksActuales } from '../src/data/geo/tracks.js'
import { PIRINEO_BOUNDS } from '../src/data/geo/bases.js'

const CARPETA = new URL('../gpx/', import.meta.url)

/* Un sendero de montaña gira mucho más que una carretera: 25 m conserva las
   revueltas y aun así deja los ficheros en un tamaño razonable. */
const TOLERANCIA_M = 25

/* Margen al comparar con la distancia publicada, que es siempre redondeada. */
const MARGEN = 0.25

const hav = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180
  const dLa = rad(b[0] - a[0])
  const dLo = rad(b[1] - a[1])
  const x =
    Math.sin(dLa / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLo / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(x))
}
const largo = (p) => p.slice(1).reduce((n, q, i) => n + hav(p[i], q), 0)

/* Douglas–Peucker (mismo criterio que build-tramos.mjs). */
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

/* GPX es XML simple: no merece una dependencia. Se leen <trkpt> y <wpt>. */
function parseGpx(xml) {
  const punto = (tag) =>
    [...xml.matchAll(new RegExp(`<${tag}[^>]*\\blat="([-\\d.]+)"[^>]*\\blon="([-\\d.]+)"[^>]*>`, 'g'))]
  const trk = punto('trkpt').map((m) => [Number(m[1]), Number(m[2])])
  /* Los <wpt> del GPX se aprovechan como pois si los trae. */
  const wpts = [...xml.matchAll(/<wpt[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*>([\s\S]*?)<\/wpt>/g)]
    .map((m) => ({
      at: round([Number(m[1]), Number(m[2])]),
      label: (m[3].match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? '').trim(),
    }))
    .filter((w) => w.label)
  return { trk, wpts }
}

const statBy = (plan, label) => plan?.stats?.find((s) => s.label === label)?.value ?? ''
const parseKm = (txt) => {
  const n = String(txt).replace(',', '.').match(/[\d.]+/g)
  return n ? Number(n[n.length - 1]) : null
}

/* --- Recorrido de la carpeta ---------------------------------------------- */

if (!existsSync(CARPETA)) {
  console.error(`✗ No existe la carpeta ${CARPETA.pathname}`)
  console.error('  Créala y deja dentro los .gpx con el nombre de su clave (d2c.gpx, d6a.gpx…).')
  process.exit(1)
}

const ficheros = (await readdir(CARPETA)).filter((f) => f.toLowerCase().endsWith('.gpx')).sort()
if (!ficheros.length) {
  console.error(`✗ No hay ningún .gpx en ${CARPETA.pathname}`)
  console.error('  Nómbralos con su clave: día 2 plan C → d2c.gpx')
  process.exit(1)
}

const out = []
const errores = []
const avisos = []

console.log(`Leyendo ${ficheros.length} fichero(s) de ${CARPETA.pathname}\n`)
console.log(
  `${'clave'.padEnd(6)} ${'pts GPX'.padStart(8)} ${'pts'.padStart(5)} ${'medido'.padStart(8)} ${'publicado'.padStart(10)}  ratio`,
)

for (const f of ficheros) {
  const key = f.replace(/\.gpx$/i, '').toLowerCase()
  const m = key.match(/^d(\d{1,2})([a-g])$/)
  if (!m) {
    errores.push(`${f}: el nombre no es una clave dNx válida (ej. d2c.gpx)`)
    continue
  }
  const day = Number(m[1])
  const plan = m[2].toUpperCase()

  const dia = dias.find((d) => d.day === day)
  const planObj = dia?.plans.find((p) => p.plan === plan)
  if (!dia) {
    errores.push(`${f}: no existe el día ${day}`)
    continue
  }
  if (!planObj) {
    errores.push(`${f}: el día ${day} no tiene plan ${plan}`)
    continue
  }

  const { trk, wpts } = parseGpx(await readFile(new URL(f, CARPETA), 'utf8'))
  if (trk.length < 2) {
    errores.push(`${f}: no encuentro puntos <trkpt> (¿es un GPX de ruta?)`)
    continue
  }

  /* ¿Está en el Pirineo aragonés? */
  const [[laMin, loMin], [laMax, loMax]] = PIRINEO_BOUNDS
  const fuera = trk.filter((p) => p[0] < laMin || p[0] > laMax || p[1] < loMin || p[1] > loMax)
  if (fuera.length > trk.length * 0.02)
    errores.push(
      `${f}: ${fuera.length} de ${trk.length} puntos caen fuera del Pirineo aragonés. ¿GPX equivocado?`,
    )

  const kmReal = largo(trk)
  const path = simplify(trk, TOLERANCIA_M).map(round)
  const kmSimple = largo(path)

  /* ¿Cuadra con lo que publica la ficha del día? */
  const pub = parseKm(statBy(planObj, 'Distancia'))
  const kindActual = tracksActuales[key]?.kind
  const kind = hav(trk[0], trk.at(-1)) < 0.15 && kindActual !== 'ida-vuelta'
    ? 'circular'
    : (kindActual ?? 'ida')

  /* Un GPX de Wikiloc de una ruta «ida y vuelta» normalmente graba LA CAMINATA
     ENTERA, ida incluida la vuelta. Los `path` escritos a mano en tracks.js, en
     cambio, dibujaban solo la ida, y por eso `check:geo` los multiplica por 2.
     Mezclar ambos criterios doblaría la distancia de los GPX completos, así que
     no se adivina: se prueban las dos lecturas contra la distancia publicada y
     se marca cuál encaja con `pathCompleto`. */
  const rEntero = pub ? kmReal / pub : null
  const rSoloIda = pub ? (kmReal * 2) / pub : null
  const cabe = (r) => r !== null && r >= 1 - MARGEN && r <= 1 + MARGEN
  const pathCompleto = kind === 'ida-vuelta' ? cabe(rEntero) : true
  const ratio = kind === 'ida-vuelta' && !pathCompleto ? rSoloIda : rEntero
  const kmComparable = kind === 'ida-vuelta' && !pathCompleto ? kmReal * 2 : kmReal

  console.log(
    `${key.padEnd(6)} ${String(trk.length).padStart(8)} ${String(path.length).padStart(5)} ` +
      `${kmComparable.toFixed(1).padStart(6)} km ${(pub ? pub.toFixed(0) : '—').padStart(7)} km ` +
      `${ratio ? ratio.toFixed(2).padStart(6) : '     —'}` +
      (cabe(ratio) || ratio === null
        ? kind === 'ida-vuelta'
          ? pathCompleto
            ? '   (GPX con ida y vuelta)'
            : '   (GPX de solo la ida)'
          : ''
        : '  ← NO CUADRA'),
  )

  if (ratio !== null && !cabe(ratio))
    errores.push(
      `${key}: el GPX mide ${kmReal.toFixed(1)} km y la ficha publica ${pub} km. ` +
        `No cuadra ni leyéndolo entero (${rEntero.toFixed(2)}) ni como solo la ida (${rSoloIda.toFixed(2)}). ` +
        `O el GPX no es de esta ruta, o la ficha tiene la distancia mal.`,
    )
  if (kmSimple < kmReal * 0.95)
    avisos.push(`${key}: al simplificar pierde ${((1 - kmSimple / kmReal) * 100).toFixed(0)} % de longitud`)
  if (!tracksActuales[key]) avisos.push(`${key}: es un track NUEVO (no existía en tracks.js)`)

  out.push({
    key,
    day,
    plan,
    name: tracksActuales[key]?.name ?? planObj.name,
    kind,
    /* Solo se escribe cuando aporta: «este path ya trae la vuelta, no lo dobles». */
    ...(kind === 'ida-vuelta' && pathCompleto ? { pathCompleto: true } : {}),
    start: path[0],
    end: path.at(-1),
    path,
    /* Se conservan los pois escritos a mano; los <wpt> del GPX solo si no había. */
    pois: tracksActuales[key]?.pois?.length ? tracksActuales[key].pois : wpts,
    _kmReal: Number(kmReal.toFixed(2)),
    _puntosGpx: trk.length,
  })
}

if (!out.length) {
  console.error('\n✗ No se ha podido importar ningún track. NO se escribe nada.')
  if (errores.length) console.error(' - ' + errores.join('\n - '))
  process.exit(1)
}

const destino = new URL('../src/data/geo/tracks.generado.js', import.meta.url)
const cuerpo = out
  .map((t) => {
    const { key, _kmReal, _puntosGpx, path, pois, ...resto } = t
    const lineas = []
    for (let k = 0; k < path.length; k += 4)
      lineas.push('      ' + path.slice(k, k + 4).map(([la, lo]) => `[${la}, ${lo}]`).join(', ') + ',')
    return (
      `  /* ${_kmReal} km reales · ${_puntosGpx} puntos en el GPX → ${path.length} tras simplificar */\n` +
      `  ${key}: {\n` +
      Object.entries(resto)
        .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
        .join('\n') +
      `\n    path: [\n${lineas.join('\n')}\n    ],\n` +
      `    pois: ${JSON.stringify(pois, null, 6).replace(/\n/g, '\n    ')},\n` +
      `  },`
    )
  })
  .join('\n')

await writeFile(
  destino,
  `/* Generado por scripts/import-gpx.mjs · ${new Date().toISOString().slice(0, 10)}
   Copia las entradas que te valgan a src/data/geo/tracks.js.

   Vienen de ficheros .gpx reales, simplificados a ${TOLERANCIA_M} m. Los \`pois\`
   escritos a mano en tracks.js se conservan; si no había, se usan los <wpt> del
   GPX (si el fichero traía).

   Después de copiar: \`npm run check:geo\`.${
     errores.length ? `\n\n   ⚠ ${errores.length} track(s) con problemas. Revísalos antes de copiar.` : ''
   } */\n\nexport const generado = {\n${cuerpo}\n}\n`,
)

console.log(`\nEscrito ${destino.pathname} · ${out.length} track(s)`)
if (avisos.length) console.log('\nAvisos:\n - ' + avisos.join('\n - '))
if (errores.length) {
  console.error('\n✗ ERRORES:\n - ' + errores.join('\n - '))
  process.exit(1)
}
console.log('\n✓ Todos los tracks cuadran con las distancias publicadas.')
