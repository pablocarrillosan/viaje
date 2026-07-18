import { dias, TOTAL_DIAS } from '../../data/dias.js'
import { useTrip } from '../../context/TripContext.jsx'
import styles from './TripSummary.module.css'

function planName(dayNum, planLetter) {
  const d = dias.find((x) => x.day === Number(dayNum))
  const p = d?.plans.find((x) => x.plan === planLetter)
  return p ? p.name : ''
}
function summaryTitle(dayNum) {
  const d = dias.find((x) => x.day === Number(dayNum))
  return d ? d.summaryTitle : ''
}

export default function TripSummary() {
  const { sel, reset } = useTrip()
  const days = Object.keys(sel).sort((a, b) => a - b)

  return (
    <div className={styles.root}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Tu selección</span>
          <h2 className="section-title">Tu viaje</h2>
          <p className="section-lead">
            Pulsa «Elegir este plan» en cada día y aquí se irá construyendo tu itinerario personalizado. La
            selección se guarda en tu navegador.
          </p>
        </div>
        <div className={styles.trip}>
          {days.length === 0 ? (
            <div className={styles.empty}>
              Aún no has elegido ningún plan. Ve a cualquier día y pulsa «Elegir este plan».
            </div>
          ) : (
            <div className={styles.grid}>
              {days.map((d) => {
                const tt = summaryTitle(d)
                return (
                  <div className={styles.card} key={d}>
                    <div className={styles.day}>Día {d}{tt ? ` · ${tt}` : ''}</div>
                    <div className={styles.plan}>{planName(d, sel[d])}</div>
                    <div className={styles.badge}>Plan {sel[d]}</div>
                  </div>
                )
              })}
            </div>
          )}
          <div className={styles.foot}>
            <span className={styles.count}>
              {days.length > 0 ? `${days.length} de ${TOTAL_DIAS} días con plan elegido` : ''}
            </span>
            <button type="button" className={styles.reset} onClick={reset}>
              Reiniciar selección
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
