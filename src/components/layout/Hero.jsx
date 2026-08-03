import HeroScene from '../../assets/svg/hero.svg?react'
import Icon from '../icons/Icon.jsx'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.scene} aria-hidden="true">
        <HeroScene />
      </div>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} reveal-load d1`}>Guía de trekking · Pirineo Aragonés · Verano 2026</p>
        <h1 className="reveal-load d2">
          <span>PIRINEOS</span>
          <span className={styles.year}>2026</span>
        </h1>
        <p className={`${styles.sub} reveal-load d3`}>
          Diez días por Respomuso, Ordesa, Monte Perdido y los valles occidentales, con dos jornadas de descanso
          escénico. Cada día, varios planes para elegir según el tiempo, las fuerzas y la meteo.
        </p>
        <div className={`${styles.actions} reveal-load d4`}>
          <a className="btn btn--primary" href="#viaje">
            Empezar el viaje <Icon name="arrow" className="arw" />
          </a>
          <a className="btn btn--ghost" href="#mapa">Ver el mapa</a>
        </div>
        <div className={`${styles.meta} reveal-load d5`}>
          <div><b>10</b>días de viaje</div>
          <div><b>6</b>cimas e ibones</div>
          <div><b>≈ 920 km</b>de rutas y coche</div>
          <div><b>1</b>gran objetivo · Monte Perdido</div>
        </div>
      </div>
      <div className={styles.scroll} aria-hidden="true">Scroll<span /></div>
    </section>
  )
}
