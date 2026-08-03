/* Etapas del bucle de coche (sección #mapa).
   Los km y tiempos se copian de `src/data/geo/tramos.js`, que es la fuente.
   `npm run check:geo` falla si dejan de cuadrar. */
export const rutaEtapas = [
  { num: 1, name: 'Teruel', sub: 'Punto de partida', drive: '≈ 4 h · 330 km al siguiente destino' },
  { num: 2, name: 'Sallent de Gállego', sub: 'Valle de Tena · noches 1 y 3 (la 2ª, a 2.220 m en Respomuso)', drive: '≈ 1 h · 45 km al siguiente destino' },
  { num: 3, name: 'Torla · Ordesa', sub: 'Parque Nacional · noches 4–7', drive: '≈ 2 h 15 min · 121 km al siguiente destino' },
  { num: 4, name: 'Selva de Oza', sub: 'Valle de Hecho · día 8, sin noche', drive: '≈ 1 h 50 min · 50 km al siguiente destino' },
  { num: 5, name: 'Linza · Zuriza', sub: 'Valle de Ansó · noches 8–9', drive: '≈ 5 h 10 min · 374 km al siguiente destino' },
  { num: 6, name: 'Teruel', sub: 'Regreso con paradas · día 10', drive: null },
]
