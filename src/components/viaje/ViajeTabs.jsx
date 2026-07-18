import { useEffect, useRef } from 'react'
import { dias } from '../../data/dias.js'
import { useViajeNav } from '../../context/ViajeNavContext.jsx'
import styles from './ViajeTabs.module.css'

const TABS = [
  ...dias.map((d) => ({ view: d.id, n: d.tabN, l: d.tabLabel })),
  { view: 'tu-viaje', n: 'RESUMEN', l: 'Tu viaje' },
]

export default function ViajeTabs() {
  const { view, goToView } = useViajeNav()
  const innerRef = useRef(null)
  const tabRefs = useRef({})

  // Centrar la pestaña activa en la barra al cambiar de vista.
  useEffect(() => {
    const inner = innerRef.current
    const tab = tabRefs.current[view]
    if (inner && tab) {
      inner.scrollLeft = tab.offsetLeft - inner.clientWidth / 2 + tab.clientWidth / 2
    }
  }, [view])

  return (
    <div className={styles.tabs}>
      <div className={styles.inner} role="tablist" aria-label="Días del viaje" ref={innerRef}>
        {TABS.map((t) => {
          const active = view === t.view
          return (
            <button
              key={t.view}
              type="button"
              role="tab"
              aria-selected={active}
              ref={(el) => (tabRefs.current[t.view] = el)}
              className={`${styles.tab} ${active ? styles.active : ''}`}
              onClick={() => goToView(t.view, { scroll: true })}
            >
              <span className={styles.n}>{t.n}</span>
              <span className={styles.l}>{t.l}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
