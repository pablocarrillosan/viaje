import { dias } from '../data/dias.js'
import { useViajeNav } from '../context/ViajeNavContext.jsx'
import styles from './Timeline.module.css'

/* Notas cortas de cada día para la línea temporal (texto del itinerario). */
const NOTES = {
  1: 'Salida de Teruel y llegada a Sallent',
  2: 'Ibones de Anayet',
  3: 'Pico Anayet',
  4: 'Descanso: Lanuza y Panticosa',
  5: 'Cola de Caballo y Circo de Soaso',
  6: 'Monte Perdido (el día grande)',
  7: 'Descanso: Aínsa y Bujaruelo',
  8: 'Selva de Oza y Aguas Tuertas',
  9: 'Linza y la Mesa de los Tres Reyes',
  10: 'Vuelta a Teruel con paradas',
}
const PLACES = {
  1: 'Valle de Tena', 2: 'Anayet', 3: 'Anayet', 4: 'Valle de Tena', 5: 'Ordesa',
  6: 'Monte Perdido', 7: 'Sobrarbe', 8: 'Valle de Hecho', 9: 'Valle de Ansó', 10: 'Regreso',
}

export default function Timeline() {
  const { goToView } = useViajeNav()
  return (
    <section className="section" id="itinerario">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">De un vistazo</span>
          <h2 className="section-title">El viaje, día a día</h2>
          <p className="section-lead">
            Diez jornadas que alternan cimas y descanso: suben de intensidad hacia Monte Perdido y meten dos
            días escénicos para respirar. Toca una para ir a ese día.
          </p>
        </div>
        <div className={`${styles.timeline} reveal`}>
          {dias.map((d) => (
            <div
              className={styles.item}
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => goToView(d.id, { scroll: true })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goToView(d.id, { scroll: true })
                }
              }}
            >
              <div className={styles.day}>Día {d.num}</div>
              <div className={styles.place}>{PLACES[d.day]}</div>
              <div className={styles.note}>{NOTES[d.day]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
