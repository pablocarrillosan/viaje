#!/usr/bin/env node
/**
 * alerta-plazas.mjs — comprueba si hay sitio en las noches de refugio del viaje
 *
 * Pensado para correr en GitHub Actions (.github/workflows/plazas-alerta.yml),
 * pero funciona igual en local:  node scripts/alerta-plazas.mjs
 *
 * Lee los objetivos de `src/data/noches.js`, así que itinerario y alerta no se
 * pueden desincronizar: si cambias una noche allí, esto la sigue.
 *
 * Fuente de verdad: la API que alimenta el calendario de alberguesyrefugios.com.
 *   plazas = plazasDisponibles − plazasUsadas = huecos libres
 *
 * ⚠ «0 plazas» es completo ONLINE, no refugio lleno: el cupo de internet es solo
 * una parte del aforo. Antes de descartar una fecha, llamar al refugio.
 *
 * Salida:
 *   - por pantalla, un resumen legible
 *   - si corre en Actions, escribe en $GITHUB_OUTPUT:  hay, titulo, cuerpo
 *   - código de salida 0 siempre (que no falle el workflow por no haber plazas)
 */

import { appendFileSync } from 'node:fs'
import { NOCHES_EN_REFUGIO, PLAZAS_NECESARIAS } from '../src/data/noches.js'

const API = 'https://api.alberguesyrefugios.com'
const CABECERAS = {
  Accept: 'application/json',
  'Accept-Language': 'es-ES,es;q=0.9',
  Referer: 'https://www.alberguesyrefugios.com/',
  'User-Agent': 'pirineos2026-alerta/1.0',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pedir(url) {
  const res = await fetch(url, { headers: CABECERAS })
  if (!res.ok) throw new Error(`${url} respondió ${res.status}`)
  return res.json()
}

function salidaActions(clave, valor) {
  if (!process.env.GITHUB_OUTPUT) return
  const delim = `EOF_${Math.random().toString(36).slice(2)}`
  appendFileSync(process.env.GITHUB_OUTPUT, `${clave}<<${delim}\n${valor}\n${delim}\n`)
}

async function main() {
  const catalogo = await pedir(`${API}/refugios/getAll?lang=es`)
  const porUrl = {}
  for (const r of catalogo?.result || []) if (r.friendlyurl) porUrl[r.friendlyurl] = r

  // Agrupamos las noches por refugio para pedir cada uno una sola vez
  const porRefugio = {}
  for (const noche of Object.values(NOCHES_EN_REFUGIO)) {
    ;(porRefugio[noche.refugio] ||= []).push(noche)
  }

  const lecturas = []
  const hallazgos = []

  for (const [clave, noches] of Object.entries(porRefugio)) {
    const meta = porUrl[clave]
    if (!meta) {
      lecturas.push(`- **${clave}**: no aparece en el catálogo de la API`)
      continue
    }

    let alojamientos = []
    try {
      const json = await pedir(`${API}/refugios/get/${meta.id}/getPlazas2/`)
      alojamientos = Object.values(json?.result || {})
    } catch (err) {
      lecturas.push(`- **${meta.nombre}**: error consultando la API (${err.message})`)
      continue
    }

    for (const noche of noches) {
      for (const a of alojamientos) {
        const d = a.plazas?.[noche.fecha]
        if (!d) continue
        const declarado = Number(d.plazas)
        const libres = Number.isFinite(declarado)
          ? declarado
          : Number(d.plazasDisponibles) - Number(d.plazasUsadas)

        lecturas.push(
          `- **${meta.nombre}** · noche del ${noche.fecha} · ${a.nombre}: ` +
          `**${libres}** ${libres === 1 ? 'plaza' : 'plazas'}`
        )

        if (libres >= PLAZAS_NECESARIAS) {
          hallazgos.push({
            refugio: meta.nombre,
            clave,
            telefono: meta.telefono || '',
            fecha: noche.fecha,
            alojamiento: a.nombre,
            libres,
          })
        }
      }
    }
    await sleep(700)
  }

  const resumen = lecturas.length ? lecturas.join('\n') : '_Sin lecturas._'
  console.log(resumen.replace(/\*\*/g, ''))

  if (!hallazgos.length) {
    console.log(`\nSin sitio para ${PLAZAS_NECESARIAS} personas en ninguna noche.`)
    salidaActions('hay', 'false')
    return
  }

  const titulo = `Plazas libres: ${hallazgos.map((h) => `${h.refugio} ${h.fecha}`).join(' · ')}`
  const cuerpo = [
    `Hay sitio para **${PLAZAS_NECESARIAS} personas**:`,
    '',
    ...hallazgos.map(
      (h) =>
        `- **${h.refugio}** · noche del ${h.fecha} · ${h.alojamiento}: **${h.libres} plazas** — ` +
        `[reservar](https://www.alberguesyrefugios.com/${h.clave}/reservar)` +
        (h.telefono ? ` · tel. ${h.telefono}` : '')
    ),
    '',
    '<details><summary>Lectura completa de esta comprobación</summary>',
    '',
    resumen,
    '',
    '</details>',
    '',
    '---',
    '',
    'Dato de la API que alimenta el calendario oficial (`plazasDisponibles − plazasUsadas`).',
    'Recuerda que **«0 plazas» es completo _online_**: el cupo de internet es solo una parte',
    'del aforo, así que una fecha a cero puede tener sitio llamando por teléfono.',
    '',
    'Cierra esta issue cuando hayas reservado o cuando deje de interesarte.',
  ].join('\n')

  console.log(`\n🎉 ${titulo}`)
  salidaActions('hay', 'true')
  salidaActions('titulo', titulo)
  salidaActions('cuerpo', cuerpo)
}

main().catch((err) => {
  console.error(`Error: ${err.message}`)
  salidaActions('hay', 'false')
})
