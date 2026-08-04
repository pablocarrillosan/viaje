import Icon from '../icons/Icon.jsx'
import { useViajeNav } from '../../context/ViajeNavContext.jsx'
import styles from './Nav.module.css'

export default function Nav() {
  const { goToView } = useViajeNav()
  return (
    <header className={styles.nav} data-nav>
      <div className={styles.inner}>
        <a className={styles.brand} href="#hero">
          <span className={styles.brandDot} />
          PIRINEOS 2026
        </a>
        <nav className={styles.links} aria-label="Secciones">
          <a href="#mapa">Mapa</a>
          <a href="#itinerario">Itinerario</a>
          <a href="#viaje">Días</a>
          <a
            href="#viaje"
            onClick={(e) => {
              e.preventDefault()
              goToView('tu-viaje', { scroll: true })
            }}
          >
            Tu viaje
          </a>
          <a href="#mapa-viaje">Mapa del viaje</a>
          <a href="#plazas">Plazas</a>
          <a href="#top-rutas">Top rutas</a>
          <a href="#material">Material</a>
          <a className={`${styles.cta} btn btn--primary`} href="#viaje">
            Ver itinerario <Icon name="arrow" className="arw" />
          </a>
        </nav>
      </div>
    </header>
  )
}
