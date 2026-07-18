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

  const goToView = useCallback((id, opts = {}) => {
    setView(id)
    if (opts.scroll) {
      requestAnimationFrame(() => {
        const el = sectionRef.current
        if (!el) return
        const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight()
        window.scrollTo({ top, behavior: 'smooth' })
      })
    }
  }, [])

  return (
    <ViajeNavContext.Provider value={{ view, setView, goToView, sectionRef }}>
      {children}
    </ViajeNavContext.Provider>
  )
}

export function useViajeNav() {
  const ctx = useContext(ViajeNavContext)
  if (!ctx) throw new Error('useViajeNav debe usarse dentro de <ViajeNavProvider>')
  return ctx
}
