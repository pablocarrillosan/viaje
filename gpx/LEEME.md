# Tracks de GPS (.gpx)

Deja aquí los ficheros `.gpx` de las rutas a pie y lanza `npm run import:gpx`.

**El nombre del fichero es la clave del plan**, la misma convención `dNx` que usan
`src/data/geo/tracks.js`, los paisajes y los perfiles:

| Fichero    | Ruta                              |
|------------|-----------------------------------|
| `d2c.gpx`  | día 2 · plan C                    |
| `d6a.gpx`  | día 6 · plan A (Monte Perdido)    |

El importador comprueba que el track cae en el Pirineo aragonés, que el día y el
plan existen, y que su longitud cuadra con la distancia publicada en la ficha del
día. Deja el resultado en `src/data/geo/tracks.generado.js` para que lo revises
antes de copiarlo a `tracks.js`.

Detecta solo si el GPX trae la caminata entera o únicamente la ida, comparando
ambas lecturas con la distancia publicada. No hace falta que se lo digas.
