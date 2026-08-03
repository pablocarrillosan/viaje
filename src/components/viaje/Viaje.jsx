import { dias } from '../../data/dias.js'
import { useViajeNav } from '../../context/ViajeNavContext.jsx'
import ViajeTabs from './ViajeTabs.jsx'
import Day from './Day.jsx'
import TripSummary from './TripSummary.jsx'
import styles from './Viaje.module.css'

/* Bloque oscuro con pestañas. Solo se renderiza el panel activo (a altura
   natural); la página scrollea con normalidad. El tema oscuro se logra
   redefiniendo los tokens en .viaje (Viaje.module.css): al heredarse por
   cascada, todos los hijos (Day, PlanCard, CompareTable…) pasan a oscuro. */
export default function Viaje() {
  const { view, sectionRef, panelsRef } = useViajeNav()
  const activeDay = dias.find((d) => d.id === view)

  return (
    <section id="viaje" className={styles.viaje} ref={sectionRef}>
      <div className={`${styles.head} wrap`}>
        <span className="eyebrow">El viaje</span>
        <h2 className="section-title">El viaje, día a día</h2>
        <p className="section-lead">
          Diez jornadas que alternan cimas y descanso. Cambia de día con las pestañas; cada jornada trae varios
          planes para elegir.
        </p>
      </div>

      <ViajeTabs />

      <div className={styles.panels} ref={panelsRef}>
        <div className={styles.panel} key={view}>
          {view === 'tu-viaje' ? <TripSummary /> : activeDay ? <Day day={activeDay} /> : null}
        </div>
      </div>
    </section>
  )
}
