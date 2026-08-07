/* Entrada del render headless (`npm run check:render`).
   Se empaqueta con `vite build --ssr` para que Vite resuelva el JSX, los CSS
   Modules y los `?react` de los SVG; luego `check-render.mjs` la monta en jsdom.
   No entra en el bundle de la web: solo la usa el script de verificación. */
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TripProvider } from '../src/context/TripContext.jsx'
import { ViajeNavProvider } from '../src/context/ViajeNavContext.jsx'
import { PlazasProvider } from '../src/context/PlazasContext.jsx'
import Viaje from '../src/components/viaje/Viaje.jsx'

const arbol = () => h(PlazasProvider, null, h(TripProvider, null, h(ViajeNavProvider, null, h(Viaje))))

/** Marcado estático: rápido, pero SIN efectos (no hay iframe: es diferido). */
export function render(sel) {
  globalThis.localStorage.setItem('pirineos2026-seleccion', JSON.stringify(sel))
  return renderToStaticMarkup(arbol())
}

/** Montaje real en jsdom: aquí sí corren los efectos, así que se ve el iframe. */
export async function mount(sel, el) {
  const { createRoot } = await import('react-dom/client')
  const { act } = await import('react')
  globalThis.localStorage.setItem('pirineos2026-seleccion', JSON.stringify(sel))
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const root = createRoot(el)
  await act(async () => root.render(arbol()))
  return el.innerHTML
}
