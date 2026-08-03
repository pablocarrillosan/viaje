import { Polyline, CircleMarker, Tooltip, Popup } from 'react-leaflet'
import { useViajeNav } from '../../context/ViajeNavContext.jsx'
import styles from './MapaViaje.module.css'

/* Estilo de línea por tipo de recorrido. Los colores salen de los tokens del
   proyecto (turquesa de ibón para caminar, ámbar de alpenglow para el coche). */
const IBON = '#0F766E'
const ALPEN = '#D98A2B'
const PINO = '#12332A'

const dashFor = (kind) => (kind === 'ida' ? '11 7' : kind === 'paseo' ? '1 7' : null)

export default function MapLayers({ layers, onFocusDay }) {
  const { goToView } = useViajeNav()

  return (
    <>
      {/* --- Trayectos en coche ------------------------------------------- */}
      {layers.drives.map((t) => (
        <Polyline
          key={t.id}
          positions={t.path}
          pathOptions={{
            color: ALPEN,
            weight: t.focused ? 4 : 3,
            opacity: t.focused ? 0.95 : 0.28,
            dashArray: t.kind === 'excursion' ? '8 8' : null,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        >
          <Tooltip sticky>
            <strong>{t.label}</strong>
            <br />
            {t.time} · {t.km} km · {t.via}
          </Tooltip>
        </Polyline>
      ))}

      {/* --- Rutas de montaña --------------------------------------------- */}
      {layers.routes.map((r) => (
        <Polyline
          key={r.key}
          positions={r.path}
          pathOptions={{
            color: r.chosen ? IBON : PINO,
            weight: r.focused ? (r.chosen ? 5 : 3) : 2.5,
            opacity: r.focused ? (r.chosen ? 1 : 0.42) : 0.2,
            dashArray: r.chosen ? dashFor(r.kind) : '4 6',
            lineCap: 'round',
            lineJoin: 'round',
          }}
        >
          <Popup>
            <div className={styles.popup}>
              <span className={styles.popupDay}>
                Día {r.day} · Plan {r.plan}
                {!r.chosen && ' · sugerido'}
              </span>
              <strong className={styles.popupName}>{r.name}</strong>
              {r.type && <span className={styles.popupType}>{r.type}</span>}
              <dl className={styles.popupStats}>
                {r.dist && (
                  <div>
                    <dt>Distancia</dt>
                    <dd>{r.dist}</dd>
                  </div>
                )}
                {r.desnivel && (
                  <div>
                    <dt>Desnivel</dt>
                    <dd>{r.desnivel}</dd>
                  </div>
                )}
                {r.tiempo && (
                  <div>
                    <dt>Tiempo</dt>
                    <dd>{r.tiempo}</dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                className={styles.popupLink}
                onClick={() => goToView(r.dayId, { scroll: true })}
              >
                Ver el día {r.day} →
              </button>
            </div>
          </Popup>
        </Polyline>
      ))}

      {/* --- Hitos de cada ruta (cimas, ibones, refugios) ------------------ */}
      {layers.routes
        .filter((r) => r.chosen && r.focused)
        .flatMap((r) =>
          r.pois.map((p, i) => (
            <CircleMarker
              key={`${r.key}-poi-${i}`}
              center={p.at}
              radius={4}
              pathOptions={{ color: '#fff', weight: 2, fillColor: IBON, fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {p.label}
              </Tooltip>
            </CircleMarker>
          )),
        )}

      {/* --- Bases y paradas ---------------------------------------------- */}
      {layers.stops.map((s) => {
        const base = s.kind === 'base'
        return (
          <CircleMarker
            key={s.id}
            center={s.coords}
            radius={base ? 8 : 4.5}
            pathOptions={{
              color: '#fff',
              weight: base ? 2.5 : 1.5,
              fillColor: base ? PINO : ALPEN,
              fillOpacity: s.focused ? 1 : 0.35,
            }}
            eventHandlers={base && onFocusDay ? { click: () => onFocusDay(s.days[0]) } : undefined}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{s.name}</strong>
              {s.sub && (
                <>
                  <br />
                  {s.sub}
                </>
              )}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </>
  )
}
