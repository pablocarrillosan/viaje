import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

/* Encuadra el mapa en `points` ([[lat,lon], …]) cada vez que cambia la clave
   `dep` (día enfocado / selección). Se usa desde un componente hijo del
   <MapContainer>, que es donde useMap() tiene contexto. */
export function useMapBounds(points, dep) {
  const map = useMap()
  const last = useRef(null)

  useEffect(() => {
    if (!map || !points || points.length < 2) return
    if (last.current === dep) return
    last.current = dep
    map.fitBounds(points, { padding: [36, 36], maxZoom: 14, animate: true })
  }, [map, points, dep])
}

export default useMapBounds
