import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { refugios, ZONAS, FUENTES } from '../../data/geo/refugios.js'
import styles from './Refugios.module.css'

/* Leaflet solo se descarga cuando la sección se acerca al viewport (el mismo
   chunk que usa «Mapa de tu viaje»: si ya se cargó allí, aquí es gratis). */
const RefugiosCanvas = lazy(() => import('./RefugiosCanvas.jsx'))

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

const TIPO_LABEL = { guardado: 'Guardado', libre: 'Libre', cerrado: 'Cerrado' }

export default function Refugios() {
  const [zona, setZona] = useState('todas')
  const [verGuardados, setVerGuardados] = useState(true)
  const [verLibres, setVerLibres] = useState(true)
  const [soloEspana, setSoloEspana] = useState(false)
  const [soloAlcance, setSoloAlcance] = useState(false)
  const [selected, setSelected] = useState(null)
  const ref = useRef(null)
  const near = useNearViewport(ref)

  const visibles = useMemo(
    () =>
      refugios.filter((r) => {
        if (zona !== 'todas' && r.zona !== zona) return false
        if (soloEspana && r.pais !== 'ES') return false
        if (r.tipo === 'guardado' && !verGuardados) return false
        if (r.tipo !== 'guardado' && !verLibres) return false
        if (soloAlcance && r.planes.length === 0 && !r.dormible) return false
        return true
      }),
    [zona, verGuardados, verLibres, soloEspana, soloAlcance],
  )

  const nEnRuta = visibles.filter((r) => r.planes.length > 0).length
  const nDormible = visibles.filter((r) => r.dormible).length
  const nFuera = visibles.filter((r) => r.planes.length === 0 && !r.dormible).length

  const porZona = useMemo(
    () =>
      ZONAS.map((z) => ({
        ...z,
        items: visibles
          .filter((r) => r.zona === z.id)
          .sort((a, b) => (a.tipo === b.tipo ? b.alt - a.alt : a.tipo === 'guardado' ? -1 : 1)),
      })).filter((z) => z.items.length > 0),
    [visibles],
  )

  return (
    <section className="section contours" id="refugios" ref={ref}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Dónde dormir arriba</span>
          <h2 className="section-title">Refugios de los cuatro valles</h2>
          <p className="section-lead">
            Todos los refugios <strong>guardados</strong> (con guarda, cena y reserva) y{' '}
            <strong>libres</strong> (cabañas abiertas, gratis, sin reserva ni garantía de sitio) de las zonas por las
            que pasa el viaje, más la vertiente francesa colindante. Los que llevan{' '}
            <strong>anillo ámbar</strong> caen en el recorrido de alguna de las 52 alternativas de los diez días; la
            etiqueta dice de cuáles.
          </p>
        </div>

        {/* --- Controles ---------------------------------------------------- */}
        <div className={styles.controls}>
          <div className={styles.chips} role="tablist" aria-label="Zona a mostrar">
            <button
              type="button"
              role="tab"
              aria-selected={zona === 'todas'}
              className={`${styles.chip} ${zona === 'todas' ? styles.chipOn : ''}`}
              onClick={() => setZona('todas')}
            >
              Todos los valles
            </button>
            {ZONAS.map((z) => (
              <button
                key={z.id}
                type="button"
                role="tab"
                aria-selected={zona === z.id}
                className={`${styles.chip} ${zona === z.id ? styles.chipOn : ''}`}
                onClick={() => setZona(z.id)}
                title={z.sub}
              >
                {z.label}
              </button>
            ))}
          </div>

          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={verGuardados} onChange={(e) => setVerGuardados(e.target.checked)} />
              Guardados
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={verLibres} onChange={(e) => setVerLibres(e.target.checked)} />
              Libres
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={soloEspana} onChange={(e) => setSoloEspana(e.target.checked)} />
              Solo España
            </label>
            <label className={`${styles.toggle} ${styles.toggleKey}`}>
              <input type="checkbox" checked={soloAlcance} onChange={(e) => setSoloAlcance(e.target.checked)} />
              Solo los que pillan de camino
            </label>
          </div>
        </div>

        {/* --- Mapa + panel ------------------------------------------------- */}
        <div className={styles.layout}>
          <div className={styles.mapCol}>
            {near && visibles.length > 0 ? (
              <Suspense fallback={<div className={styles.skeleton}>Cargando el mapa…</div>}>
                <RefugiosCanvas visibles={visibles} zona={zona} selected={selected} onSelect={setSelected} />
              </Suspense>
            ) : (
              <div className={styles.skeleton}>
                {visibles.length === 0 ? 'Ningún refugio con estos filtros.' : 'Cargando el mapa…'}
              </div>
            )}
          </div>

          <aside className={styles.side}>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statN}>{nEnRuta}</span>
                <span className={styles.statL}>en alguna ruta</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statN}>{nDormible}</span>
                <span className={styles.statL}>sirven de cama</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statN}>{nFuera}</span>
                <span className={styles.statL}>fuera de alcance</span>
              </div>
            </div>

            <ul className={styles.list}>
              {visibles
                .slice()
                .sort((a, b) => (a.tipo === b.tipo ? b.alt - a.alt : a.tipo === 'guardado' ? -1 : 1))
                .map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`${styles.item} ${selected === r.id ? styles.itemOn : ''} ${styles[`t_${r.tipo}`]}`}
                      onClick={() => setSelected(r.id)}
                      aria-pressed={selected === r.id}
                    >
                      <span className={styles.dot} aria-hidden="true" />
                      <span className={styles.itemName}>
                        {r.nombre}
                        {r.planes.length > 0 && (
                          <span className={styles.bRuta} title={`En el recorrido de: ${r.planes.join(', ')}`}>
                            {r.planes.join(' ')}
                          </span>
                        )}
                        {r.dormible && (
                          <span className={styles.bCama} title="Podrías dormir aquí sin romper el itinerario">
                            cama
                          </span>
                        )}
                      </span>
                      <span className={styles.itemMeta}>
                        {r.alt} m
                        {r.plazas ? ` · ${r.plazas} plazas` : ''}
                        {r.pais === 'FR' ? ' · FR' : ''}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>

            <ul className={styles.legend}>
              <li>
                <span className={`${styles.swatch} ${styles.lgGuardado}`} /> Guardado: guarda, comidas y{' '}
                <strong>reserva obligatoria</strong> en agosto
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.lgLibre}`} /> Libre: abierto y gratis, sin guarda ni
                reserva. Llega temprano
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.lgCerrado}`} /> Catalogado pero cerrado o en ruina
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.lgRing}`} /> <strong>Anillo</strong>: cae en el recorrido
                de algún plan (la etiqueta dice cuáles: <code>3D</code> = día 3, plan D)
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.lgCama}`} /> <strong>cama</strong>: podrías dormir ahí sin
                romper el itinerario
              </li>
            </ul>
          </aside>
        </div>

        {/* --- Alternativa textual (el mapa no puede ser la única fuente) ---- */}
        <details className={styles.textAlt}>
          <summary>Ver los refugios como lista, valle por valle</summary>
          {porZona.map((z) => (
            <div key={z.id} className={styles.altZone}>
              <h3>
                {z.label} <span>· {z.sub}</span>
              </h3>
              <ul>
                {z.items.map((r) => (
                  <li key={r.id}>
                    <strong>{r.nombre}</strong> — {TIPO_LABEL[r.tipo]} · {r.alt} m
                    {r.plazas ? ` · ${r.plazas} plazas` : ''}
                    {r.pais === 'FR' ? ' · vertiente francesa' : ''}
                    {r.tel ? ` · tel. ${r.tel}` : ''}
                    {r.planes.length > 0 ? ` · en la ruta de ${r.planes.join(', ')}` : ' · fuera de ruta'}
                    {r.dormible ? ' · sirve para dormir' : ''}
                    {r.nota ? ` — ${r.nota}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </details>

        <p className={styles.disclaimer}>
          <strong>Un refugio libre no es una reserva.</strong> Son cabañas abiertas, gratuitas y sin guarda: en agosto
          pueden estar llenas, sucias o cerradas, y las plazas que se indican son estimaciones de quien las visitó, no
          un aforo oficial. Lleva siempre plan B (tienda o vivac legal) y agua potabilizada. Los guardados de agosto
          <strong> exigen reserva</strong>: mira la disponibilidad real en{' '}
          <a href="#plazas">Plazas en refugios</a>. Fuentes:{' '}
          {FUENTES.map((f, i) => (
            <span key={f.url}>
              {i > 0 && ' · '}
              <a href={f.url} target="_blank" rel="noreferrer">
                {f.label}
              </a>
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  )
}
