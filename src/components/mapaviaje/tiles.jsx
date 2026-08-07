import { useEffect, useState } from 'react'
import { TileLayer, useMap, useMapEvents } from 'react-leaflet'

/* ============================================================================
   Capa base compartida por los dos mapas Leaflet del proyecto (#mapa-viaje y
   #refugios). Está aquí, en un solo sitio, porque las dos secciones tienen que
   comportarse igual: si se arregla un problema de teselas, se arregla en ambas.
   ==========================================================================*/

/* Tesela transparente de 1×1. Cuando el servidor devuelve un error (429 por uso
   excesivo, 404 fuera de cobertura…), el navegador pintaba la imagen de error
   del propio servidor. Con `errorTileUrl` se sustituye por esto y solo se ve
   el fondo de papel. */
const TESELA_VACIA =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/* ⚠ Por debajo de este zoom NO se usa OpenTopoMap.
   Motivo: su sombreado de relieve, visto de lejos, es un marrón rojizo que se
   come el mapa — justo lo que pasaba en los días de traslado (4, 7 y 8), que
   se alejan para que quepa el trayecto entero. Desde z12 ya se leen curvas de
   nivel y sendas, que es para lo que queremos el relieve. */
export const UMBRAL_RELIEVE = 12

export const TILES = {
  topo: {
    label: 'Relieve',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Mapa © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA) · Datos © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    /* OpenTopoMap solo RENDERIZA hasta z17. Con `maxNativeZoom` Leaflet
       reescala la tesela de z17 (borrosa pero legible) en vez de pedir
       teselas que no existen y acabar pintando la imagen de error. */
    maxNativeZoom: 17,
    maxZoom: 19,
  },
  claro: {
    label: 'Claro',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
    maxZoom: 19,
  },
}

/**
 * Estado de la capa base.
 *
 * `modo` es lo que elige la persona; `capa` es lo que se pinta:
 *   'auto'  → claro de lejos, relieve de cerca (y claro también si OpenTopoMap
 *             está fallando: sirve teselas malas con bastante alegría).
 *   'topo' / 'claro' → forzado a mano; el zoom ya no lo cambia.
 */
export function useTiles() {
  const [modo, setModo] = useState('auto')
  const [zoom, setZoom] = useState(null)
  const [errors, setErrors] = useState(0)

  /* Con el zoom aún sin medir se elige «claro» a propósito: los dos mapas
     arrancan encuadrando todo el Pirineo (z9-10), así que empezar en «topo»
     provocaba un parpadeo marrón en el primer render. */
  const capa =
    modo !== 'auto' ? modo : errors > 3 || zoom == null || zoom < UMBRAL_RELIEVE ? 'claro' : 'topo'

  return { modo, setModo, capa, setZoom, onTileError: () => setErrors((n) => n + 1) }
}

/* Va DENTRO del <MapContainer>: es donde useMap() tiene contexto. Le pasamos
   el `setZoom` de useTiles tal cual (una función de estado es estable, así que
   el efecto no se dispara en bucle). */
export function ZoomWatcher({ setZoom }) {
  const map = useMap()
  useEffect(() => {
    setZoom(map.getZoom())
  }, [map, setZoom])
  useMapEvents({
    zoomend(e) {
      setZoom(e.target.getZoom())
    },
  })
  return null
}

export function BaseTiles({ capa, onTileError }) {
  const t = TILES[capa]
  return (
    <TileLayer
      key={capa}
      url={t.url}
      attribution={t.attribution}
      maxZoom={t.maxZoom}
      maxNativeZoom={t.maxNativeZoom}
      errorTileUrl={TESELA_VACIA}
      eventHandlers={{ tileerror: onTileError }}
    />
  )
}

const MODOS = [
  { id: 'auto', label: 'Auto', title: 'Claro de lejos, relieve de cerca' },
  { id: 'topo', label: 'Relieve', title: 'OpenTopoMap siempre' },
  { id: 'claro', label: 'Claro', title: 'Fondo claro siempre' },
]

export function TileSwitch({ modo, setModo, capa, className, botonClassName, activoClassName }) {
  return (
    <div className={className} role="group" aria-label="Estilo del mapa">
      {MODOS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`${botonClassName} ${modo === m.id ? activoClassName : ''}`}
          aria-pressed={modo === m.id}
          title={m.id === 'auto' ? `${m.title} · ahora: ${TILES[capa].label.toLowerCase()}` : m.title}
          onClick={() => setModo(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
