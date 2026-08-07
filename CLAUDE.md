# CLAUDE.md — Guía del proyecto "Pirineos 2026"

Documento vivo para entender el proyecto y registrar el trabajo. Léelo antes de editar.

> **⚠️ Arquitectura actual: React + Vite (migrado desde web estática).** El código vive en
> `src/` (componentes con CSS Modules + datos en `src/data/`). El `index.html` de la raíz es
> ahora el *entry* de Vite. La web estática original se conserva íntegra en `legacy/` como
> referencia. Varias secciones de abajo describen la **estructura antigua** (útil como mapa del
> contenido, ya que el markup React lo replica 1:1); ver "Arquitectura React" y el changelog.

## Qué es

Web estática de una sola página que planifica un **viaje de montaña por el Pirineo Aragonés**.
Es una **guía de ruta** (estilo ficha de montaña) con itinerario día a día, alternativas por
jornada y un selector para "montar tu viaje".

- **La web es CLARA y con scroll** (diseño original) para Hero, Mapa, Itinerario, Top rutas y
  Material, con la **barra de navegación fija de anclas** de siempre.
- **Bloque "Viaje" (`#viaje`, tema OSCURO) con pestañas:** el itinerario día a día **no** son
  secciones apiladas, sino **un único bloque** con una barra de **pestañas** (D01–D10 + "Tu viaje")
  que conmuta **paneles** (`.panel`); solo se ve el activo, a **altura natural** (la página
  scrollea con normalidad). Es la **única** parte en oscuro (verde pino + turquesa de ibón); el
  tema oscuro está **scopeado a `.viaje`** en el CSS (redefine tokens dentro del bloque).
- **Stack:** **React 18 + Vite** (JSX, sin TypeScript) + **CSS Modules**. El IIFE vanilla original
  se sustituyó por: estado de pestaña activa (`ViajeNavContext`) y selección de plan
  (`useTripSelection` + `TripContext`, misma clave `pirineos2026-seleccion` en localStorage).
- **Sin imágenes externas:** todas las ilustraciones (montañas, perfiles de altimetría, iconos)
  son **SVG inline** escritos a mano.

## El viaje real

- **Fechas:** 21–30 de **agosto de 2026** (10 días de calendario).
- **Salida:** desde **Alicante**; se recoge a un amigo en **Teruel** de camino.
- **Núcleo:** **10 jornadas** documentadas: 6 de montaña + **2 de descanso escénico** (días 4 y
  7, añadidos para no encadenar esfuerzo) + trayectos. Los Alicante↔Teruel son contexto.
- **Enfoque:** montañístico, pero con respiro. Los dos días de descanso meten pueblos, rutas
  llanas y atardeceres entre los bloques duros.
- **Campamentos base (10 días) — dónde se DUERME cada noche:**
  - Noches 1 y 3: **Sallent de Gállego** (Valle de Tena)
  - **Noche 2: refugio de Respomuso (2.220 m)** o vivac legal en el circo de Piedrafita
  - **Día 4: descanso Valle de Tena** (Lanuza, Panticosa, atardecer) + traslado a Torla
  - **Noches 4–7: Torla / Ordesa** (Cola de Caballo/Soaso, Monte Perdido; la 5ª puede ser en Góriz)
  - **Día 7: descanso Sobrarbe** (Aínsa medieval + Bujaruelo, atardecer murallas) — **sin traslado**
  - Día 8: traslado por la mañana a la **Selva de Oza** (Aguas Tuertas) y seguir hasta Linza
  - **Noches 8–9: Linza / Zuriza** (Valle de Ansó) — Mesa de los Tres Reyes
  - Día 10: **Regreso a Teruel** (patrimonio) y a Alicante
- ⚠ **Selva de Oza NO es base de noche** (lo fue hasta julio de 2026): el día 8 se pasa por ella
  y se sigue. Sigue en `bases.js` con `days: [8]` porque los `hitos` llevan `days: []` y no se
  enfocan al filtrar por día; su `sub` lo aclara.
- **Regla de oro de los traslados:** **ningún traslado después del atardecer.** El día 7 encadenaba
  atardecer en Aínsa (~21:00) + 166 km hasta Oza y llegaba de madrugada a un camping de fondo de
  valle. Si añades jornadas, comprueba que el traslado cabe con luz.
- ⚠ **En los ibones de Anayet NO se puede acampar ni bañarse** (ORDEN MAT/221/2026, BOA
  17-feb-2026, vigencia 5 años): baño prohibido todo el año y acampada prohibida del **21 jun al
  21 sep** en el Humedal Singular y su zona periférica. Por eso el vivac del día 2 se movió a
  Respomuso. Anayet sigue en la guía como ruta de ida y vuelta (día 2 plan C, día 3 plan E).
- **Vivac legal en Aragón** (Decreto 61/2006, «acampada de alta montaña»): por encima de 1.500 m,
  a más de 2 h de marcha de cualquier punto accesible en coche, máximo 3 noches, a más de 100 m de
  ríos e ibones, montado solo entre 1 h antes del anochecer y 1 h después del amanecer, y con
  **comunicación previa a la comarca (Alto Gállego) y al 112**. No es autorización, pero sí aviso.
- **Nota agosto:** masificación alta y calor (madrugar); ibones templados, buenos para baño;
  poca nieve en los tresmiles. **Ordesa (días 5–6): lanzadera obligatoria desde Torla**
  (aprox. 6:00–19:00, cada 15–20 min); el coche particular no accede a la Pradera.
- **Bucle en coche: 920 km** (ver «Datos geográficos»). El orden de valles es el óptimo: hay
  8 órdenes empatados y el vuestro es uno de ellos, porque agrupa las parejas vecinas
  (Tena+Ordesa por Cotefablo, Hecho+Ansó por la carretera de Ansó). Romper una pareja cuesta
  entre +48 y +151 km. Que el día 5 «vaya al este» y el 8 «vuelva al oeste» no cuesta nada: es
  el peaje de cruzar entre las dos parejas, y se paga una sola vez en cualquier sentido.

## Ficheros

```
viaje/
├── index.html            ← entry de Vite (<div id="root"> + <script src=/src/main.jsx>)
├── vite.config.js        ← plugin react + vite-plugin-svgr (SVGO conserva var(--ibon))
├── package.json
├── legacy/               ← web estática ORIGINAL (index.html + styles.css) como referencia
├── scripts/
│   ├── check-geo.mjs     ← `npm run check:geo` · valida coordenadas, tracks y tramos
│   ├── build-tramos.mjs  ← `npm run build:tramos` · regenera las polilíneas con OSRM (red)
│   └── import-gpx.mjs    ← `npm run import:gpx` · convierte gpx/dNx.gpx en tracks
├── gpx/                  ← deja aquí los .gpx de las rutas a pie (ver gpx/LEEME.md)
├── CLAUDE.md             ← este documento
└── src/
    ├── main.jsx · App.jsx
    ├── styles/{tokens.css, global.css}          ← estilos COMPARTIDOS (tokens + reset + atómicas)
    ├── data/
    │   ├── dias.js        ← día 1 inline + importa dias/dia-2…10; DAY_TITLES, TOTAL_DIAS
    │   ├── dias/dia-N.js  ← un fichero de datos POR DÍA (export default)
    │   ├── geo/{bases,tramos,tracks}.js         ← datos del mapa Leaflet (ver "Mapa de tu viaje")
    │   └── {mapa,top,material}.js
    ├── assets/svg/{landscapes,profiles}/*.svg   ← paisajes (62) y perfiles (52) como ficheros
    ├── components/        ← un .jsx + un .module.css por componente
    │   ├── icons/{Icon.jsx, paths.jsx}          ← <Icon name> (~27 formas; colapsa ~934 SVG)
    │   ├── SvgArt.jsx     ← Landscape/Profile (resuelve .svg por clave con import.meta.glob)
    │   ├── ui/{Rating, RichText}.jsx
    │   ├── layout/{Nav,Hero,Footer} · Map · Timeline · Top · Material
    │   ├── viaje/{Viaje,ViajeTabs,Day,PlanTabs,PlanPanel,Datasheet,CompareTable,Nearby,PlazasChip,TripSummary}
    │   └── mapaviaje/{MapaViaje,MapCanvas,MapLayers,MapLegend}.jsx + deriveLayers.js
    ├── hooks/{useTripSelection,useMapBounds}.js
    └── context/{ViajeNavContext,TripContext}.jsx
```

**El contenido SÍ está separado en datos** (`src/data/`): cada día y cada plan es un objeto JS;
componentes genéricos (`Day`, `PlanPanel`…) los renderizan. Las ilustraciones se referencian por
**clave** (`art`/`profile` → ficheros `.svg`) y los iconos por **nombre** (`icon` → `<Icon>`).

## Estructura de `index.html`

La página es un **scroll normal** de secciones claras. **Solo** `#viaje` es un bloque oscuro con
pestañas: contiene `.viaje__head` + `.viaje__tabs` (botones `.tab` con `data-view`) + los paneles
(`section.day.panel` de cada día y un `div.panel#tu-viaje`). Solo se muestra el `.panel.is-active`;
por defecto, `dia-1`. Los demás bloques son las secciones originales.

| Sección | id | Tema | Contenido |
|---|---|---|---|
| Nav fija | `.nav` | claro | Anclas: Mapa, Itinerario, **Días → `#viaje`**, **Tu viaje → `#viaje`** (data-goto), Top, Material |
| Hero | `#hero` | claro | Portada y stats generales |
| Mapa | `#mapa` | claro | Bucle de coche (~920 km) con tiempos entre etapas |
| Itinerario | `#itinerario` | claro | Timeline de 10 `.tl-item` (cada uno con `data-goto` a su día del bloque) |
| **Viaje** | `#viaje` | **oscuro** | **Bloque con pestañas**: `.viaje__tabs` (D01–D10 + Tu viaje) + paneles `dia-1`…`dia-10` (anatomía abajo) + panel `tu-viaje` (resumen, `#trip-summary`) |
| **Mapa de tu viaje** | `#mapa-viaje` | claro | **Mapa Leaflet real**: rutas elegidas + trayectos en coche (ver sección propia abajo) |
| **Refugios** | `#refugios` | claro | **Mapa Leaflet** de los 53 refugios guardados y libres de los 4 valles + vertiente francesa (ver sección propia abajo) |
| Top rutas | `#top` | claro | Ranking de rutas destacadas |
| Material | `#material` | claro | Equipo recomendado |
| Footer | `.footer` | claro | Cierre (fuera de `#viaje`) |
| Script | — | — | JS de **pestañas de `#viaje`** + **selección de planes** |

### Anatomía de un día — ⚠ OBSOLETA (así era en `legacy/`)

> El día ya no es «contenido + carrusel de tarjetas». Desde agosto de 2026 la jornada **es** la
> alternativa activa, con una barra de pestañas propia: ver **«La jornada ES la alternativa
> activa»** más abajo. Se deja esto como mapa de la web estática de `legacy/`.

1. `.day__head` — número, `.eyebrow` (zona) y `<h3>` (título).
2. `.day__grid`:
   - `.day__content` — `.day__desc` (párrafos), `.callout` ("Mi recomendación"),
     `.chips` de "Consejos" y "Material recomendado".
   - `.day__photo-wrap` — foto SVG (`.dayphoto`) + `.datasheet` (ficha clave/valor).
3. `.plans-head` + `.carousel` — tarjetas `<article class="plan">` (alternativas A, B, C…).
4. `.compare-wrap` — tabla comparativa de las alternativas.
5. `.nearby` — **bloque "Pueblos y paradas cerca"**.

### Anatomía de un plan (`<article class="plan">`) — ⚠ OBSOLETA

Los mismos campos siguen vivos **como datos** (`type`, `name`, `desc`, `profile`, `stats`, `pros`,
`cons`, `when`), pero ya no se pintan como tarjeta de carrusel: los renderiza `PlanPanel` a lo
ancho de la jornada.

`.plan__img` (SVG) · `.plan__badge {a|b|c|d|e|f|g}` · `.plan__rate` · `.plan__type` ·
`.plan__name` · `.plan__desc` · `.profile` (perfil de altimetría) ·
`.plan__stats` (Distancia / Desnivel / Tiempo / Tipo) · `.plan__pc` (A favor / En contra) ·
`.plan__when` ("Cuándo elegirla") · `button.plan__pick`.

## Selección de planes (JS)

- Estado en `localStorage`, clave **`pirineos2026-seleccion`**.
- El IIFE recoge **todos** los `.plan__pick` con `querySelectorAll`, marca la tarjeta elegida
  (`is-picked`) y construye el resumen en `#tu-viaje`.
- **Añadir tarjetas nuevas no requiere tocar el JS**: se enganchan solas por sus `data-*`.

### Navegación por pestañas del bloque `#viaje` (JS)

- `showView(view, scrollTo)` muestra el `.panel[data-view=view]` dentro de `#viaje`, marca su
  `.tab`, centra la pestaña en la barra y, si `scrollTo`, hace scroll de la **página** hasta el
  bloque (bajo la nav). Se dispara desde los `.tab` y desde cualquier `[data-goto]` (enlaces de la
  nav "Días"/"Tu viaje", `.tl-item` de la timeline, botones del hero).
- ⚠ **El scroll se ancla a la barra de pestañas, no a la cabecera del bloque.** `goToView` mide el
  contenedor de **paneles** (`panelsRef`) y le resta la nav más la altura de la barra
  (`tabsRef.offsetHeight`): al elegir un día quedan arriba las pestañas y debajo el contenido, sin
  pasar por el título "El viaje, día a día". **No midas la barra con `getBoundingClientRect`**: es
  `position: sticky`, así que una vez pegada devuelve su posición actual y el scroll saldría nulo.
- El tema oscuro está **scopeado a `.viaje`** en `styles.css` (sección 21): redefine los tokens
  (`--niebla`, `--nieve`, `--pizarra`…) dentro del bloque, más arreglos puntuales de colores
  hardcodeados (rayado del `datasheet`, `plan__rate`, cabeceras `plan-b…g` de la comparativa,
  `callout`, bloque `decide`).
- **Añadir un día nuevo** = añadir su `<section class="day panel" id="dia-N" role="tabpanel"
  data-view="dia-N">` dentro de `.viaje__panels`, **su `.tab`** en `.viaje__tabs-inner` (con
  `data-view="dia-N"`) y su título en `DAY_TITLES` (para el resumen de "Tu viaje"). El panel se
  engancha solo por `data-view`.

## Sección «Mapa de tu viaje» (`#mapa-viaje`)

Mapa **Leaflet real** (react-leaflet 4, teselas de OpenTopoMap con relieve y *fallback* a OSM)
que pinta, a partir de la selección de planes, la **ruta de montaña** de cada día y el
**trayecto en coche** entre bases. Va después del bloque `#viaje`, en tema **claro**.

- **Fuente de verdad = `TripContext`.** La sección solo *lee* `sel`; no duplica estado. Elegir un
  plan en cualquier día actualiza el mapa al instante y persiste (misma clave de localStorage).
- **Los tracks se resuelven por CONVENCIÓN**, igual que `art`/`profile`: plan B del día 5 →
  clave `d5b` en `src/data/geo/tracks.js`. **No hay que añadir ningún campo a los datos del día.**
  Un plan sin track no rompe nada: el mapa lo dibuja todo igual y avisa en el panel lateral.
- **Días sin plan elegido** se pintan en fantasma con su plan recomendado (fila `reco` de la
  tabla comparativa), y hay un interruptor para ocultarlos.
- **`sinRuta: true` en un plan** = no tiene recorrido que dibujar (día 1 plan A, «Llegar y
  descansar»). El mapa lo excluye del aviso «sin trazado todavía», que es para tracks pendientes,
  no para planes que no andan. Si añades un plan de puro coche o de descanso, márcalo.
- **Leaflet se carga en diferido** (`React.lazy` + `IntersectionObserver`): no entra en el bundle
  inicial (chunk aparte de ~160 kB). La rueda del ratón solo hace zoom tras hacer clic en el
  mapa, y en móvil se arrastra con dos dedos, para no secuestrar el scroll de la página.
- **Alternativa textual** (lista de etapas en un `<details>`): el mapa no puede ser la única fuente.

### Datos geográficos (`src/data/geo/`)

| Fichero | Qué contiene |
|---|---|
| `bases.js` | Las 6 bases donde se duerme + hitos de carretera + bbox del Pirineo |
| `tramos.js` | Los 6 trayectos en coche: polilínea, tiempo, km y vía |
| `tracks.js` | Un track por ruta, con `path` y `pois`, indexado por clave `dNx` |
| `refugios.js` | Los 53 refugios de la sección `#refugios` + las 4 `ZONAS` y las `FUENTES` |

⚠ **Los trazados son APROXIMADOS.** Las carreteras se dibujan pasando por pueblos y puertos
reales (no vienen de un router); las rutas de montaña se interpolan entre waypoints verificados
(aparcamientos, ibones, collados, cimas, refugios). Sirven para situar cada jornada en el valle,
no para navegar. La línea dibujada suele quedarse **corta** respecto a la distancia real.

- **Los tiempos y km de coche NO se inventan aquí**: `tramos.js` es la fuente y `mapa.js` y los
  `datasheet` la copian. La web no puede contradecirse a sí misma; `npm run check:geo` lo comprueba.
- **De dónde salen los km (revisados el 2026-07-31):** de OSRM, ruta origen→destino **sin puntos
  de paso** (`npm run build:tramos`, columna `kmDirecto`). Los `time` de los cuatro tramos de
  montaña llevan **+15-20 min sobre OSRM**, que calcula circulación libre y esto se conduce en
  agosto; los dos tramos largos de autovía van con el tiempo del router tal cual.
- **Geometría: ya es REAL** (2026-07-31). Los seis `path` vienen de OSRM (`npm run build:tramos`,
  una sola ruta por tramo origen→destino sin puntos de paso), simplificados a 150 m. Miden el
  0,91-0,99 de la distancia publicada; los dibujados a mano se quedaban en 0,75-0,85. **No los
  edites a mano**: regenera y copia.
- **Por qué sin puntos de paso.** La primera versión mandaba los waypoints dibujados a mano para
  «forzar el corredor». Contraproducente: son aproximados, OSRM debe pasar por cada uno y
  rectifica dando marcha atrás — Sallent→Torla salía a 99 km / 5 h 12 (19 km/h) en vez de 45 km.
  No hacen falta: el corredor alternativo más próximo es entre +26 y +129 km, así que la ruta
  rápida ya es la buena.
- **En vez de forzar, se comprueba.** Cada tramo declara `control`: los puntos por los que tiene
  que pasar. `build:tramos` **y también `check:geo`** miden la distancia del trazado a cada uno y
  fallan si alguno supera 3 km — así se valida sin red en cada ejecución. Si cambias un `via`,
  cambia su `control`.
- ⚠ **Los puntos de control van sobre la CARRETERA, no en el centro del pueblo.** Tres de los
  primeros estaban mal por esto: «Zaragoza» (la A-23 la rodea por la Z-40, 3,4 km) y el «túnel de
  Cotefablo» (la coordenada salía del propio trazado a mano, 3,3 km). Se sustituyeron por pueblos
  que la vía sí atraviesa.
- **El regreso NO baja por la Foz de Biniés.** De Linza vuelve por Ansó → **Hecho** → valle de
  Hecho → Puente la Reina → A-132 por Ayerbe. Es la ruta rápida y repasa el valle del día 8;
  Berdún queda a 8,5 km, así que no sirve como punto de control.
- ⚠ **Los tracks a pie son BOCETOS, no rutas reales.** Los diez originales tienen entre 4 y 29
  puntos interpolados a mano entre waypoints: sobre el mapa son rectas que cruzan crestas y
  barrancos. Miden mucho menos que la ruta real — Monte Perdido dibuja **5,0 km de los 14
  publicados** (0,36); Soaso 0,64; Anayet 0,74. Un track de GPS trae un punto cada 5-20 m.
- **Arreglarlos = importar GPX reales.** Deja el fichero en `gpx/dNx.gpx` (Wikiloc o la app que
  sea) y lanza `npm run import:gpx`: valida bbox, día/plan y que la longitud cuadre con la
  distancia publicada, y deja `src/data/geo/tracks.generado.js` para revisar y copiar.
- **`pathCompleto: true`** en un track «ida-vuelta» = el `path` ya incluye la vuelta (típico de un
  GPX de Wikiloc) y por tanto NO se multiplica por 2 al medir. Los `path` a mano dibujaban solo la
  ida, de ahí el ×2 de `check:geo`. El importador deduce cuál es cada caso comparando ambas
  lecturas con la distancia publicada.
- **Añadir un track a mano:** añade la clave `dNx` a `tracks.js` y ya está. Después,
  `npm run check:geo` (valida bbox, que el día/plan existan, y que el trazado no salga más largo
  que lo publicado).
- **Geometría exacta de carretera:** `npm run build:tramos` pide los trazados a OSRM (necesita
  red) y deja `geo/tramos.generado.js` para copiar los `path` tras revisarlos.

## Convenciones para editar

- **Añadir/cambiar un plan de un día (React):** abre el fichero del día (`src/data/dias/dia-N.js`,
  o `dias.js` para el día 1) y edita/añade un objeto en su array `plans` (letra libre en `plan`,
  y añade la columna en `compare.columns` + un valor por fila en `compare.rows[].values`). Crea sus
  dos SVG: `src/assets/svg/landscapes/dNx.svg` y `src/assets/svg/profiles/dNx.svg` (perfil con
  `var(--ibon)` intacto), y apúntalos en `art`/`profile`. **No hay que tocar ningún componente ni
  el rótulo "N planes…"** (se calcula solo). El selector "Tu viaje" también se engancha solo.
- **Añadir un día nuevo:** crea `src/data/dias/dia-N.js` (export default con el esquema del día 1),
  impórtalo en `src/data/dias.js` y añádelo al array `dias`. Pestaña, panel y resumen se generan solos.
- **Añadir un pueblo/parada:** usar el componente `.nearby` / `.town` (ver `styles.css`).
- **Dibujar un plan en el mapa:** crear la clave `dNx` en `src/data/geo/tracks.js` (waypoints
  reales + `pois`) y correr `npm run check:geo`. Nada más: la sección lo recoge sola.
- **Colores/tipografía:** tokens en `:root` de `styles.css` (paleta caliza + turquesa de ibón,
  Inter/Inter Tight + JetBrains Mono). Reutilizar tokens, no hardcodear colores.
- **Accesibilidad:** mantener `role`/`aria-label` en SVG e iconos y `aria-pressed` en los
  botones de selección, como en el resto del documento.
- **Datos:** verificar altitudes, desniveles, tiempos y distancias de coche antes de publicarlos.

## Sección «Plazas en refugios» (`#plazas`)

Disponibilidad real de las tres noches en refugio, del 21 al 30 de agosto. Va después de
`#mapa-viaje`, en tema **claro**, con ancla propia en la nav.

- **Fuente: la API pública que alimenta el calendario oficial** de alberguesyrefugios.com
  (descubierta capturando el tráfico del propio widget de reservas):
  - `GET /refugios/getAll?lang=es` → catálogo, para resolver `friendlyurl` → `id`
  - `GET /refugios/get/<id>/getPlazas2/` → disponibilidad por tipo de plaza y día
  - **`plazas` = `plazasDisponibles − plazasUsadas` = huecos libres.** Es el único campo
    fiable. ⚠ **`estado` NO indica disponibilidad** y se ignora a propósito: el día en
    curso sale con `estado: 3` teniendo plazas libres, porque no se puede reservar el
    mismo día.
- ⚠ **«0 plazas» = completo ONLINE, no refugio lleno.** El motor de internet maneja un cupo
  limitado de cada establecimiento (por eso `plazasDisponibles` baila entre 47 y 90 en un
  refugio de 80 camas). El propio calendario tiene una categoría «Sin plazas online, llama
  por teléfono». Este matiz está escrito en la web, en el email de aviso y en los scripts:
  **no lo quites.**
- **Dos fuentes, en cascada:** la instantánea `src/data/plazas.json` (viaja en el bundle,
  siempre está) y un intento de refresco **en vivo** contra la API cuando la sección entra
  en pantalla. La API está en otro dominio, así que puede fallar por CORS: si pasa, se
  mantiene la instantánea y se dice en pantalla. Nunca queda vacía.
- **Refrescar la instantánea:** `npm run fetch:plazas` (escribe `src/data/plazas.json`;
  commitéalo para que la web publicada lo lleve).
- **`src/data/noches.js`** es el puente itinerario → disponibilidad: qué día duerme en qué
  refugio y en qué fecha. ⚠ Los días llevan `num` como **cadena con cero delante** (`'05'`),
  así que el chip normaliza con `Number(num)`.
- **Chip por día:** `viaje/PlazasChip.jsx` pinta un indicador en la cabecera de los días
  2, 5, 8 y 9. Vive dentro del bloque oscuro, así que su CSS no usa los tokens claros.
- **Vigilancia fuera de la web:** `scripts/goriz-watch/check-refugios.mjs` consulta la misma
  API cada 20 min y avisa por email. Nunca avanza el asistente de reserva: el sistema
  bloquea las plazas solicitadas hasta el pago del anticipo.

### Automatización (sin tocar nada a mano)

| Qué | Dónde | Cadencia |
|---|---|---|
| Refrescar el dato de la web publicada | `deploy.yml` → paso `npm run fetch:plazas` | cada hora (min 35) + en cada push |

- **El refresco NO commitea nada.** `fetch:plazas` corre dentro del build de Pages, así que
  la web publicada lleva el dato fresco y `src/data/plazas.json` en git queda solo como
  *fallback*. El paso va con `continue-on-error: true`: si la API falla, se despliega con la
  instantánea y el build **no** se rompe.
- **No hay avisos automáticos por correo.** Se descartó a propósito: la disponibilidad se
  consulta en la sección `#plazas`, que ya viene fresca. Si algún día se quieren avisos, el
  patrón que funcionaba era un workflow que abre una *issue* con la etiqueta `plazas` (GitHub
  manda el email por su cuenta, sin necesidad de credenciales SMTP). Para vigilancia puntual
  en local está `scripts/goriz-watch/`.
- ⚠ **GitHub desactiva los workflows programados** en repos sin actividad durante 60 días.
  Si la web deja de actualizarse sola, míralo ahí antes que en el código.

## Sección «Refugios» (`#refugios`)

Mapa Leaflet con **todos los refugios guardados y libres** de los cuatro valles del viaje y de
la **vertiente francesa colindante**. Va después de `#plazas`, en tema **claro**, con ancla propia.
Complementa a `#plazas`: aquella dice *cuántas plazas quedan* en los 3 refugios donde dormimos,
esta dice *qué refugios existen* y cuáles sirven de plan B.

- **Datos: `src/data/geo/refugios.js`** — 53 entradas con `tipo` (`guardado` | `libre` | `cerrado`),
  `zona`, `pais`, `alt`, `plazas`, `coords`, `dias`, `planes`, `dormible` y `nota`. Las 4 `ZONAS`
  (Tena, Ordesa, Hecho, Ansó) también viven ahí. **Añadir un refugio = añadir un objeto**; el mapa,
  los contadores, la lista y el `<details>` textual se generan solos.
- **Dos marcas de alcance, independientes (no son una escala):**
  - **`planes: ['3D', …]`** → el refugio cae en el recorrido de esos planes, contando **las 52
    alternativas** de los diez días, no solo las recomendadas. En el mapa sale con **anillo ámbar
    discontinuo** y en la lista con la etiqueta de los planes. Vacío = fuera de ruta. **17 de 53.**
  - **`dormible: true`** → podrías pasar allí la noche sin romper el itinerario: noche prevista,
    recambio declarado de esa noche, o base de valle de esa jornada. **11 de 53.**
  - Son ortogonales a propósito: Alfonso XIII está en ruta y no es cama (está cerrado); el refugio
    forestal de **Zuriza es cama y no está en ruta** (se pasa por delante **en coche**, no en
    ninguna ruta a pie, y `planes` solo admite planes de a pie).
  - ⚠ **No infles `dormible`.** Si se marca todo refugio guardado alcanzable en el día, la marca
    deja de significar nada y no se puede usar para decidir. Ante la duda, `false`.
  - **`check:geo` valida que cada plan citado exista** (día + letra) y avisa si un refugio tiene
    `planes` pero `dias: []`. Al renombrar la letra de un plan, esta marca se entera.
  - El anillo se dibuja como **capa aparte con `interactive={false}`**: si no, se come el clic del
    marcador que tiene debajo y el popup no abre.
- **De dónde salen los datos (7-ago-2026):**
  - **Cabañas libres y refugios franceses → API de [refuges.info](https://www.refuges.info)**
    (CC BY-SA 2.0), endpoint `bbox` en **formato CSV** (`?bbox=…&format=csv&type_points=7,10`).
    ⚠ Pide **CSV, no GeoJSON**: las respuestas JSON no se pueden leer con las herramientas de
    fetch de este entorno, y el bbox entero de golpe supera el límite de tamaño — hay que
    trocearlo en 4-5 rectángulos.
  - **Refugios guardados españoles → FAM (fam.es) y alberguesyrefugios.com.** refuges.info **no**
    tiene Góriz, Lizara, Pineta, Casa de Piedra ni Bujaruelo: hubo que buscarlos aparte.
  - **Lizara y Casa de Piedra** se situaron convirtiendo sus **coordenadas UTM 30T publicadas**
    (`pyproj`, EPSG:32630 → 4326), que es el único dato geográfico que dan sus fichas.
  - **Respomuso, Góriz, Linza, Bujaruelo y Selva de Oza reutilizan las coordenadas del proyecto**
    (`bases.js` / `tracks.js`), no las de terceros. ⚠ refuges.info sitúa el refugio de Linza en
    42.898, −0.799 (1,9 km al sur del valor del proyecto): se mantuvo el nuestro para no
    contradecir al resto de la web, y `check:geo` vigila que ambos ficheros no se separen.
- ⚠ **«Libre» no es «reservado».** Son cabañas abiertas y gratis, sin guarda: en agosto pueden
  estar llenas, sucias o cerradas, y **las plazas son estimaciones de quien las visitó**, no un
  aforo. Este matiz está escrito en la leyenda y en el aviso al pie: **no lo quites.**
- **Los `cerrado`** (Alfonso XIII, cabane d'Arrious) se quedan a propósito, tachados y en gris:
  aparecen en guías y mapas viejos, y conviene que se vea que no sirven.
- **`npm run check:geo` los valida**: bbox, ids duplicados, zona/tipo/país válidos, altitud
  plausible, que los `dias` existan y que Respomuso/Góriz/Linza **coincidan con `bases.js`**
  (tolerancia 200 m).
- **Leaflet en diferido**, igual que `#mapa-viaje` y **compartiendo su chunk**: la sección nueva
  solo añade 3,4 kB (`RefugiosCanvas`). Misma regla de gestos (rueda tras clic, dos dedos en móvil).

## Los dos mapas Leaflet comparten capa base (`components/mapaviaje/tiles.jsx`)

`#mapa-viaje` y `#refugios` usan el MISMO módulo de teselas: `useTiles()` (estado + caída
automática), `<BaseTiles>` y `<TileSwitch>`. Si arreglas un problema de teselas, se arregla en
los dos. **No vuelvas a copiar el objeto `TILES` dentro de un canvas.**

- ⚠ **El contenedor del mapa DEBE crear contexto de apilamiento** (`isolation: isolate` +
  `position: relative` + `z-index: 0` en `.canvas`). Leaflet reparte z-index de **200 a 1000**
  entre sus paneles y controles; la nav fija está en **100**. Sin ese contexto, los z-index de
  Leaflet se comparan con los de la página y **el mapa se dibuja por encima de la nav**. Con él,
  todo lo de Leaflet se apila solo dentro del recuadro. Subir el z-index de la nav sería un
  parche: el `.leaflet-control` está en 1000 y siempre habría otro número mayor.
- ⚠ **OpenTopoMap solo renderiza hasta z17.** La capa declara `maxNativeZoom: 17` y
  `maxZoom: 19`: Leaflet reescala la tesela de z17 (borrosa pero legible) en vez de pedir
  teselas que no existen. Antes, `maxZoom: 17` a secas capaba el zoom y las peticiones fallidas
  pintaban la imagen de error del servidor.
- ⚠ **`errorTileUrl` es una tesela transparente de 1×1.** Cuando OpenTopoMap responde con un
  error (429 por uso excesivo, 404), el navegador pintaba **la imagen de error del propio
  servidor** — de ahí los recuadros rojos que tapaban el mapa a ciertos zooms. Ahora se
  sustituyen por nada y se ve el fondo de papel (`.leaflet-tile { background: var(--nieve) }`).
- ⚠ **Por debajo de `UMBRAL_RELIEVE` (z12) NO se usa OpenTopoMap.** Su sombreado, visto de lejos,
  es un **marrón rojizo** que se come el mapa: se notaba justo en los días de traslado (4, 7 y 8),
  que se alejan para que quepa el trayecto entero. Debajo de z12 se pinta **CARTO Positron**
  (gris claro, casa con la paleta caliza y hace destacar el turquesa y el ámbar); de z12 para
  arriba vuelve el relieve, que es donde sirve de algo (curvas de nivel, sendas).
- **Con el zoom aún sin medir se elige «claro»**: los dos mapas arrancan encuadrando todo el
  Pirineo (z9-10), así que empezar en «topo» provocaba un parpadeo marrón en el primer render.
- **Conmutador «Auto / Relieve / Claro»** en la barra inferior de ambos mapas. `modo` es lo que
  elige la persona y `capa` lo que se pinta; elegir a mano congela la capa y el zoom ya no la
  cambia. Hace falta porque OpenTopoMap sirve teselas malas que **no siempre llegan como fallo
  HTTP**, así que la caída automática (a los 3 errores) no las detecta.
- **`ZoomWatcher` va DENTRO del `<MapContainer>`** (es donde `useMap()` tiene contexto) y recibe
  el `setZoom` de `useTiles` tal cual: una función de estado es estable, así que el efecto no
  entra en bucle. No le pases una lambda.

## Tiempo previsto por plan (meteoblue)

Cada una de las **53 alternativas** tiene su propia previsión: al elegir un plan, el día abre el
bloque **«Tu plan para este día»** (`viaje/PlanElegido.jsx`) con la ficha completa de esa
alternativa y el **widget de meteoblue** en su punto alto.

- **El widget iframe, no la API.** `my.meteoblue.com` pide API key y esa clave no puede viajar en
  un bundle público. El **widget** es gratis, sin clave, sin script de terceros y sin CORS. Coste:
  no se pueden leer los datos, así que no hay chips ni resúmenes propios — se ve la caja y ya.
- **`src/data/geo/meteo.js`** — un punto por plan, **misma convención de clave** que
  `art`/`profile`/`tracks`: plan B del día 5 → `d5b`. Añadir un plan = añadir su clave; ningún
  componente cambia.
- ⚠ **El punto es el MÁS ALTO de la ruta, no el aparcamiento.** En estos planes hay hasta 2.000 m
  entre la salida y la cima: unos 12 °C y otro régimen de viento. Comprobado contra la propia
  meteoblue el 7-ago-2026: Góriz (2.200 m) daba 23/14 °C y Monte Perdido (3.355 m), 14/4 °C, el
  mismo día y a 3 km de distancia.
- **La altitud va en la URL** (`{lat}N{lon}E{alt}_Europe%2FMadrid`) y meteoblue la usa para
  corregir la temperatura. Si no se declara, la saca de su modelo de elevación y sale otra cosa
  (2.250 en vez de 2.200 en Góriz). Por eso `alt` se escribe a mano y `check:geo` la valida.
- **La coordenada da igual afinarla**: el modelo trabaja con malla de 4-30 km (NEMS-4 es el más
  fino de la zona), así que ±1 km no cambia el pronóstico. Lo que importa es la altitud.
- ⚠ **meteoblue solo pronostica 7 días.** No es un ajuste que se pueda subir. Con el viaje a 14-23
  días vista, el bloque **dice cuántos faltan** y avisa de que lo que se ve abajo es el tiempo de
  esta semana en ese punto, **no el del viaje**. Se enlazan además la página de **14 días** y el
  **meteograma multimodelo**, que es lo honesto a esa distancia: enseña cuánto se pelean los
  modelos entre sí en vez de un número que aún no se sostiene.
- **Sin plan elegido** el bloque sale igual con el **plan recomendado** (fila `reco` de la
  comparativa, la misma función `recoPlan` que usa el mapa) y en modo «sugerencia»: borde
  discontinuo y apagado. La web no puede recomendar una cosa en el mapa y otra aquí.
- **El iframe se monta en diferido** (`IntersectionObserver`): solo se renderiza el panel del día
  activo, así que hay como mucho una petición a meteoblue a la vez, y solo si se ve.
- **`src/data/noches.js` → `fechaDia(num)`** es el puente día → fecha ISO (día 1 = 21 ago).
- **`npm run check:geo`** valida los 53 puntos: bbox, que la clave corresponda a un plan real, que
  no falte ninguno, altitud entre 300 y 3.500 m, y que —si el plan tiene track— el punto caiga a
  menos de 3 km del trazado. Además avisa si un plan de cima declara un punto por debajo de 2.000 m
  (síntoma clásico de copiar-pegar el punto del valle).
- **`npm run check:render`** (nuevo) monta `#viaje` en jsdom y comprueba lo que un `vite build` no
  ve: que elegir un plan cambia el día entero, que el iframe aparece y que su URL lleva la altitud
  del punto de ESE plan. Sustituye al arnés que se rehacía a mano en cada iteración.

## La jornada ES la alternativa activa (`Day.jsx`)

**No hay carrusel de tarjetas.** Dentro de cada día hay una **segunda barra de pestañas** (una por
alternativa + «Comparar») y el contenido de abajo es el de la alternativa activa. No es un bloque
que se añade al día: **es** el día.

```
cabecera            número · fecha · zona · título del día · chips   ← lo único invariable
PlanTabs            Plan A … Plan F · Comparar                       ← sticky bajo la barra de días
PlanPanel           descripción, a favor/en contra, cuándo elegirla, botón de elegir
                    foto del plan · perfil · ficha FUSIONADA · meteoblue a lo ancho
DeLaJornada         recomendación, proscons, consejos, material, pueblos
```

- ⚠ **Pestaña ≠ elección.** La pestaña es estado local (`useState` en `Day`): sirve para curiosear.
  Lo que persiste en `TripContext` — y por tanto lo que pintan `#mapa-viaje` y «Tu viaje» — sigue
  siendo el botón **«Elegir este plan»** del panel. Si se fusionan las dos cosas, mirar el plan C
  te cambiaría el itinerario sin querer.
- **La pestaña arranca en el plan elegido; si no hay ninguno, en el recomendado** (fila `reco` de la
  comparativa, misma `recoPlan` que el mapa). Al elegir, la vista salta a ese plan: decidir y mirar
  no pueden acabar en dos sitios distintos.
- **El plan elegido lleva ✓ en su pestaña** aunque estés mirando otra: si no, no habría forma de
  saber cuál habías decidido.
- **La ficha va fusionada a propósito**: arriba las cifras del plan (marcadas con `hi: true`, fondo
  turquesa) y debajo la logística del día — traslado, base, lanzadera, cobertura —, que es la misma
  elijas lo que elijas. Dos tablas separadas obligaban a mirar en dos sitios para responder «¿a qué
  hora salgo?».
- **`DeLaJornada`** recoge lo que sobrevive a la elección y va bajo un rótulo que lo dice
  («De la jornada, elijas lo que elijas»). Si algo de ahí empieza a depender del plan, se mueve al
  panel, no al revés.
- ⚠ **`PlanTabs` se pega bajo `ViajeTabs`**, así que necesita saber cuánto mide la de arriba:
  `Viaje.jsx` la mide con un `ResizeObserver` y publica **`--viaje-tabs-h`** en el bloque. No
  cablees un número: la barra cambia de alto entre móvil y escritorio. Z-index 30 (la de días
  está en 40).
- **Añadir un plan sigue siendo añadir un objeto** a `plans`: pestaña, panel, ficha y previsión se
  generan solos. Se necesitan sus dos SVG (`landscapes/dNx.svg`, `profiles/dNx.svg`), su columna en
  `compare` y su clave en `meteo.js`.

## Changelog

### 2026-08-07 — El día se reescribe con la alternativa: pestañas de plan, adiós al carrusel
- **`PlanCarousel` y `PlanCard` eliminados.** En su lugar, `PlanTabs` (barra de alternativas) +
  `PlanPanel` (la jornada contada desde el plan activo). `PlanElegido`, del cambio anterior, se
  disuelve dentro de `PlanPanel`: ya no es un bloque aparte porque el día entero es el plan.
- **El texto del día pasa a ser el del plan.** `day.desc` ya no se pinta; manda `plan.desc`. Lo que
  no depende de la alternativa (recomendación, consejos, material, pueblos) baja a `DeLaJornada`.
- **Ficha fusionada** (`Datasheet` acepta `hi: true`): cifras de la ruta arriba y destacadas,
  logística del día debajo.
- **Nueva variable `--viaje-tabs-h`**, medida con `ResizeObserver` en `Viaje.jsx`, para que la barra
  de alternativas se pegue justo bajo la de días sin números cableados.
- **Se descartaron tres alternativas de diseño**: sustitución in situ conservando el carrusel,
  tocar solo la columna derecha, y una hoja de ruta cronológica con el tiempo por franja horaria
  (esta última pedía inventar horarios para las 53 alternativas, que hoy no son un dato).
- **Verificado**: `npm run check:render` (18 comprobaciones, incluida «no se cuela el texto de las
  otras alternativas», 0 errores de consola), `npm run check:geo` y `vite build` (271 módulos, el
  CSS baja de 56,0 a 53,2 kB al irse el carrusel).

### 2026-08-07 — Tiempo previsto de cada plan con meteoblue + el día reacciona a la elección
- **Nuevo bloque «Tu plan para este día»** dentro de cada jornada: al pulsar «Elegir este plan» el
  día entero cambia (chip en la cabecera, foto de portada del plan) y se despliega la ficha
  completa de esa alternativa con **la previsión de meteoblue en su punto alto**.
- **`src/data/geo/meteo.js`**: 53 puntos, uno por alternativa, con nombre, coordenada, **altitud** y
  tipo. Clave `dNx`, la de siempre. Los 13 planes con track reutilizan su coordenada.
- **Widget iframe, no API**: la API de meteoblue pide clave y no puede ir en un bundle público. Se
  comprobó contra su servidor que el widget acepta `{lat}N{lon}E{alt}_Europe%2FMadrid` sin login y
  que **la altitud declarada cambia el parte** (Góriz 2.200 → 23/14 °C; Monte Perdido 3.355 → 14/4).
- ⚠ **Horizonte de 7 días**: el viaje está a 14-23 días, así que hoy el widget **no** enseña los
  días del viaje. En vez de disimularlo, el bloque cuenta los días que faltan y enlaza los 14 días
  y el meteograma multimodelo.
- **`check:geo` amplía cobertura** a los puntos meteo (cobertura de los 53, bbox, altitud creíble,
  distancia al track del propio plan, aviso si un plan de cima apunta al valle).
- **Nuevo `npm run check:render`**: render headless de `#viaje` en jsdom, con el arnés ya
  committeado en vez de rehecho a mano. 12 comprobaciones, 0 errores de consola.
- **Verificado**: `npm run check:geo` (13 tracks, 6 tramos, 53 refugios, 53/53 puntos meteo, sin
  errores), `npm run check:render` (todo en verde) y `vite build` (273 módulos).

### 2026-08-07 — Capa base por zoom: se acabó el marrón rojizo al alejar
- **Síntoma**: en los días 4, 7 y 8 (los de traslado, que encuadran todo el trayecto) el mapa
  salía de un marrón rojizo ilegible. **No era un error de teselas**: es el sombreado de relieve
  de OpenTopoMap visto de lejos.
- **Arreglo**: capa base según el zoom. Debajo de **z12** (`UMBRAL_RELIEVE`) se pinta **CARTO
  Positron** (gris claro); de z12 para arriba, OpenTopoMap. El conmutador pasa de dos botones a
  **«Auto / Relieve / Claro»**; elegir a mano congela la capa.
- **Nuevo `ZoomWatcher`** en `tiles.jsx` y `useTiles` devuelve ahora `{ modo, setModo, capa,
  setZoom, onTileError }`. Con el zoom sin medir se arranca en «claro» para no parpadear.
- **Verificado**: tabla de decisión de `capa` probada con los 8 casos (zoom 9/11/12/14/null,
  errores, y los dos modos manuales) y `npm run build` (270 módulos).

### 2026-08-07 — Mapas: z-index sobre la nav y teselas rotas de OpenTopoMap
- **El mapa tapaba la barra de navegación.** Causa: Leaflet usa z-index de 200 a 1000 y la nav
  está en 100, sin ningún contexto de apilamiento que los separase. Arreglado con
  `isolation: isolate; z-index: 0` en `.canvas` de las dos secciones (no subiendo el de la nav).
- **Teselas rojas a ciertos zooms.** Eran las imágenes de error de OpenTopoMap. Ahora la capa
  declara `errorTileUrl` (tesela transparente) y `maxNativeZoom: 17` para reescalar en vez de
  pedir teselas inexistentes por encima de z17.
- **Nuevo `components/mapaviaje/tiles.jsx`** con `useTiles` / `<BaseTiles>` / `<TileSwitch>`:
  la config de teselas estaba **duplicada** en `MapCanvas` y `RefugiosCanvas` y ya había
  divergido. Añade conmutador manual «Relieve / Mapa» en ambos mapas.
- **Verificado**: `npm run build` (270 módulos), `check:geo` sin errores y comprobado sobre el
  CSS compilado que Leaflet llega a z-index 1000 frente a los 100 de la nav — que es justo lo
  que el contexto de apilamiento neutraliza.

### 2026-08-07 — Sección «Refugios» (`#refugios`): guardados y libres de los cuatro valles
- **Nueva sección clara tras `#plazas`**, con ancla en la nav: mapa Leaflet con **53 refugios**
  (23 guardados, 28 libres, 2 fuera de servicio) de Tena, Ordesa, Hecho y Ansó **más la
  vertiente francesa** colindante (Marcadau, Ossau, Gavarnie, Vignemale, Ansabère, Arlet).
- **Filtros**: chip por valle + interruptores «Guardados» / «Libres» / «Solo España» / «Solo los
  que pillan de camino», contadores en vivo (en ruta / sirven de cama / fuera de alcance), lista
  lateral enfocable, leyenda y `<details>` con la lista completa valle por valle (el mapa no puede
  ser la única fuente).
- **Marcas de alcance** `planes` + `dormible` cruzando los 53 refugios con **las 52 alternativas**
  de los diez días: 17 caen en alguna ruta, 11 sirven de cama, 35 quedan fuera. Se curaron a mano
  a partir de los planes reales; **la proximidad geométrica a los tracks NO sirve** para esto (son
  bocetos interpolados y solo existen 13 de 52, así que dejaba fuera cosas como Casa de Piedra —
  final del plan 3D — y metía cabañas que solo están cerca en línea recta).
- **`src/data/geo/refugios.js`** nuevo, con las fuentes y su precisión documentadas en cabecera.
- **`check:geo` amplía cobertura** a los refugios y, sobre todo, comprueba que los tres donde se
  duerme no se separen de `bases.js`.
- **Verificado**: `npm run check:geo` (13 tracks, 6 tramos, 53 refugios, sin errores),
  `npm run build` (269 módulos) y render SSR headless — los 53 refugios pintados, contadores
  23/28/2 y las 4 zonas en la lista textual.
- ⚠ **`npm run build` falla en este entorno al vaciar `dist/`** (EPERM sobre la carpeta montada),
  no por el código: se comprobó con `npx vite build --outDir /tmp/dist-check`.

### 2026-08-04 — Disponibilidad real de refugios en la web (`#plazas`) + vigía por email
- **Encontrada la API que alimenta el calendario oficial.** El widget de reservas de
  alberguesyrefugios.com es una app Vue cuyo calendario (hotel-datepicker) codifica el estado
  de cada día en **color**, no en clases CSS. Tras varios intentos fallidos de leerlo por
  scraping, se capturó el tráfico del propio widget y apareció
  `api.alberguesyrefugios.com/refugios/get/<id>/getPlazas2/`, que da los números exactos.
  **`plazas` = `plazasDisponibles − plazasUsadas`**; el campo `estado` es engañoso y se ignora.
- **Nueva sección `#plazas`** (clara, tras `#mapa-viaje`): una tarjeta por refugio con la tira
  del 21 al 30 de agosto, número de huecos por día, las noches del viaje resaltadas y leyenda
  de cuatro estados. Instantánea en `src/data/plazas.json` + refresco en vivo con *fallback*
  si CORS lo bloquea.
- **Chip por día** en las jornadas 2 (Respomuso), 5 (Góriz), 8 y 9 (Linza), enlazado a la
  sección. Nuevo `src/data/noches.js` como puente día → refugio + fecha.
- **`npm run fetch:plazas`** (`scripts/fetch-plazas.mjs`) regenera la instantánea.
- **`scripts/goriz-watch/`**: vigía que consulta la misma API cada 20 min y avisa por email
  (Mail.app o SMTP con contraseña de aplicación en variable de entorno) + notificación de
  macOS. No repite avisos ya enviados y **nunca** avanza el asistente de reserva, porque el
  sistema bloquea las plazas solicitadas hasta que se paga el anticipo.
- **Dato del día en que se escribió esto:** Góriz tenía **4 plazas para la noche del 25**
  (81 ocupadas de 85), justo las del grupo. El 21, 23 y 29 estaban a cero.
- **Verificado:** `npm run build` (265 módulos) y render SSR headless — sección presente con
  las 3 tarjetas, chip correcto en los días 2/5/8/9 y ausente en el resto, sin errores.

### 2026-08-03 — Anayet cierra al vivac: el arranque se muda a Respomuso (días 2 y 3)
- **Causa:** la **ORDEN MAT/221/2026** (BOA nº 32, 17-feb-2026) prohíbe el **baño todo el año** y la
  **acampada del 21 jun al 21 sep** en el Humedal Singular «Ibones del Anayet» y su zona periférica.
  El día 2 se apoyaba justo en eso (vivac arriba + baño en los ibones), así que se rehízo.
- **Día 2 → «Subida a Respomuso»**: La Sarra (1.440 m) → GR-11 por el Aguas Limpias (Paso del Onso,
  Llano Cheto) → **refugio de Respomuso, 2.220 m** (8 km, 780 m+, 3 h 15). Plan A refugio (reserva
  obligatoria, 974 33 75 56) y **plan B vivac legal** en la parte alta del circo, con el trámite del
  Decreto 61/2006. Planes C–F: Anayet ida y vuelta (sin baño), refugio de Bachimaña como recambio si
  Respomuso está lleno, Espelunciecha y Foratata.
- **Día 3 → «Gran Facha, el primer tresmil»**: se sale del refugio a las 6:30, cima de **3.005 m**
  por Campoplano y el collado de la Facha, vuelta al refugio y bajada a La Sarra (17 km, 1.000 m+,
  ~1.800 m−, 8–9 h). Alternativas: Llena Cantal (suave), Balaitús (alpino, PD), travesía GR-11 a
  Baños de Panticosa (requiere resolver el coche), Pico Anayet y Pic de Peyreget para quien duerma
  abajo. **La 3ª noche sigue siendo en Sallent y el día 4 (descanso) queda intacto.**
- **Geo:** nuevos tracks `d2a` (La Sarra→refugio), `d2b` (vivac) y `d3a` (Gran Facha, incluye la
  bajada, por eso es `kind: 'ida'`); los de Anayet se renombraron a `d2c` y `d3e` al cambiar de
  letra. Nueva base `respomuso` en `bases.js` con `days: [2, 3]`, como ya se hacía con Góriz.
- **SVG:** nuevos paisajes y perfiles `d2a`, `d2b`, `d3a`–`d3d`; los de Anayet, Bachimaña,
  Espelunciecha y Peyreget se movieron a su nueva letra en vez de redibujarlos.
- **Referencias cruzadas:** timeline, top de rutas (Gran Facha entra al nº 3, el circo de Respomuso
  al nº 5), material (saco-sábana vs. saco de vivac), hero, footer, `mapa.js` y el día 4.
- **Verificado:** `npm run check:geo` (13 tracks, 7 bases, 920 km, sin errores) y `npm run build`.

### 2026-07-31 — Kilómetros reales (850 → 920) y días 7–9 sin llegada nocturna
- **Los km de coche estaban mal.** Se pidieron a OSRM y el bucle son **920 km, no 850**. El error
  gordo era `teruel-sallent`: publicaba 290 km cuando son **330** (solo Teruel–Zaragoza son 183).
  Corregidos los seis tramos: 330 / 45 / 121 / 50 / 374 (+ la excursión a Aínsa, 45). Actualizados
  `tramos.js`, `mapa.js`, `Hero.jsx`, `Map.jsx` y los `datasheet` de los días 1, 4, 7, 8, 9 y 10.
- **Los tiempos también.** En los cuatro tramos de montaña se publica **OSRM + 15-20 min** (el
  router calcula circulación libre y esto es agosto); en los dos largos de autovía, OSRM tal cual.
  Cada tramo lleva anotado en comentario el dato crudo del router para poder revisar el criterio.
- **`build:tramos` tenía un fallo silencioso:** si fallaban todas las peticiones escribía
  `export const generado = []` y salía con código 0. Ahora no escribe si no hay nada, marca
  `⚠ PARCIAL` en la cabecera si falta algún tramo, sale con código 1 ante cualquier fallo y
  reintenta una vez (el OSRM público devuelve 429 con facilidad).
- **Y hacía mal la medición:** enviaba los waypoints dibujados a mano como puntos de paso, así que
  OSRM rectificaba dando marcha atrás e inflaba las distancias hasta un +85 %. Ahora hace **dos
  peticiones**: una limpia origen→destino para los km/tiempo y otra con waypoints solo para la
  geometría. Imprime tabla comparativa y avisa si la geometría se desvía >15 % de la directa.
- **Días 7–9 reestructurados.** El día 7 encadenaba atardecer en Aínsa (~21:00) + **166 km / 2 h 35**
  hasta la Selva de Oza: llegada a medianoche a un camping de fondo de valle. Ahora: **4ª noche en
  Torla** (sin traslado), el día 8 sale temprano hacia Oza (2 h 15), hace Aguas Tuertas y sigue a
  **Linza (1 h 50), donde se duerme las noches 8 y 9**. Se gana la salida de madrugada para la Mesa
  de los Tres Reyes desde la propia base, y se pierde un cambio de alojamiento. Coste: el día 8
  suma 4 h de coche, pero es jornada de enlace con ruta llana.
- **Selva de Oza deja de ser base de noche**; sigue en `bases.js` con `days: [8]` a propósito
  (los `hitos` llevan `days: []` y no se enfocarían al filtrar por día).
- **El orden de valles NO era el problema.** Se comprobaron los 24 órdenes posibles con un grafo de
  carreteras: **8 empatan en el óptimo** y el actual es uno de ellos. Lo que cuenta es agrupar las
  parejas vecinas; romper una cuesta entre +48 y +151 km.
- **Verificado:** `npm run check:geo` (920 km, sin errores) y `npm run build`.
- **`build:tramos` reescrito para arreglar la geometría.** Ahora hace **una** petición por tramo
  (sin puntos de paso) y valida el corredor con el nuevo campo `control` de `tramos.js`, en vez de
  forzarlo con los waypoints a mano. Probado con OSRM simulado: corredor bueno → exit 0; corredor
  equivocado → los 6 tramos avisan y exit 1; fallo parcial → `⚠ PARCIAL` y exit 1; sin red → no
  escribe y exit 1.
- **Geometría real ya aplicada.** Ejecutado `build:tramos` con red: los seis `path` de `tramos.js`
  son ahora los de OSRM (600 puntos en total, simplificados a 150 m). Se eliminaron los segmentos
  compartidos (`TERUEL_ZARAGOZA`, `BIESCAS_TORLA`…) y `rev()`, que ya no hacían falta.
- **Tres puntos de control estaban mal puestos**, no las rutas: se corrigieron tras comprobar
  que los corredores eran correctos (la A-23 pasa por Cariñena/Zuera/Almudévar; Cotefablo por
  Yésero y Linás de Broto). Y se descubrió que el regreso baja por el valle de Hecho, no por
  Berdún. La validación de controles se llevó también a `check:geo`, para que corra sin red.

### 2026-07 — Sección «Mapa de tu viaje»: mapa Leaflet con rutas y trayectos (H0–H5 del plan)
- **Nueva sección `#mapa-viaje`** (clara, tras el bloque `#viaje`, con ancla propia en la nav):
  mapa real con **OpenTopoMap** (relieve) y *fallback* a OSM, que dibuja las **rutas elegidas**,
  las **sugeridas en fantasma**, los **6 trayectos en coche** y las **6 bases**.
- **Datos nuevos en `src/data/geo/`**: `bases.js` (6 bases + 10 hitos), `tramos.js` (6 tramos,
  850 km — los mismos km que ya publicaba `mapa.js`) y `tracks.js` (**10 tracks**, el plan
  recomendado de cada jornada). Los tracks se resuelven **por convención** `dNx`, sin tocar los
  datos de los días; los 42 planes restantes degradan sin error y se avisa en el panel.
- **Reactivo a `TripContext`**: chips D01–D10 + «Todo el viaje» con `fitBounds`, popup en cada
  ruta con distancia/desnivel/tiempo y salto al día vía `goToView`, contador de km a pie y en
  coche, leyenda, estado vacío y alternativa textual accesible.
- **Rendimiento**: Leaflet en chunk aparte (~160 kB) cargado con `React.lazy` +
  `IntersectionObserver`; el bundle inicial no crece. Zoom con rueda solo tras clic; en móvil,
  arrastre a dos dedos.
- **Verificado**: `npm run build` (256 módulos) y render headless con jsdom sin errores de
  consola (39 capas dibujadas, avisos y contadores correctos). Coordenadas de cimas,
  aparcamientos y refugios contrastadas una a una; nuevo `npm run check:geo` que valida bbox,
  coherencia día/plan y que ningún trazado salga más largo que la distancia publicada.
- **Pendiente (H3 completo)**: tracks de los 42 planes no recomendados y geometría OSRM real de
  las carreteras (`npm run build:tramos`, listo para ejecutar con red).

### 2026-07 — Migración a React + Vite (modularización por componentes y datos)
- **De web estática a React 18 + Vite (JSX) con CSS Modules.** El original se conserva en `legacy/`.
- **Contenido extraído a datos:** cada día → `src/data/dias/dia-N.js` (día 1 inline en `dias.js`);
  cada día y plan es un objeto. Componentes genéricos (`Day`, `PlanCard`, `Datasheet`,
  `CompareTable`, `Nearby`, `TripSummary`) los renderizan. Editar un plan = editar datos, no HTML.
- **SVG:** los ~934 iconos 24×24 → un `<Icon name>` (registro de ~27 formas en `paths.jsx`); los 62
  paisajes y 52 perfiles → ficheros `.svg` importados con `vite-plugin-svgr` (`?react`) vía
  `import.meta.glob`. Los perfiles siguen inline para heredar `var(--ibon)` del tema.
- **Estilos:** compartidos en `styles/tokens.css` + `global.css`; un `.module.css` por componente.
  El tema oscuro se logra redefiniendo tokens en `.viaje` (Viaje.module.css): al heredarse por
  cascada, los hijos pasan a oscuro. Se promovieron a tokens algunos colores antes hardcodeados.
- **Comportamiento 1:1:** pestañas (`ViajeNavContext`, con scroll + centrado de la tab activa) y
  selección de plan (`useTripSelection`/`TripContext`) con la MISMA clave `pirineos2026-seleccion`.
  Bloques `proscons` (días 2 y 5) y `decide` (día 6) soportados en `Day`. Id duplicado `top` del
  original renombrado a `#top-rutas`. Negritas de texto vía `<RichText>` (`dangerouslySetInnerHTML`).
- **Verificado:** `npm run build` (202 módulos) y render headless sin errores de consola; 52 planes,
  comparativas coherentes. Arranque: `npm run dev`.

### 2026-07 — Reestructura a 10 días + navegación por pestañas (oscuro inmersivo)
- **De 8 a 10 días.** Fechas reales **vie 21 – dom 30 ago 2026** (se vuelve el domingo 30). Se
  insertan **dos días de descanso escénico**: **Día 4** (Valle de Tena — Lanuza, Panticosa,
  atardecer + traslado a Torla) y **Día 7** (Sobrarbe — **Aínsa + Bujaruelo**, atardecer en las
  murallas + traslado a Oza). Los días de montaña se renumeran (antiguo 4→5, 5→6, 6→8, 7→9, 8→10)
  y el Día 3 deja de incluir el traslado (ahora se duerme la 3ª noche en Sallent).
- **Solo el itinerario pasa a pestañas.** El resto de la web sigue **clara y con scroll** (diseño
  original). Los días + "Tu viaje" se envuelven en un **único bloque `#viaje`** (tema **oscuro**,
  scopeado a `.viaje`) con barra de pestañas (D01–D10 + Tu viaje); solo se ve el panel activo, a
  altura natural. La página scrollea con normalidad.
  - *(Nota: una iteración intermedia convirtió TODA la web a oscuro sin scroll; se revirtió a este
    híbrido claro + bloque de viaje oscuro.)*
- JS: `showView(view, scrollTo)` para las pestañas del bloque + `[data-goto]` (nav, timeline,
  hero). Se conserva intacta la selección de planes en `localStorage` (`pirineos2026-seleccion`).
- Referencias cruzadas de nº de día actualizadas (mapa, itinerario a 10 ítems, top rutas,
  material, `DAY_TITLES`, "de 10 días").

### 2026-07 — Enriquecimiento de alternativas y pueblos
- **Picos/dosmiles nuevos** como alternativas montañísticas por día (datos verificados):
  Peña Foratata (2.340 m, técnica) en el bloque de Tena, Punta Acuta (2.242 m) en Ordesa,
  Bisaurín (2.670 m) en Hecho y Peña Ezcaurri (2.045 m) en Ansó.
- **Nuevo bloque "Pueblos y paradas cerca"** (`.nearby`/`.town`) al final de cada día, con
  pueblos bonitos y paradas (p. ej. Panticosa/Lanuza, Aínsa, Siresa/Hecho, Ansó, Albarracín),
  tiempo de coche y tiempo de visita, pensados para tardes, lluvia o descanso.
- Matices de **agosto** incorporados (masificación, lanzadera de Ordesa, baño en ibones).
