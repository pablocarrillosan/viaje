import { createContext, useContext, useRef, useState, useCallback } from 'react'

/* Estado de la pestaña activa del bloque #viaje + navegación cruzada.
   Reemplaza el showView() del IIFE original: cualquier componente (Nav "Tu viaje",
   items de la Timeline, las propias pestañas) puede pedir cambiar de vista y, si
   procede, hacer scroll de la página hasta el bloque bajo la barra de navegación. */
const ViajeNavContext = createContext(null)

function navHeight() {
  const nav = document.querySelector('[data-nav]')
  return nav ? nav.offsetHeight : 68
}

export function ViajeNavProvider({ children }) {
  const [view, setView] = useState('dia-1')
  const sectionRef = useRef(null) // <section id="viaje">, lo registra el componente Viaje
  const tabsRef = useRef(null) // barra de pestañas (sticky), la registra ViajeTabs
  const panelsRef = useRef(null) // contenedor de paneles, lo registra Viaje

  const goToView = useCallback((id, opts = {}) => {
    setView(id)
    if (opts.scroll) {
      requestAnimationFrame(() => {
        /* Se ancla al inicio de los PANELES menos la altura de la barra de pestañas:
           así la barra de días queda arriba (pegada bajo la nav) y no se ve la
           cabecera del bloque. No se mide la propia barra con getBoundingClientRect
           porque es sticky y, ya pegada, devolvería la posición actual (scroll nulo). */
        const panels = panelsRef.current
        const tabsH = tabsRef.current ? tabsRef.current.offsetHeight : 0
        const el = panels || sectionRef.current
        if (!el) return
        const top =
          el.getBoundingClientRect().top + window.pageYOffset - navHeight() - (panels ? tabsH : 0)
        window.scrollTo({ top, behavior: 'smooth' })
      })
    }
  }, [])

  return (
    <ViajeNavContext.Provider value={{ view, setView, goToView, sectionRef, tabsRef, panelsRef }}>
      {children}
    </ViajeNavContext.Provider>
  )
}

export function useViajeNav() {
  const ctx = useContext(ViajeNavContext)
  if (!ctx) throw new Error('useViajeNav debe usarse dentro de <ViajeNavProvider>')
  return ctx
}
