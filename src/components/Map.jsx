import MapVis from '../assets/svg/map.svg?react'
import Icon from './icons/Icon.jsx'
import { rutaEtapas } from '../data/mapa.js'
import styles from './Map.module.css'

export default function Map() {
  return (
    <section className="section section--alt contours" id="mapa">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">El recorrido</span>
          <h2 className="section-title">Un bucle de 850 km por el Pirineo</h2>
          <p className="section-lead">
            De Teruel al Valle de Tena, cruzando Ordesa y los valles occidentales hasta Ansó, y vuelta a casa.
            Estos son los tiempos de coche aproximados entre etapas.
          </p>
        </div>
        <div className={`${styles.map} reveal`}>
          <div className={styles.vis}>
            <MapVis />
          </div>
          <div className={styles.list}>
            {rutaEtapas.map((e) => (
              <div className={styles.step} key={e.num}>
                <div className={styles.node}>
                  <span className={styles.num}>{e.num}</span>
                  <span className={styles.line} />
                </div>
                <div className={styles.body}>
                  <h4>{e.name}</h4>
                  <div className={styles.sub}>{e.sub}</div>
                  {e.drive && (
                    <span className={styles.drive}>
                      <Icon name="car" /> {e.drive}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
