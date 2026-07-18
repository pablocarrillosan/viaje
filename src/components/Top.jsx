import { topRutas } from '../data/top.js'
import styles from './Top.module.css'

export default function Top() {
  return (
    <section className="section section--dark contours" id="top-rutas">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow" style={{ color: '#7fd8cc' }}>Lo mejor del viaje</span>
          <h2 className="section-title" style={{ color: '#fff' }}>Top 6 de rutas</h2>
          <p className="section-lead" style={{ color: '#9dc7be' }}>
            Si tuviera que quedarme con seis momentos de estos diez días, serían estos. Ordenados por lo que me
            marcaron.
          </p>
        </div>
        <div className={`${styles.grid} reveal`}>
          {topRutas.map((r) => (
            <article className={styles.card} key={r.rank}>
              {r.tag && <span className={styles.tag}>{r.tag}</span>}
              <div className={styles.rank}>{r.rank}</div>
              <h4>{r.title}</h4>
              <div className={styles.meta}>{r.meta}</div>
              <p>{r.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
