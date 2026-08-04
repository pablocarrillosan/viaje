import { useRef } from 'react'
import Icon from './icons/Icon.jsx'
import { usePlazas, useRefrescoVisible, clasificar } from '../context/PlazasContext.jsx'
import { NOCHES_EN_REFUGIO, ORDEN_REFUGIOS, PLAZAS_NECESARIAS } from '../data/noches.js'
import styles from './Plazas.module.css'

const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

/** Todas las fechas de la ventana, en orden. */
function fechasDe({ desde, hasta }) {
  const out = []
  const d = new Date(`${desde}T12:00:00`)
  const fin = new Date(`${hasta}T12:00:00`)
  while (d <= fin) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/** ¿Qué noches del viaje se duermen en este refugio? */
function nochesDe(clave) {
  return Object.values(NOCHES_EN_REFUGIO)
    .filter((n) => n.refugio === clave)
    .map((n) => n.fecha)
}

function Celda({ fecha, libres, esNuestra }) {
  const clase = clasificar(libres)
  const dia = new Date(`${fecha}T12:00:00`)
  const etiqueta =
    libres === null
      ? 'sin datos de reserva online'
      : libres === 0
        ? 'completo online'
        : `${libres} ${libres === 1 ? 'plaza libre' : 'plazas libres'}`

  return (
    <div
      className={`${styles.celda} ${styles[clase]} ${esNuestra ? styles.nuestra : ''}`}
      title={`${fecha} · ${etiqueta}`}
    >
      <span className={styles.celdaDia}>{DIAS_SEMANA[dia.getDay()]}</span>
      <span className={styles.celdaNum}>{dia.getDate()}</span>
      <span className={styles.celdaPlazas}>{libres === null ? '—' : libres}</span>
      {esNuestra && <span className={styles.marca} aria-hidden="true" />}
    </div>
  )
}

export default function Plazas() {
  const seccion = useRef(null)
  const { datos, estado, huecos } = usePlazas()
  useRefrescoVisible(seccion)

  const fechas = fechasDe(datos.ventana)
  const generado = datos.generado
    ? new Date(datos.generado).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null

  const rotuloEstado = {
    cargando: 'consultando la API…',
    envivo: 'datos en vivo',
    bloqueado: 'la API no deja consultar desde el navegador · instantánea guardada',
    instantanea: 'instantánea guardada',
  }[estado]

  return (
    <section className="section" id="plazas" ref={seccion}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Reservas</span>
          <h2 className="section-title">Plazas en refugios</h2>
          <p className="section-lead">
            Huecos libres del 21 al 30 de agosto en los tres refugios donde se duerme. El dato sale de la
            misma API que alimenta el calendario oficial de alberguesyrefugios.com.
          </p>
        </div>

        <div className={`${styles.meta} reveal`}>
          <span className={styles.sello}>
            <Icon name="clock" /> {generado ? `Actualizado ${generado}` : 'Sin instantánea'} · {rotuloEstado}
          </span>
          <span className={styles.leyenda}>
            <i className={`${styles.punto} ${styles.libre}`} /> {PLAZAS_NECESARIAS} o más
            <i className={`${styles.punto} ${styles.pocas}`} /> quedan pocas
            <i className={`${styles.punto} ${styles.cero}`} /> completo online
            <i className={`${styles.punto} ${styles.sindato}`} /> sin datos
          </span>
        </div>

        <div className={`${styles.refugios} reveal`}>
          {ORDEN_REFUGIOS.map((clave) => {
            const ref = datos.refugios?.[clave]
            const nuestras = nochesDe(clave)

            return (
              <article className={styles.tarjeta} key={clave}>
                <header className={styles.cabecera}>
                  <h3>{ref?.nombre || clave}</h3>
                  <div className={styles.contacto}>
                    {ref?.telefono && <span className={styles.tel}>{ref.telefono}</span>}
                    <a
                      className={styles.enlace}
                      href={ref?.web || `https://www.alberguesyrefugios.com/${clave}/reservar`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Reservar <Icon name="arrow" className="arw" />
                    </a>
                  </div>
                </header>

                {ref?.alojamientos?.length ? (
                  ref.alojamientos.map((a) => (
                    <div className={styles.bloque} key={a.id}>
                      <div className={styles.tipo}>{a.nombre}</div>
                      <div className={styles.tira}>
                        {fechas.map((f) => (
                          <Celda
                            key={f}
                            fecha={f}
                            libres={typeof a.dias?.[f] === 'number' ? a.dias[f] : null}
                            esNuestra={nuestras.includes(f)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.vacio}>
                    Todavía no hay instantánea de este refugio. Lánzala con{' '}
                    <code>npm run fetch:plazas</code>, o consulta directamente en su web.
                  </p>
                )}

                {nuestras.length > 0 && ref?.alojamientos?.length > 0 && (
                  <p className={styles.resumen}>
                    {nuestras.map((f) => {
                      const libres = huecos(clave, f)
                      const d = new Date(`${f}T12:00:00`)
                      return (
                        <span key={f} className={styles[clasificar(libres)]}>
                          Noche del {d.getDate()}:{' '}
                          <b>{libres === null ? 'sin dato' : libres === 0 ? 'completo online' : `${libres} libres`}</b>
                        </span>
                      )
                    })}
                  </p>
                )}
              </article>
            )
          })}
        </div>

        <p className={`${styles.aviso} reveal`}>
          <Icon name="signal" /> <b>«Completo» significa completo online.</b> El motor de reservas por internet
          maneja un cupo limitado de cada refugio, así que un día a cero puede tener sitio por teléfono. Antes
          de descartar una fecha, llama. Y al revés: estos números se mueven solos cuando alguien abandona una
          reserva a medias.
        </p>
      </div>
    </section>
  )
}
