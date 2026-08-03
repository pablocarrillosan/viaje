/* ============================================================================
   GEO · Bases y puntos fijos del viaje.
   Coordenadas en [lat, lon] (orden de Leaflet), grados decimales, WGS84.
   ----------------------------------------------------------------------------
   `kind`:
     'base'   → base de operaciones de una jornada (marcador grande). Casi
                siempre se duerme allí; Selva de Oza es la excepción (día 8 se
                pasa por ella y se sigue hasta Linza), pero necesita `days`
                para que el mapa la enfoque al filtrar por día — los `hitos`
                llevan `days: []` y solo salen en la vista «todo el viaje».
     'hito'   → parada de referencia en carretera (pueblo, puerto, monasterio)
   `days`     → jornadas en las que ese punto es la base de operaciones.
   Precisión: los pueblos y aparcamientos están verificados a ~3–4 decimales
   (≈ 10–100 m). No usar estas coordenadas para navegación.
   ========================================================================== */

export const bases = [
  {
    id: 'teruel',
    name: 'Teruel',
    sub: 'Punto de partida y de regreso',
    coords: [40.344, -1.1069],
    kind: 'base',
    days: [1, 10],
  },
  {
    id: 'sallent',
    name: 'Sallent de Gállego',
    sub: 'Valle de Tena · noches 1 y 3',
    coords: [42.7714, -0.3336],
    kind: 'base',
    days: [1, 2, 3, 4],
  },
  {
    id: 'respomuso',
    name: 'Refugio de Respomuso',
    sub: '2.220 m · noche del día 2 (o vivac en el circo)',
    coords: [42.8169, -0.2876],
    kind: 'base',
    days: [2, 3],
  },
  {
    id: 'torla',
    name: 'Torla · Ordesa',
    sub: 'Parque Nacional · noches 4–7',
    coords: [42.6222, -0.112],
    kind: 'base',
    days: [5, 6, 7, 8],
  },
  {
    id: 'goriz',
    name: 'Refugio de Góriz',
    sub: '2.200 m · noche del día 5',
    coords: [42.6652, 0.0161],
    kind: 'base',
    days: [5, 6],
  },
  {
    id: 'oza',
    name: 'Selva de Oza',
    sub: 'Valle de Hecho · día 8, de paso (no se duerme)',
    coords: [42.8497, -0.6899],
    kind: 'base',
    days: [8],
  },
  {
    id: 'linza',
    name: 'Linza · Zuriza',
    sub: 'Valle de Ansó · noches 8 y 9',
    coords: [42.9153, -0.7847],
    kind: 'base',
    days: [8, 9],
  },
]

/* Paradas de referencia: no se duerme en ellas, pero orientan el mapa. */
export const hitos = [
  { id: 'lanuza', name: 'Lanuza', coords: [42.7514, -0.3186], kind: 'hito' },
  { id: 'panticosa', name: 'Panticosa', coords: [42.7186, -0.2789], kind: 'hito' },
  { id: 'biescas', name: 'Biescas', coords: [42.6303, -0.3242], kind: 'hito' },
  { id: 'sabinanigo', name: 'Sabiñánigo', coords: [42.5183, -0.3661], kind: 'hito' },
  { id: 'ainsa', name: 'Aínsa', coords: [42.419, 0.137], kind: 'hito' },
  { id: 'bujaruelo', name: 'San Nicolás de Bujaruelo', coords: [42.7052, -0.1264], kind: 'hito' },
  { id: 'jaca', name: 'Jaca', coords: [42.57, -0.5497], kind: 'hito' },
  { id: 'sanjuan', name: 'San Juan de la Peña', coords: [42.5089, -0.669], kind: 'hito' },
  { id: 'hecho', name: 'Hecho', coords: [42.7419, -0.7517], kind: 'hito' },
  { id: 'anso', name: 'Ansó', coords: [42.7561, -0.8347], kind: 'hito' },
]

export const basesById = Object.fromEntries(bases.map((b) => [b.id, b]))

/* Encuadre por defecto: Pirineo Aragonés de Ansó a Ordesa. */
export const PIRINEO_BOUNDS = [
  [42.38, -0.95],
  [42.99, 0.2],
]
