import FooterPeaks from '../../assets/svg/footer-silhouette.svg?react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <h3>Nos vemos en la cima</h3>
        <p>
          Guía personal del viaje al Pirineo Aragonés · verano 2026. Los tiempos, desniveles y distancias son
          aproximados: consulta siempre el parte de montaña antes de salir.
        </p>
        <div className={styles.peaks}>
          <FooterPeaks />
        </div>
        <div className={styles.meta}>
          PIRINEOS 2026 · Teruel → Respomuso → Ordesa → Oza → Linza → Teruel · Emergencias 112
        </div>
      </div>
    </footer>
  )
}
