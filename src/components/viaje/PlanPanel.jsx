import { useEffect, useRef, useState } from 'react'
import { Landscape, Profile } from '../SvgArt.jsx'
import Icon from '../icons/Icon.jsx'
import Datasheet from './Datasheet.jsx'
import { useTrip } from '../../context/TripContext.jsx'
import {
  getPunto,
  meteoKey,
  widgetUrl,
  paginaUrl,
  multimodelUrl,
  diasHasta,
  MAX_DIAS_WIDGET,
} from '../../data/geo/meteo.js'
import { fechaDia } from '../../data/noches.js'
import styles from './PlanPanel.module.css'

/* Alto del iframe de meteoblue. El widget «daily» es responsive en ancho pero no
   en alto: con 7 días + rainSPOT necesita esto para no cortar la última fila. */
const ALTO_WIDGET = 300

const FMT = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
const fechaLarga = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return FMT.format(new Date(a, m - 1, d))
}

/**
 * La jornada, contada desde la alternativa que estás mirando.
 *
 * No es un bloque que se añade al día: ES el día. La descripción, la foto, la
 * ficha y la previsión son las de este plan; lo que queda fuera de aquí (la
 * recomendación, los consejos, el material y los pueblos) es lo único que no
 * depende de qué alternativa elijas.
 *
 * ⚠ La ficha va FUSIONADA a propósito: arriba las cifras del plan (que cambian
 * con la pestaña) y debajo la logística del día (traslado, base, lanzadera,
 * cobertura), que es la misma elijas lo que elijas. Separarlas en dos tablas
 * obligaba a mirar en dos sitios para responder «¿a qué hora salgo?».
 */
export default function PlanPanel({ day, plan }) {
  const { sel, toggle } = useTrip()
  const elegido = sel[String(day.day)] === plan.plan

  const filas = [
    ...plan.stats.map((s) => ({ icon: s.icon, label: s.label, value: s.value, hi: true })),
    ...(day.datasheet || []),
  ]

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <div className={styles.contenido}>
          <p className={styles.tipo}>{plan.type}</p>
          <h4 className={styles.nombre}>{plan.name}</h4>
          <p className={styles.desc}>{plan.desc}</p>

          <div className={styles.pc}>
            <div>
              <div className="pc-h">A favor</div>
              <ul className={`${styles.pcList} ${styles.pro}`}>
                {plan.pros.map((p) => (
                  <li key={p}>
                    <Icon name="check" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="pc-h">En contra</div>
              <ul className={`${styles.pcList} ${styles.con}`}>
                {plan.cons.map((c) => (
                  <li key={c}>
                    <Icon name="cross" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.when}>
            <div className="mini-h">Cuándo elegirla</div>
            <p>{plan.when}</p>
          </div>

          <button
            className={`${styles.pick} ${elegido ? styles.picked : ''}`}
            type="button"
            aria-pressed={elegido}
            onClick={() => toggle(day.day, plan.plan)}
          >
            <Icon name={elegido ? 'check' : 'plus'} />
            <span>{elegido ? `Este es tu plan del día ${day.num}` : 'Elegir este plan'}</span>
          </button>
        </div>

        <div className={styles.lateral}>
          <figure className={styles.foto} key={plan.art}>
            <Landscape art={plan.art} />
            <span className={`${styles.fotoTag} pill`}>Plan {plan.plan}</span>
            <figcaption className={styles.fotoCap}>{plan.name}</figcaption>
          </figure>

          {plan.profile && (
            <div className={styles.perfil}>
              <Profile profile={plan.profile} />
              <div className={styles.perfilCap}>
                <span>Perfil de altimetría</span>
                <span>{plan.profileDplus}</span>
              </div>
            </div>
          )}

          <Datasheet rows={filas} />
        </div>
      </div>

      <Meteo
        punto={getPunto(day.day, plan.plan)}
        clave={meteoKey(day.day, plan.plan)}
        fecha={fechaDia(day.num)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * Previsión de meteoblue en el punto alto del plan, a lo ancho del día.
 *
 * ⚠ El widget solo llega a 7 días vista. No es un ajuste que se pueda subir: es
 * el horizonte del modelo. A más distancia no se disimula — se dice cuántos días
 * faltan y se enlaza el meteograma multimodelo, que a esa distancia es lo único
 * que informa (enseña cuánto se pelean los modelos entre sí, no un número que
 * todavía no se sostiene).
 */
function Meteo({ punto, clave, fecha }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  /* El iframe no se monta hasta que el bloque entra en pantalla. */
  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    if (typeof IntersectionObserver !== 'function') return setVisible(true)
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setVisible(true), {
      rootMargin: '200px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  if (!punto) {
    return (
      <section className={styles.meteo} ref={ref}>
        <p className={styles.aviso}>
          Esta alternativa aún no tiene punto de referencia meteorológico: añade la clave{' '}
          <code>{clave}</code> en <code>src/data/geo/meteo.js</code>.
        </p>
      </section>
    )
  }

  const faltan = diasHasta(fecha)
  const enAlcance = faltan >= 0 && faltan <= MAX_DIAS_WIDGET - 1

  return (
    <section className={styles.meteo} ref={ref}>
      <div className={styles.meteoHead}>
        <Icon name="sun" />
        <h5>Tiempo en {punto.name}</h5>
        <span className={styles.meteoAlt}>
          {punto.alt.toLocaleString('es-ES')} m · el punto más alto de la ruta, no el aparcamiento
        </span>
      </div>

      <p className={`${styles.alcance} ${enAlcance ? '' : styles.fuera}`}>
        <Icon name={enAlcance ? 'calendar' : 'clock'} />
        <span>
          {faltan < 0
            ? `El ${fechaLarga(fecha)} ya pasó.`
            : enAlcance
              ? `${faltan === 0 ? 'Es hoy' : faltan === 1 ? 'Mañana' : `Faltan ${faltan} días`} · el ${fechaLarga(fecha)} ya entra en la previsión.`
              : `Faltan ${faltan} días para el ${fechaLarga(fecha)} y meteoblue solo pronostica ${MAX_DIAS_WIDGET}: abajo ves el tiempo de esta semana en ese punto, no el del viaje.`}
        </span>
      </p>

      <div className={styles.marco} style={{ height: ALTO_WIDGET }}>
        {visible ? (
          <iframe
            className={styles.iframe}
            src={widgetUrl(punto)}
            title={`Previsión de meteoblue en ${punto.name}`}
            frameBorder="0"
            scrolling="no"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className={styles.cargando}>Cargando previsión…</div>
        )}
      </div>

      <div className={styles.pie}>
        <div className={styles.enlaces}>
          <a href={paginaUrl(punto)} target="_blank" rel="noopener noreferrer">
            <Icon name="arrow" /> 14 días
          </a>
          <a href={multimodelUrl(punto)} target="_blank" rel="noopener noreferrer">
            <Icon name="layers" /> Meteograma multimodelo
          </a>
        </div>
        <p className={styles.fuente}>
          Widget de{' '}
          <a href="https://www.meteoblue.com" target="_blank" rel="noopener noreferrer">
            meteoblue
          </a>
          . En agosto las tormentas de tarde son de manual: mira la hora, no solo el día.
        </p>
      </div>
    </section>
  )
}
