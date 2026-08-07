/**
 * Noches del viaje que se duermen en un refugio con reserva online.
 *
 * Es el puente entre el itinerario (número de día) y la disponibilidad
 * (`src/data/plazas.json`, indexado por refugio + fecha ISO).
 *
 * Las demás noches son camping, hotel o valle y no tienen motor de reservas:
 *   noches 1 y 3 → Sallent de Gállego · noches 4-7 → Torla / Ordesa
 *
 * ⚠ La noche 5 puede ser en Góriz (día 5, Monte Perdido). Si el plan elegido de ese
 * día no sube a Góriz, el indicador sigue siendo informativo, no un error.
 */

/** Personas del viaje: el umbral para considerar que "hay sitio". */
export const PLAZAS_NECESARIAS = 4

/** Ventana completa del viaje, para la tabla de la sección de plazas. */
export const VENTANA_VIAJE = { desde: '2026-08-21', hasta: '2026-08-30' }

/**
 * Fecha ISO de una jornada (día 1 → 21 ago, día 10 → 30 ago). Los diez días caen
 * dentro de agosto, así que basta con sumar; si algún año el viaje cruzase de mes,
 * habría que pasar a aritmética de fechas de verdad.
 *
 * ⚠ Los días traen `num` como cadena con cero delante ('05'): normalizar con Number.
 */
export const fechaDia = (num) => `2026-08-${20 + Number(num)}`

/** día del itinerario → { refugio (friendlyurl), fecha ISO de la NOCHE } */
export const NOCHES_EN_REFUGIO = {
  2: { refugio: 'respomuso', fecha: '2026-08-22', nota: 'Refugio de Respomuso (2.220 m)' },
  5: { refugio: 'goriz', fecha: '2026-08-25', nota: 'Refugio de Góriz (2.200 m)' },
  8: { refugio: 'linza', fecha: '2026-08-28', nota: 'Refugio de Linza' },
  9: { refugio: 'linza', fecha: '2026-08-29', nota: 'Refugio de Linza' },
}

/** Orden en que se muestran los refugios en la sección. */
export const ORDEN_REFUGIOS = ['respomuso', 'goriz', 'linza']
