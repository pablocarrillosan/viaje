import { useEffect, useMemo, useState } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PIRINEO_BOUNDS } from '../../data/geo/bases.js'
import { boundsOf } from './deriveLayers.js'
import { useMapBounds } from '../../hooks/useMapBounds.js'
import { BaseTiles, TileSwitch, ZoomWatcher, useTiles } from './tiles.jsx'
import MapLayers from './MapLayers.jsx'
import styles from './MapaViaje.module.css'

/* Se carga con React.lazy desde <MapaViaje>: Leaflet (≈150 kB) no entra en el
   bundle inicial ni se descarga hasta que la sección se acerca al viewport. */

/* El scroll de la página manda: la rueda solo hace zoom tras hacer clic en el
   mapa, y en móvil se arrastra con dos dedos. */
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

function Fitter({ layers, focus }) {
  const points = useMemo(() => boundsOf(layers, focus), [layers, focus])
  useMapBounds(points, `${focus}·${layers.routes.map((r) => r.key).join(',')}`)
  return null
}

export default function MapCanvas({ layers, focus, onFocusDay }) {
  const { modo, setModo, capa, setZoom, onTileError } = useTiles()
  const [armed, setArmed] = useState(false)

  return (
    <div className={styles.canvas}>
      <MapContainer
        bounds={PIRINEO_BOUNDS}
        scrollWheelZoom={false}
        zoomControl
        className={styles.leaflet}
        aria-label="Mapa del viaje con las rutas elegidas y los trayectos en coche"
      >
        <BaseTiles capa={capa} onTileError={onTileError} />
        <ZoomWatcher setZoom={setZoom} />
        <GestureGuard onArmed={setArmed} />
        <Fitter layers={layers} focus={focus} />
        <MapLayers layers={layers} onFocusDay={onFocusDay} />
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
