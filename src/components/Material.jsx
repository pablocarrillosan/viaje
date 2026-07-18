import Icon from './icons/Icon.jsx'
import RichText from './ui/RichText.jsx'
import { materialCards, materialNote } from '../data/material.js'
import styles from './Material.module.css'

export default function Material() {
  return (
    <section className="section section--alt contours" id="material">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Prepara la mochila</span>
          <h2 className="section-title">Material recomendado</h2>
          <p className="section-lead">
            Lo básico para las diez jornadas, por categorías, más los ajustes concretos de cada día.
          </p>
        </div>
        <div className={`${styles.grid} reveal`}>
          {materialCards.map((c) => (
            <article className={styles.card} key={c.title}>
              <h4>
                <Icon name={c.icon} /> {c.title}
              </h4>
              <ul className={styles.list}>
                {c.items.map((it) => (
                  <li key={it}>
                    <Icon name="check" /> <span>{it}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <RichText as="div" className={`${styles.note} reveal`} html={materialNote} />
      </div>
    </section>
  )
}
