#!/usr/bin/env node
/* ============================================================================
   Render headless del bloque «El viaje» (`npm run check:render`).
   ----------------------------------------------------------------------------
   Cada entrada del changelog dice «verificado con render headless» y hasta ahora
   el arnés se rehacía a mano cada vez. Esto lo deja fijo: monta `#viaje` en jsdom
   con y sin plan elegido y comprueba lo que no se ve en un `vite build`:

     · que elegir un plan reescribe el día entero (texto, foto, ficha, chip) y no
       deja rastro del texto de las otras alternativas
     · que sin elegir nada el día se abre por la alternativa recomendada, pero sin
       afirmar que esté elegida
     · que el iframe de meteoblue se monta al entrar en pantalla, con la altitud
       del punto alto de ESE plan en la URL (que es lo que hace que el parte sea
       el de la cima y no el del aparcamiento)
     · que no se cuela ningún error de consola de React

   No hace peticiones de red: solo mira la URL que se le pasa al iframe.
   Sale con código 1 si algo falla.
   ========================================================================== */

import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

import { dias } from '../src/data/dias.js'
import { getPunto } from '../src/data/geo/meteo.js'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const ENTRADA = 'scripts/.ssr-meteo-entry.jsx'
const SALIDA = join(RAIZ, 'node_modules', '.check-render-' + Date.now())

const fallos = []
const ok = (cond, que) => (cond ? console.log(`  ✓ ${que}`) : fallos.push(que))

/* React escapa el marcado, así que «Midi d'Ossau» sale como «Midi d&#x27;Ossau»
   y un `includes` del texto original falla sin que haya nada roto. Se deshace la
   escapada antes de comparar. */
const texto = (html) =>
  html
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

/* 1 · Empaquetar con Vite (resuelve JSX, CSS Modules y los SVG `?react`) ---- */
console.log('Empaquetando el bloque #viaje…')
execFileSync('npx', ['vite', 'build', '--ssr', ENTRADA, '--outDir', SALIDA, '--logLevel', 'warn'], {
  cwd: RAIZ,
  stdio: 'inherit',
})

/* 2 · DOM de mentira ------------------------------------------------------- */
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://pirineos.test/',
  pretendToBeVisual: true,
})
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
globalThis.localStorage = dom.window.localStorage
/* IntersectionObserver que dispara al observar: simula «ya está en pantalla»,
   que es lo que hace falta para que el iframe diferido se monte. */
globalThis.IntersectionObserver = class {
  constructor(cb) { this.cb = cb }
  observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
  disconnect() {}
}

const errores = []
console.error = (...a) => errores.push(a.join(' '))

const { render, mount } = await import(join(SALIDA, '.ssr-meteo-entry.js'))

const DIA = 1
const dia = dias.find((d) => d.day === DIA)

/* 3 · Sin nada elegido: se abre el recomendado, pero no se dice «elegido» --- */
console.log('\nDía 1, sin plan elegido:')
const reco = dia.compare.rows.find((r) => r.type === 'reco')
const iReco = reco.values.findIndex((v) => /recomend/i.test(String(v)))
const planReco = dia.plans[iReco]
const sin = texto(render({}))
ok(sin.includes(planReco.desc), 'el día se abre por la alternativa recomendada')
ok(sin.includes('recomendado'), 'la pestaña recomendada va marcada')
ok(!/elegido/.test(sin), 'no se afirma que haya nada elegido')
ok(/Elegir este plan/.test(sin), 'el botón de elegir sigue disponible')

/* 4 · Con un plan elegido: el día ENTERO es ese plan ------------------------ */
const LETRA = 'D'
const plan = dia.plans.find((p) => p.plan === LETRA)
const otro = dia.plans.find((p) => p.plan !== LETRA)
const punto = getPunto(DIA, LETRA)

console.log(`\nDía ${DIA} con el plan ${LETRA} elegido («${plan.name}»):`)
const con = texto(render({ [DIA]: LETRA }))
ok(con.includes(plan.desc), 'el texto del día es el del plan')
ok(!con.includes(otro.desc), 'no se cuela el texto de las otras alternativas')
ok(con.includes(`Plan ${LETRA} elegido`), 'la cabecera del día lleva el chip del plan')
ok(con.includes(plan.when), 'se vuelca «cuándo elegirla» del plan')
ok(con.includes(`Este es tu plan del día ${dia.num}`), 'el botón refleja que ya está elegido')
ok(con.includes(`Tiempo en ${punto.name}`), 'se nombra el punto de referencia meteorológico')
ok(/De la jornada, elijas lo que elijas/.test(con), 'lo que no depende del plan queda aparte')
ok(dia.plans.every((p) => con.includes(p.name)), 'la barra lista las alternativas del día')
ok(/meteoblue\.com\/es\/tiempo\/14-dias/.test(con), 'enlace a los 14 días de meteoblue')
ok(/pronostico\/multimodel/.test(con), 'enlace al meteograma multimodelo')

/* 5 · El iframe, ya con efectos -------------------------------------------- */
console.log('\nWidget de meteoblue (montado de verdad):')
const html = await mount({ [DIA]: LETRA }, dom.window.document.getElementById('root'))
const src = (html.match(/src="([^"]*widget\/daily[^"]*)"/) || [])[1]?.replace(/&amp;/g, '&')
ok(Boolean(src), 'el iframe se monta al entrar el bloque en pantalla')
if (src) {
  console.log(`    ${decodeURIComponent(src.split('?')[0])}`)
  ok(src.includes(`E${Math.round(punto.alt)}_`), `la URL lleva la altitud del punto (${punto.alt} m)`)
  ok(src.includes(punto.at[0].toFixed(4)), 'la URL lleva la latitud del punto')
  ok(src.includes('days=7'), 'se piden los 7 días que da meteoblue')
}

/* 6 · Informe -------------------------------------------------------------- */
console.log(`\nErrores de consola de React: ${errores.length}`)
errores.slice(0, 5).forEach((e) => console.log(`  · ${e}`))

if (fallos.length || errores.length) {
  console.error('\nFALLOS:\n - ' + [...fallos, ...errores.slice(0, 5)].join('\n - '))
  process.exit(1)
}
console.log('\nTodo correcto.')
