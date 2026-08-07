import { useEffect, useState } from 'react'
import Icon from '../icons/Icon.jsx'
import RichText from '../ui/RichText.jsx'
import CompareTable from './CompareTable.jsx'
import Nearby from './Nearby.jsx'
import PlazasChip from './PlazasChip.jsx'
import PlanTabs, { VISTA_COMPARAR } from './PlanTabs.jsx'
import PlanPanel from './PlanPanel.jsx'
import { useTrip } from '../../context/TripContext.jsx'
import { recoPlan } from '../mapaviaje/deriveLayers.js'
import styles from './Day.module.css'

/**
 * Una jornada. La alternativa activa NO es un añadido al día: es el día.
 *
 * Estructura:
 *   cabecera (número, fecha, zona, título) — lo único que no cambia nunca
 *   barra de alternativas (Plan A…F + Comparar)
 *   panel de la alternativa activa → PlanPanel: descripción, foto, ficha
 *     fusionada, perfil y previsión, todo del plan
 *   «de la jornada» → lo que no depende de qué elijas: la recomendación, los
 *     consejos, el material y los pueblos de alrededor
 *
 * ⚠ Pestaña ≠ elección. La pestaña es estado local (curiosear entre planes); lo
 * que persiste en `TripContext` — y por tanto lo que pintan el mapa y «Tu
 * viaje» — sigue siendo el botón «Elegir este plan» de dentro del panel. Se
 * arranca en el plan elegido; si no hay ninguno, en el recomendado.
 */
export default function Day({ day }) {
  const { sel } = useTrip()
  const elegido = sel[String(day.day)] || null
  const recomendado = recoPlan(day.day)
  const inicial = elegido || recomendado || day.plans?.[0]?.plan || null
  const [vista, setVista] = useState(inicial)

  /* Al elegir un plan, la vista salta a él: decidir y mirar no pueden acabar en
     dos sitios distintos. (Cambiar de día ya remonta el panel entero.) */
  useEffect(() => {
    if (elegido) setVista(elegido)
  }, [elegido])

  const activo = day.plans?.find((p) => p.plan === vista) || null

  return (
    <section className={styles.day}>
      <div className="wrap">
        <div className={styles.head}>
          <div className={styles.num} aria-hidden="true">{day.num}</div>
          <div className={styles.titles}>
            <span className={styles.date}>{day.date}</span>
            <span className="eyebrow">{day.zone}</span>
            <h3>{day.title}</h3>
            <div className={styles.chips}>
              <PlazasChip num={day.num} />
              {elegido && (
                <span className={styles.elegidoChip}>
                  <Icon name="check" /> Plan {elegido} elegido
                </span>
              )}
            </div>
          </div>
        </div>

        {day.pending ? (
          <p className={styles.pending}>
            Contenido de este día en preparación. El esquema (planes, ficha, comparativa y pueblos) se porta
            desde la guía original replicando el día 1.
          </p>
        ) : (
          <>
            <PlanTabs
              plans={day.plans}
              vista={vista}
              onVista={setVista}
              elegido={elegido}
              recomendado={recomendado}
            />

            {vista === VISTA_COMPARAR ? (
              day.compare && <CompareTable compare={day.compare} />
            ) : activo ? (
              <PlanPanel day={day} plan={activo} key={activo.plan} />
            ) : null}

            <DeLaJornada day={day} />
          </>
        )}
      </div>
    </section>
  )
}

/**
 * Lo que sobrevive a la elección: la recomendación del día, las ventajas de la
 * jornada, los consejos, el material y los pueblos de alrededor. Va fuera de las
 * pestañas porque es igual de cierto elijas la alternativa que elijas.
 */
function DeLaJornada({ day }) {
  const hay = day.callout || day.proscons || day.decide || day.tips?.length || day.gear?.length || day.nearby
  if (!hay) return null

  return (
    <div className={styles.jornada}>
      <div className={styles.jornadaTtl}>
        <Icon name="compass" />
        <span>De la jornada, elijas lo que elijas</span>
      </div>

      {day.callout && (
        <div className={styles.callout}>
          <span className="eyebrow">{day.callout.eyebrow}</span>
          <RichText as="p" html={day.callout.body} />
        </div>
      )}

      {day.proscons && (
        <div className={styles.proscons}>
          <div className={styles.prosconsTtl}>{day.proscons.title}</div>
          <div className={styles.prosconsCols}>
            {day.proscons.cols.map((col) => (
              <div key={col.h}>
                <div className="pc-h">{col.h}</div>
                <ul className={`${styles.pc} ${col.kind === 'pro' ? styles.pro : styles.con}`}>
                  {col.items.map((it) => (
                    <li key={it}>
                      <Icon name={col.kind === 'pro' ? 'check' : 'cross'} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {day.decide && (
        <div className={styles.decide}>
          <div className={styles.decideTtl}>
            <Icon name="compass" /> {day.decide.title}
          </div>
          <ul className={styles.decideList}>
            {day.decide.items.map((it) => (
              <li key={it.b}>
                <b>{it.b}</b>
                <span>{it.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {day.tips?.length > 0 && (
        <>
          <div className="mini-h">Consejos</div>
          <div className="chips">
            {day.tips.map((t) => (
              <span className="chip" key={t}>{t}</span>
            ))}
          </div>
        </>
      )}

      {day.gear?.length > 0 && (
        <>
          <div className="mini-h">Material recomendado</div>
          <div className="chips">
            {day.gear.map((g) => (
              <span className="chip" key={g}>{g}</span>
            ))}
          </div>
        </>
      )}

      {day.nearby && <Nearby nearby={day.nearby} />}
    </div>
  )
}
