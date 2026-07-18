import Icon from '../icons/Icon.jsx'
import styles from './Nearby.module.css'

export default function Nearby({ nearby }) {
  return (
    <div className={`${styles.nearby} reveal`}>
      <div className={styles.head}>
        <div>
          <span className="eyebrow">{nearby.eyebrow}</span>
          <h4>{nearby.title}</h4>
        </div>
        <span className={styles.sub}>{nearby.sub}</span>
      </div>
      <div className={styles.grid}>
        {nearby.towns.map((t) => (
          <div className={styles.town} key={t.name}>
            <div className={styles.name}>{t.name}</div>
            <div className={styles.meta}>
              {t.meta.map((m, i) => (
                <span key={i}>
                  <Icon name={m.icon} />
                  {m.text}
                </span>
              ))}
            </div>
            <p className={styles.desc}>{t.desc}</p>
            <div className={styles.when}>
              <span className="pill pill--rock">{t.when}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
