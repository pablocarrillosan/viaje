import Icon from '../icons/Icon.jsx'
import PlanCard from './PlanCard.jsx'
import styles from './PlanCarousel.module.css'

const COUNT_WORD = { 1: 'Un', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis', 7: 'Siete' }

export default function PlanCarousel({ day }) {
  const n = day.plans.length
  const word = COUNT_WORD[n] || n
  return (
    <>
      <div className={styles.head}>
        <h4>{`${word} planes para el día ${day.num}`}</h4>
        <span className={styles.hint}>
          <Icon name="dblArrow" /> Desliza en horizontal
        </span>
      </div>
      <div className={styles.carousel} tabIndex={0} aria-label={`Planes del día ${day.num}`}>
        {day.plans.map((p) => (
          <PlanCard key={p.plan} plan={p} day={day.day} />
        ))}
      </div>
    </>
  )
}
