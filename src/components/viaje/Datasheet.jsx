import Icon from '../icons/Icon.jsx'
import Rating from '../ui/Rating.jsx'
import styles from './Datasheet.module.css'

export default function Datasheet({ rows }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className={styles.datasheet} role="table" aria-label="Datos del día">
      {rows.map((r, i) => (
        /* `hi` = fila que viene de la alternativa activa (distancia, desnivel…) y
           por tanto cambia al cambiar de plan. Se destaca para que no se
           confunda con la logística del día, que es la misma siempre. */
        <div className={`${styles.row} ${r.hi ? styles.hi : ''}`} key={i}>
          <span className={styles.k}>
            <Icon name={r.icon} />
            {r.label}
          </span>
          <span className={styles.v}>
            {r.rating != null ? <Rating value={r.rating} /> : r.value}
          </span>
        </div>
      ))}
    </div>
  )
}
