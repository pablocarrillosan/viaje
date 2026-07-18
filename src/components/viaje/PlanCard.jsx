import { Landscape, Profile } from '../SvgArt.jsx'
import Icon from '../icons/Icon.jsx'
import { useTrip } from '../../context/TripContext.jsx'
import styles from './PlanCard.module.css'

export default function PlanCard({ plan, day }) {
  const { sel, toggle } = useTrip()
  const picked = sel[String(day)] === plan.plan

  return (
    <article className={`${styles.plan} ${picked ? styles.picked : ''}`}>
      <div className={styles.img}>
        <Landscape art={plan.art} />
        <span className={`${styles.badge} ${styles['badge' + plan.plan]}`}>PLAN {plan.plan}</span>
        <span className={styles.rate}>
          <Icon name="star" />
          <span>{plan.rate}</span>
        </span>
      </div>
      <div className={styles.body}>
        <div>
          <div className={styles.type}>{plan.type}</div>
          <h5 className={styles.name}>{plan.name}</h5>
        </div>
        <p className={styles.desc}>{plan.desc}</p>

        <div className={styles.profile}>
          <Profile profile={plan.profile} />
          <div className={styles.profileCap}>
            <span>Perfil de altimetría</span>
            <span>{plan.profileDplus}</span>
          </div>
        </div>

        <div className={styles.stats}>
          {plan.stats.map((s) => (
            <div className={styles.stat} key={s.label}>
              <Icon name={s.icon} />
              <div>
                <b>{s.value}</b>
                <br />
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

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
          {plan.when}
        </div>

        <button className={styles.pick} type="button" aria-pressed={picked} onClick={() => toggle(day, plan.plan)}>
          <span className={styles.pickPlus} aria-hidden="true"><Icon name="plus" /></span>
          <span className={styles.pickCheck} aria-hidden="true"><Icon name="check" /></span>
          <span className={styles.pickLabel}>Elegir este plan</span>
          <span className={styles.pickLabelOn}>Plan elegido</span>
        </button>
      </div>
    </article>
  )
}
