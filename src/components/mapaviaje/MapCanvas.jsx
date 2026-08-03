import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PIRINEO_BOUNDS } from '../../data/geo/bases.js'
import { boundsOf } from './deriveLayers.js'
import { useMapBounds } from '../../hooks/useMapBounds.js'
import MapLayers from './MapLayers.jsx'
import styles from './MapaViaje.module.css'

/* Se carga con React.lazy desde <MapaViaje>: Leaflet (≈150 kB) no entra en el
   bundle inicial ni se descarga hasta que la sección se acerca al viewport. */

const TILES = {
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Mapa © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA) · Datos © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 17,
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
}

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
  const [tiles, setTiles] = useState('topo')
  const [errors, setErrors] = useState(0)
  const [armed, setArmed] = useState(false)

  // Fallback a OSM si OpenTopoMap no responde (política de uso justo / caídas).
  useEffect(() => {
    if (errors > 6 && tiles === 'topo') setTiles('osm')
  }, [errors, tiles])

  const t = TILES[tiles]

  return (
    <div className={styles.canvas}>
      <MapContainer
        bounds={PIRINEO_BOUNDS}
        scrollWheelZoom={false}
        zoomControl
        className={styles.leaflet}
        aria-label="Mapa del viaje con las rutas elegidas y los trayectos en coche"
      >
        <TileLayer
          key={tiles}
          url={t.url}
          attribution={t.attribution}
          maxZoom={t.maxZoom}
          eventHandlers={{ tileerror: () => setErrors((n) => n + 1) }}
        />
        <GestureGuard onArmed={setArmed} />
        <Fitter layers={layers} focus={focus} />
        <MapLayers layers={layers} onFocusDay={onFocusDay} />
      </MapContainer>
      <p className={styles.hint} aria-hidden="true">
        {armed ? 'Zoom con la rueda activado · saca el ratón para desactivarlo' : 'Haz clic en el mapa para hacer zoom con la rueda · en móvil, arrastra con dos dedos'}
      </p>
    </div>
  )
}
