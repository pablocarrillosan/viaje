import Icon from '../icons/Icon.jsx'
import { usePlazas, clasificar } from '../../context/PlazasContext.jsx'
import { NOCHES_EN_REFUGIO, PLAZAS_NECESARIAS } from '../../data/noches.js'
import styles from './PlazasChip.module.css'

/**
 * Indicador compacto de disponibilidad para los días que se duermen en refugio
 * (2 Respomuso, 5 Góriz, 8 y 9 Linza). En los demás días no pinta nada.
 *
 * Lee del mismo contexto que la sección «Plazas en refugios», así que si el
 * refresco en vivo funciona, el chip también se actualiza.
 */
export default function PlazasChip({ num }) {
  const { huecos } = usePlazas()
  // Los días vienen con `num` como cadena con cero delante ('05'), no como número
  const noche = NOCHES_EN_REFUGIO[Number(num)]
  if (!noche) return null

  const libres = huecos(noche.refugio, noche.fecha)
  const clase = clasificar(libres)

  const texto =
    libres === null
      ? 'sin datos de reserva'
      : libres === 0
        ? 'completo online'
        : `${libres} ${libres === 1 ? 'plaza' : 'plazas'}`

  return (
    <a
      className={`${styles.chip} ${styles[clase]}`}
      href="#plazas"
      title={`${noche.nota} · noche del ${noche.fecha}${
        libres !== null && libres > 0 && libres < PLAZAS_NECESARIAS
          ? ` · quedan menos de ${PLAZAS_NECESARIAS}`
          : ''
      }`}
    >
      <Icon name="bed" />
      <span className={styles.texto}>{texto}</span>
    </a>
  )
}
