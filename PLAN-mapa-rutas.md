# Plan — Sección «Mapa de tu viaje» (rutas + trayectos en coche)

**Objetivo:** una sección nueva que, a partir de los planes elegidos en cada día
(`pirineos2026-seleccion`), pinte sobre un mapa real: el **track de la ruta de montaña**
del plan seleccionado y el **trayecto en coche por carretera** entre bases, con su tiempo
aproximado.

**Decisiones tomadas**

| Decisión | Elección |
|---|---|
| Motor de mapa | **Leaflet + react-leaflet**, teselas reales (OpenTopoMap, relieve) |
| Tracks de montaña | **Waypoints aproximados a mano** (5–15 puntos por plan) en `src/data/` |
| Trayectos en coche | **Polilínea que sigue la carretera real** + etiqueta de tiempo/km |
| Ubicación | **Sección propia `#mapa-viaje`**, después del bloque `#viaje`, ancla nueva en la nav |

---

## Arquitectura propuesta

```
src/
├── data/
│   ├── geo/
│   │   ├── bases.js        ← puntos fijos: Teruel, Sallent, Torla, Oza, Linza, Alicante…
│   │   ├── tramos.js       ← trayectos en coche (polilínea por carretera + tiempo/km/vía)
│   │   └── tracks.js       ← tracks de montaña por clave 'd5a' (misma convención que art/profile)
│   └── dias/dia-N.js       ← cada plan gana `track: 'd5a'` (opcional; sin él, no pinta ruta)
├── components/mapaviaje/
│   ├── MapaViaje.jsx       ← <section>: cabecera, selector de día, leyenda, estado vacío
│   ├── MapCanvas.jsx       ← Leaflet (lazy): teselas, capas, fitBounds
│   ├── MapLayers.jsx       ← deriva capas desde `sel` (rutas + tramos + marcadores)
│   ├── MapLegend.jsx
│   └── *.module.css
└── hooks/useMapBounds.js   ← encuadre según día activo / viaje completo
```

- **Fuente de verdad = `TripContext`.** La sección solo *lee* `sel`; no duplica estado.
- **Convención de claves** idéntica a `art`/`profile`: plan B del día 5 → `d5b`. Un plan sin
  track no rompe nada: se pinta solo el marcador de la base y un aviso discreto.
- **Sin backend.** Las polilíneas de carretera se generan **una vez** con un script offline
  (OSRM público) y se guardan como datos estáticos. En runtime no se llama a ninguna API.

### Modelo de datos

```js
// geo/bases.js
{ id: 'sallent', name: 'Sallent de Gállego', coords: [42.7717, -0.3339],
  kind: 'base', days: [1,2,3,4] }

// geo/tramos.js
{ id: 'teruel-sallent', from: 'teruel', to: 'sallent', day: 1,
  time: '3 h 45 min', km: 290, via: 'A-23 / N-330 / A-136',
  path: [[40.345,-1.106], …] }   // ~200–400 puntos, simplificados

// geo/tracks.js
'd5a': { name: 'Cola de Caballo + Góriz', kind: 'ida',
         start: [42.6469,-0.0517], end: [42.6608,0.0164],
         path: [[…],[…]], pois: [{ at: [42.66,0.01], label: 'Cola de Caballo' }] }
```

---

## Hitos

### H0 · Andamiaje (0,5 día)
- `npm i leaflet react-leaflet` (+ CSS de Leaflet importado en `global.css`).
- `MapaViaje.jsx` vacío montado en `App.jsx` tras `<Viaje />`, ancla `#mapa-viaje` en `Nav`.
- Decidir tema: sección **clara** (coherente con Top/Material) con las teselas sin filtrar.
- **Hecho cuando:** `npm run build` pasa y la sección aparece con su cabecera y placeholder.

### H1 · Mapa base vivo (0,5 día)
- `MapCanvas.jsx` con OpenTopoMap (+ atribución obligatoria) y fallback a OSM.
- Encuadre inicial al bounding box del Pirineo Aragonés; `scrollWheelZoom` desactivado por
  defecto (se activa al hacer clic) para no secuestrar el scroll de la página.
- Marcadores de las 6 bases desde `geo/bases.js`, con tooltip.
- **Hecho cuando:** se ve el relieve, las 6 bases y el mapa es navegable en móvil y escritorio.

### H2 · Trayectos en coche por carretera (1 día)
- Script `scripts/build-tramos.mjs`: pide a OSRM la geometría real de cada tramo, la
  simplifica (Douglas-Peucker, tolerancia ~50 m) y escribe `geo/tramos.js`.
- 5 tramos base + los traslados de los días 4 y 7 (Tena→Torla, Sobrarbe→Oza) y el retorno.
- Estilo: línea sólida ámbar, sin flechas; etiqueta flotante con tiempo + km + vía.
- **Verificar** tiempos/km contra `src/data/mapa.js` y los `datasheet` de cada día: la web ya
  publica cifras y no pueden contradecirse.
- **Hecho cuando:** el bucle de ~850 km se dibuja siguiendo carreteras reales.

### H3 · Tracks de montaña (2–3 días · el grueso del trabajo)
- 52 planes. Orden: primero los **planes recomendados** de cada día (los del callout), luego
  el resto. Cada track: inicio (parking/base), hitos intermedios, cima/destino, y `pois`.
- Añadir `track: 'dNx'` a los planes en `src/data/dias/dia-N.js`.
- Estilo por tipo: circular / ida y vuelta / travesía / refugio (color + patrón de guiones).
- **Hecho cuando:** todos los planes con track pintan una línea plausible; los que falten
  degradan sin error.

### H4 · Reactividad a la selección (1 día)
- `MapLayers` deriva de `sel`: por cada día con plan elegido → su track + el tramo de coche
  de ese día. Días sin elegir → atenuados o no dibujados (a decidir con un toggle).
- Selector de día en la sección (chips D01–D10 + «Todo el viaje») que hace `fitBounds`.
- Clic en un track → popup con nombre del plan, distancia, desnivel, tiempo y enlace al día
  (reutiliza `goToView` de `ViajeNavContext`).
- **Hecho cuando:** elegir un plan en un día actualiza el mapa sin recargar, y la selección
  persiste al refrescar.

### H5 · UI y pulido (1 día)
- Leyenda (coche / ruta / base / cima), estado vacío («aún no has elegido planes»),
  contador de km a pie + km en coche del viaje montado.
- Responsive: mapa a altura fija en móvil, panel lateral en escritorio.
- Accesibilidad: `role`/`aria-label` en el contenedor, alternativa textual (lista de etapas
  con tiempos) para lectores de pantalla — el mapa no puede ser la única fuente.
- Rendimiento: `React.lazy` + `IntersectionObserver` para no cargar Leaflet hasta que la
  sección entra en viewport.

### H6 · Verificación (0,5 día)
- `npm run build` + render headless sin errores de consola.
- Revisión de **coordenadas** una a una contra fuente fiable (no publicar cimas mal situadas).
- Cotejo de tiempos de coche con los ya publicados en la web.
- Actualizar `CLAUDE.md`: ficheros nuevos, convención `track`, changelog.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Coste de crear 52 tracks a mano | Priorizar planes recomendados; el resto degrada limpiamente |
| Uso de teselas de OpenTopoMap (política de uso justo) | Atribución correcta + fallback a OSM; si crece el tráfico, valorar proveedor con clave |
| Rompe el «sin dependencias externas» del proyecto | Leaflet es la única dependencia nueva; carga diferida y sin CDN de terceros en runtime |
| Coordenadas inventadas | H6 hace verificación explícita; ningún dato se publica sin comprobar |
| El mapa secuestra el scroll en móvil | Zoom por gesto de dos dedos y `scrollWheelZoom` bajo clic |

**Estimación total: ~6–7 jornadas de trabajo**, de las cuales H3 (tracks) es la mitad.
