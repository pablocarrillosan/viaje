import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { dias } from '../../data/dias.js'
import { useTrip } from '../../context/TripContext.jsx'
import { useViajeNav } from '../../context/ViajeNavContext.jsx'
import Icon from '../icons/Icon.jsx'
import MapLegend from './MapLegend.jsx'
import { deriveLayers } from './deriveLayers.js'
import styles from './MapaViaje.module.css'

/* Leaflet solo se descarga cuando la sección se acerca al viewport. */
const MapCanvas = lazy(() => import('./MapCanvas.jsx'))

function useNearViewport(ref, margin = '400px') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return setNear(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return near
}

export default function MapaViaje() {
  const { sel } = useTrip()
  const { goToView } = useViajeNav()
  const [focus, setFocus] = useState('todo')
  const [suggested, setSuggested] = useState(true)
  const ref = useRef(null)
  const near = useNearViewport(ref)

  const layers = useMemo(() => deriveLayers(sel, focus, suggested), [sel, focus, suggested])
  const chosen = layers.routes.filter((r) => r.chosen)

  return (
    <section className="section section--alt contours" id="mapa-viaje" ref={ref}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Sobre el terreno</span>
          <h2 className="section-title">Mapa de tu viaje</h2>
          <p className="section-lead">
            Las rutas que has elegido y los trayectos en coche entre bases, sobre el relieve real. Elige un plan
            en cualquier día y aparecerá aquí; sin elegir, verás en fantasma el plan recomendado de cada jornada.
          </p>
        </div>

        {/* --- Controles ---------------------------------------------------- */}
        <div className={styles.controls}>
          <div className={styles.chips} role="tablist" aria-label="Día a enfocar en el mapa">
            <button
              type="button"
              role="tab"
              aria-selected={focus === 'todo'}
              className={`${styles.chip} ${focus === 'todo' ? styles.chipOn : ''}`}
              onClick={() => setFocus('todo')}
            >
              Todo el viaje
            </button>
            {dias.map((d) => (
              <button
                key={d.day}
                type="button"
                role="tab"
                aria-selected={focus === d.day}
                className={`${styles.chip} ${focus === d.day ? styles.chipOn : ''} ${
                  sel[String(d.day)] ? styles.chipPicked : ''
                }`}
                onClick={() => setFocus(d.day)}
                title={d.summaryTitle}
              >
                D{String(d.day).padStart(2, '0')}
              </button>
            ))}
          </div>

          <label className={styles.toggle}>
            <input type="checkbox" checked={suggested} onChange={(e) => setSuggested(e.target.checked)} />
            Mostrar rutas sugeridas
          </label>
        </div>

        {/* --- Mapa + panel ------------------------------------------------- */}
        <div className={styles.layout}>
          <div className={styles.mapCol}>
            {near ? (
              <Suspense fallback={<div className={styles.skeleton}>Cargando el mapa…</div>}>
                <MapCanvas layers={layers} focus={focus} onFocusDay={setFocus} />
              </Suspense>
            ) : (
              <div className={styles.skeleton}>Cargando el mapa…</div>
            )}
          </div>

          <aside className={styles.side}>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statN}>{layers.kmPie || '—'}</span>
                <span className={styles.statL}>km a pie elegidos</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statN}>{layers.kmCoche}</span>
                <span className={styles.statL}>km en coche</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statN}>
                  {layers.nChosen}/{dias.length}
                </span>
                <span className={styles.statL}>días con plan</span>
              </div>
            </div>

            {chosen.length === 0 ? (
              <div className={styles.empty}>
                <Icon name="landscape" />
                <p>
                  Aún no has elegido planes. Ve a cualquier día y pulsa «Elegir este plan»: la ruta aparecerá
                  dibujada aquí.
                </p>
                <button type="button" className={styles.goto} onClick={() => goToView('dia-1', { scroll: true })}>
                  Ir al día 1 →
                </button>
              </div>
            ) : (
              <ul className={styles.picked}>
                {chosen.map((r) => (
                  <li key={r.key}>
                    <button type="button" onClick={() => setFocus(r.day)} className={styles.pickedBtn}>
                      <span className={styles.pickedDay}>D{String(r.day).padStart(2, '0')}</span>
                      <span className={styles.pickedName}>{r.name}</span>
                      <span className={styles.pickedMeta}>
                        {[r.dist, r.desnivel, r.tiempo].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {layers.missing.length > 0 && (
              <p className={styles.missing}>
                Sin trazado todavía:{' '}
                {layers.missing.map((m) => `día ${m.day} · plan ${m.plan}`).join(', ')}. El resto del mapa
                funciona igual.
              </p>
            )}

            <MapLegend />
          </aside>
        </div>

        {/* --- Alternativa textual (el mapa no puede ser la única fuente) ---- */}
        <details className={styles.textAlt}>
          <summary>Ver el recorrido como lista de etapas</summary>
          <ol>
            {layers.drives.map((t) => (
              <li key={t.id}>
                <strong>Día {t.day} · {t.label}</strong> — {t.time} · {t.km} km · {t.via}
              </li>
            ))}
          </ol>
          {chosen.length > 0 && (
            <ol className={styles.textAltRoutes}>
              {chosen.map((r) => (
                <li key={r.key}>
                  <strong>Día {r.day} · {r.name}</strong> — {[r.dist, r.desnivel, r.tiempo].filter(Boolean).join(' · ')}
                </li>
              ))}
            </ol>
          )}
        </details>

        <p className={styles.disclaimer}>
          Trazados <strong>aproximados</strong>, dibujados sobre waypoints reales (aparcamientos, ibones, collados
          y cimas) para situar cada jornada en el valle. No sustituyen a un mapa topográfico ni a un GPS.
        </p>
      </div>
    </section>
  )
}
