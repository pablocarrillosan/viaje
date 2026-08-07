import { useEffect, useMemo, useState } from 'react'

import { MapContainer, CircleMarker, Tooltip, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { REFUGIOS_BOUNDS } from '../../data/geo/refugios.js'
import { useMapBounds } from '../../hooks/useMapBounds.js'
import { BaseTiles, TileSwitch, ZoomWatcher, useTiles } from '../mapaviaje/tiles.jsx'
import styles from './Refugios.module.css'

/* Se carga con React.lazy desde <Refugios>: Leaflet ya va en su propio chunk
   (compartido con la sección «Mapa de tu viaje»), así que esta sección no
   añade peso al bundle inicial. */

export const COLORES = {
  guardado: '#0F766E',
  libre: '#12332A',
  cerrado: '#9AA5A0',
}

/* Ámbar de alpenglow: el mismo que marca los trayectos en «Mapa de tu viaje». */
const ALPEN = '#D98A2B'

/* Mismo criterio que en «Mapa de tu viaje»: el scroll de la página manda. */
function GestureGuard({ onArmed }) {
  const map = useMap()

  useMapEvents({
    click() {
      map.scrollWheelZoom.enable()
      onArmed(true)
    },
    mouseout() {
      map.scrollWheelZoom.disable()
      onArmed(false)
    },
  })

  useEffect(() => {
    if (!L.Browser.mobile) return
    const el = map.getContainer()
    map.dragging.disable()
    const onTouchStart = (e) => (e.touches.length >= 2 ? map.dragging.enable() : map.dragging.disable())
    const onTouchEnd = () => map.dragging.disable()
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [map])

  return null
}

function Fitter({ visibles, dep }) {
  const points = useMemo(() => visibles.map((r) => r.coords), [visibles])
  useMapBounds(points, dep)
  return null
}

export default function RefugiosCanvas({ visibles, zona, selected, onSelect }) {
  const { modo, setModo, capa, setZoom, onTileError } = useTiles()
  const [armed, setArmed] = useState(false)

  return (
    <div className={styles.canvas}>
      <MapContainer
        bounds={REFUGIOS_BOUNDS}
        scrollWheelZoom={false}
        zoomControl
        className={styles.leaflet}
        aria-label="Mapa de los refugios guardados y libres de los valles del viaje"
      >
        <BaseTiles capa={capa} onTileError={onTileError} />
        <ZoomWatcher setZoom={setZoom} />
        <GestureGuard onArmed={setArmed} />
        <Fitter visibles={visibles} dep={`${zona}·${visibles.length}`} />

        {/* Anillo ámbar detrás del marcador: «cae en el recorrido de algún plan».
            Va en una capa aparte y no captura clics, para no robarle el popup
            al marcador de debajo. */}
        {visibles
          .filter((r) => r.planes.length > 0)
          .map((r) => (
            <CircleMarker
              key={`${r.id}-ruta`}
              center={r.coords}
              radius={r.tipo === 'guardado' ? 13 : 10}
              interactive={false}
              pathOptions={{ color: ALPEN, weight: 2, opacity: 0.9, fill: false, dashArray: '3 3' }}
            />
          ))}

        {visibles.map((r) => {
          const on = selected === r.id
          const guardado = r.tipo === 'guardado'
          return (
            <CircleMarker
              key={r.id}
              center={r.coords}
              radius={guardado ? (on ? 11 : 8) : on ? 8 : 5.5}
              pathOptions={{
                color: '#fff',
                weight: guardado ? 2.5 : 1.5,
                fillColor: COLORES[r.tipo],
                fillOpacity: r.tipo === 'cerrado' ? 0.45 : guardado ? 1 : 0.75,
              }}
              eventHandlers={{ click: () => onSelect(r.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{r.nombre}</strong>
                <br />
                {r.alt} m · {r.tipo === 'guardado' ? 'guardado' : r.tipo === 'libre' ? 'libre' : 'cerrado'}
              </Tooltip>
              <Popup>
                <div className={styles.popup}>
                  <span className={styles.popupKind}>
                    {r.tipo === 'guardado'
                      ? 'Guardado · con reserva'
                      : r.tipo === 'libre'
                        ? 'Libre · sin reserva'
                        : 'Fuera de servicio'}
                    {r.pais === 'FR' && ' · Francia'}
                  </span>
                  <strong className={styles.popupName}>{r.nombre}</strong>
                  <dl className={styles.popupStats}>
                    <div>
                      <dt>Altitud</dt>
                      <dd>{r.alt} m</dd>
                    </div>
                    {r.plazas != null && (
                      <div>
                        <dt>Plazas</dt>
                        <dd>{r.plazas || '—'}</dd>
                      </div>
                    )}
                    {r.tel && (
                      <div>
                        <dt>Teléfono</dt>
                        <dd>{r.tel}</dd>
                      </div>
                    )}
                  </dl>
                  <p className={styles.popupAcceso}>
                    {r.planes.length > 0
                      ? `Cae en el recorrido de: ${r.planes.join(', ')}`
                      : 'No cae en ninguna de las 52 alternativas'}
                    {r.dormible && ' · sirve para dormir'}
                  </p>
                  {r.nota && <p className={styles.popupNote}>{r.nota}</p>}
                  {r.web && (
                    <a className={styles.popupLink} href={r.web} target="_blank" rel="noreferrer">
                      Más información →
                    </a>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className={styles.bar}>
        <p className={styles.hint} aria-hidden="true">
          {armed
            ? 'Zoom con la rueda activado · saca el ratón para desactivarlo'
            : 'Haz clic en el mapa para hacer zoom con la rueda · en móvil, arrastra con dos dedos'}
        </p>
        <TileSwitch
          modo={modo}
          setModo={setModo}
          capa={capa}
          className={styles.tileSwitch}
          botonClassName={styles.tileBtn}
          activoClassName={styles.tileBtnOn}
        />
      </div>
    </div>
  )
}
