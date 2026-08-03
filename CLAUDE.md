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
    │   ├── viaje/{Viaje,ViajeTabs,Day,Datasheet,PlanCarousel,PlanCard,CompareTable,Nearby,TripSummary}
    │   └── mapaviaje/{MapaViaje,MapCanvas,MapLayers,MapLegend}.jsx + deriveLayers.js
    ├── hooks/{useTripSelection,useMapBounds}.js
    └── context/{ViajeNavContext,TripContext}.jsx
```

**El contenido SÍ está separado en datos** (`src/data/`): cada día y cada plan es un objeto JS;
componentes genéricos (`Day`, `PlanCard`…) los renderizan. Las ilustraciones se referencian por
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
| Top rutas | `#top` | claro | Ranking de rutas destacadas |
| Material | `#material` | claro | Equipo recomendado |
| Footer | `.footer` | claro | Cierre (fuera de `#viaje`) |
| Script | — | — | JS de **pestañas de `#viaje`** + **selección de planes** |

### Anatomía de un día (`<section class="day" id="dia-N">`)

1. `.day__head` — número, `.eyebrow` (zona) y `<h3>` (título).
2. `.day__grid`:
   - `.day__content` — `.day__desc` (párrafos), `.callout` ("Mi recomendación"),
     `.chips` de "Consejos" y "Material recomendado".
   - `.day__photo-wrap` — foto SVG (`.dayphoto`) + `.datasheet` (ficha clave/valor).
3. `.plans-head` + `.carousel` — tarjetas `<article class="plan">` (alternativas A, B, C…).
4. `.compare-wrap` — tabla comparativa de las alternativas.
5. `.nearby` — **bloque "Pueblos y paradas cerca"** (añadido en esta iteración).

### Anatomía de un plan (`<article class="plan">`)

`.plan__img` (SVG) · `.plan__badge {a|b|c|d|e|f|g}` · `.plan__rate` · `.plan__type` ·
`.plan__name` · `.plan__desc` · `.profile` (perfil de altimetría) ·
`.plan__stats` (Distancia / Desnivel / Tiempo / Tipo) · `.plan__pc` (A favor / En contra) ·
`.plan__when` ("Cuándo elegirla") · `button.plan__pick`.

El botón lleva `data-day="N"`, `data-plan="X"` y `data-name="…"`: son el gancho del selector.

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

## Changelog

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
