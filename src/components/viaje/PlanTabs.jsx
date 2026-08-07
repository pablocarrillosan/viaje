import { useEffect, useRef } from 'react'
import Icon from '../icons/Icon.jsx'
import styles from './PlanTabs.module.css'

export const VISTA_COMPARAR = 'comparar'

/**
 * Segunda fila de pestañas, dentro de la jornada: una por alternativa más
 * «Comparar». Sustituye al carrusel de tarjetas.
 *
 * ⚠ La pestaña NAVEGA, no elige. Cambiar de pestaña es curiosear; lo que se
 * guarda en `TripContext` (y alimenta el mapa y «Tu viaje») sigue siendo el
 * botón «Elegir este plan». Por eso el plan elegido lleva su propia marca (✓)
 * aunque estés mirando otra pestaña: si no, no habría forma de saber cuál
 * habías decidido.
 */
export default function PlanTabs({ plans, vista, onVista, elegido, recomendado }) {
  const innerRef = useRef(null)
  const refs = useRef({})

  /* Centrar la pestaña activa, igual que la barra de días. */
  useEffect(() => {
    const inner = innerRef.current
    const tab = refs.current[vista]
    if (inner && tab) inner.scrollLeft = tab.offsetLeft - inner.clientWidth / 2 + tab.clientWidth / 2
  }, [vista])

  return (
    <div className={styles.tabs}>
      <div className={styles.inner} role="tablist" aria-label="Alternativas de la jornada" ref={innerRef}>
        {plans.map((p) => {
          const activa = vista === p.plan
          const esElegido = elegido === p.plan
          return (
            <button
              key={p.plan}
              type="button"
              role="tab"
              aria-selected={activa}
              ref={(el) => (refs.current[p.plan] = el)}
              className={`${styles.tab} ${activa ? styles.active : ''} ${esElegido ? styles.picked : ''}`}
              onClick={() => onVista(p.plan)}
            >
              <span className={`${styles.letra} ${styles['b' + p.plan]}`}>
                {esElegido ? <Icon name="check" /> : p.plan}
              </span>
              <span className={styles.nombre}>
                {p.name}
                {!elegido && recomendado === p.plan && <em className={styles.reco}>recomendado</em>}
              </span>
            </button>
          )
        })}
        <button
          type="button"
          role="tab"
          aria-selected={vista === VISTA_COMPARAR}
          ref={(el) => (refs.current[VISTA_COMPARAR] = el)}
          className={`${styles.tab} ${styles.comparar} ${vista === VISTA_COMPARAR ? styles.active : ''}`}
          onClick={() => onVista(VISTA_COMPARAR)}
        >
          <span className={styles.letra}>
            <Icon name="layers" />
          </span>
          <span className={styles.nombre}>Comparar las {plans.length}</span>
        </button>
      </div>
    </div>
  )
}
