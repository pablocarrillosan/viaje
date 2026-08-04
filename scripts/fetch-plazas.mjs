#!/usr/bin/env node
/**
 * fetch-plazas.mjs — refresca la instantánea de disponibilidad de los refugios
 *
 *   npm run fetch:plazas
 *
 * Consulta la API pública que alimenta el calendario oficial de
 * alberguesyrefugios.com y escribe `src/data/plazas.json`, que es lo que pinta la
 * sección «Plazas en refugios» de la web.
 *
 *   GET /refugios/getAll?lang=es              → catálogo (friendlyurl → id)
 *   GET /refugios/get/<id>/getPlazas2/        → disponibilidad por día
 *       "2026-08-25": { plazasUsadas: 81, plazasDisponibles: 85, plazas: 4 }
 *
 *   plazas = plazasDisponibles − plazasUsadas = HUECOS LIBRES
 *
 * ⚠ «0 plazas» significa COMPLETO ONLINE, no que el refugio esté lleno: el motor de
 * reservas por internet maneja un cupo limitado de cada establecimiento (por eso
 * plazasDisponibles varía de un día a otro y no coincide con el aforo). Antes de
 * descartar una fecha, llamar al refugio.
 *
 * ⚠ El campo «estado» de la API NO indica disponibilidad y se ignora: hoy mismo sale
 * con estado 3 teniendo plazas libres, porque no se puede reservar el mismo día.
 *
 * La web intenta además refrescar estos datos en vivo al abrirse; si CORS lo impide,
 * se queda con esta instantánea y muestra su fecha. Por eso conviene relanzarlo de
 * vez en cuando y commitear el JSON.
 */

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://api.alberguesyrefugios.com'
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = join(RAIZ, 'src', 'data', 'plazas.json')

// Refugios del viaje y ventana de fechas que interesa publicar
const REFUGIOS = ['respomuso', 'goriz', 'linza']
const VENTANA = { desde: '2026-08-21', hasta: '2026-08-30' }

const CABECERAS = {
  Accept: 'application/json',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: 'https://www.alberguesyrefugios.com/',
  'User-Agent': 'pirineos2026/1.0 (web personal de viaje)',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pedir(url) {
  const res = await fetch(url, { headers: CABECERAS })
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`)
  return res.json()
}

function enVentana(fecha) {
  return fecha >= VENTANA.desde && fecha <= VENTANA.hasta
}

async function main() {
  console.log('Pidiendo el catálogo de refugios…')
  const catalogo = await pedir(`${API}/refugios/getAll?lang=es`)

  const porUrl = {}
  for (const r of catalogo?.result || []) {
    if (r.friendlyurl) porUrl[r.friendlyurl] = r
  }

  const salida = {
    generado: new Date().toISOString(),
    ventana: VENTANA,
    fuente: `${API}/refugios/get/<id>/getPlazas2/`,
    refugios: {},
  }

  for (const clave of REFUGIOS) {
    const meta = porUrl[clave]
    if (!meta) {
      console.warn(`⚠ "${clave}" no aparece en el catálogo; lo dejo vacío.`)
      salida.refugios[clave] = null
      continue
    }

    process.stdout.write(`· ${meta.nombre} (id ${meta.id}) … `)
    let alojamientos = []
    try {
      const json = await pedir(`${API}/refugios/get/${meta.id}/getPlazas2/`)
      alojamientos = Object.values(json?.result || {}).map((h) => {
        const dias = {}
        for (const [fecha, d] of Object.entries(h.plazas || {})) {
          if (!enVentana(fecha)) continue
          const declarado = Number(d.plazas)
          dias[fecha] = Number.isFinite(declarado)
            ? declarado
            : Number(d.plazasDisponibles) - Number(d.plazasUsadas)
        }
        return { id: h.id, nombre: h.nombre, maxPlazas: h.maxPlazas, dias }
      })
    } catch (err) {
      console.log(`error: ${err.message}`)
      salida.refugios[clave] = null
      continue
    }

    const conDatos = alojamientos.filter((a) => Object.keys(a.dias).length)
    console.log(conDatos.length ? `${conDatos.length} tipo(s) de plaza` : 'sin reserva online')

    salida.refugios[clave] = {
      id: meta.id,
      nombre: meta.nombre,
      telefono: meta.telefono || '',
      web: `https://www.alberguesyrefugios.com/${clave}/reservar`,
      alojamientos: conDatos,
    }

    await sleep(700)   // un respiro entre peticiones
  }

  await writeFile(SALIDA, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n✓ Escrito src/data/plazas.json (${salida.generado})`)
  console.log('  Recuerda commitearlo para que la web publicada lo lleve.')
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`)
  console.error('  No se ha tocado src/data/plazas.json.')
  process.exit(1)
})
