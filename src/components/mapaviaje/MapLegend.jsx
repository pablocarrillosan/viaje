import styles from './MapaViaje.module.css'

const ITEMS = [
  { cls: 'lgCar', label: 'Trayecto en coche' },
  { cls: 'lgCarDash', label: 'Excursión en coche (día 7)' },
  { cls: 'lgRoute', label: 'Ruta elegida' },
  { cls: 'lgGhost', label: 'Ruta sugerida (aún sin elegir)' },
  { cls: 'lgBase', label: 'Base donde duermes' },
  { cls: 'lgPoi', label: 'Cima, ibón o refugio' },
]

export default function MapLegend() {
  return (
    <ul className={styles.legend}>
      {ITEMS.map((i) => (
        <li key={i.label}>
          <span className={`${styles.swatch} ${styles[i.cls]}`} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  )
}
