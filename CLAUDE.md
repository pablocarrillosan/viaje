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
- **Campamentos base (10 días):**
  - Días 1–3: **Sallent de Gállego** (Valle de Tena) — Anayet
  - **Día 4: descanso Valle de Tena** (Lanuza, Panticosa, atardecer) + traslado a Torla
  - Días 5–6: **Torla / Ordesa** (Cola de Caballo/Soaso, Monte Perdido)
  - **Día 7: descanso Sobrarbe** (Aínsa medieval + Bujaruelo, atardecer murallas) + traslado a Oza
  - Día 8: **Selva de Oza** (Valle de Hecho) — Aguas Tuertas
  - Día 9: **Linza / Zuriza** (Valle de Ansó) — Mesa de los Tres Reyes
  - Día 10: **Regreso a Teruel** (patrimonio) y a Alicante
- **Nota agosto:** masificación alta y calor (madrugar); ibones templados, buenos para baño;
  poca nieve en los tresmiles. **Ordesa (días 4–5): lanzadera obligatoria desde Torla**
  (aprox. 6:00–19:00, cada 15–20 min); el coche particular no accede a la Pradera.

## Ficheros

```
viaje/
├── index.html            ← entry de Vite (<div id="root"> + <script src=/src/main.jsx>)
├── vite.config.js        ← plugin react + vite-plugin-svgr (SVGO conserva var(--ibon))
├── package.json
├── legacy/               ← web estática ORIGINAL (index.html + styles.css) como referencia
├── CLAUDE.md             ← este documento
└── src/
    ├── main.jsx · App.jsx
    ├── styles/{tokens.css, global.css}          ← estilos COMPARTIDOS (tokens + reset + atómicas)
    ├── data/
    │   ├── dias.js        ← día 1 inline + importa dias/dia-2…10; DAY_TITLES, TOTAL_DIAS
    │   ├── dias/dia-N.js  ← un fichero de datos POR DÍA (export default)
    │   └── {mapa,top,material}.js
    ├── assets/svg/{landscapes,profiles}/*.svg   ← paisajes (62) y perfiles (52) como ficheros
    ├── components/        ← un .jsx + un .module.css por componente
    │   ├── icons/{Icon.jsx, paths.jsx}          ← <Icon name> (~27 formas; colapsa ~934 SVG)
    │   ├── SvgArt.jsx     ← Landscape/Profile (resuelve .svg por clave con import.meta.glob)
    │   ├── ui/{Rating, RichText}.jsx
    │   ├── layout/{Nav,Hero,Footer} · Map · Timeline · Top · Material
    │   └── viaje/{Viaje,ViajeTabs,Day,Datasheet,PlanCarousel,PlanCard,CompareTable,Nearby,TripSummary}
    ├── hooks/useTripSelection.js
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
| Mapa | `#mapa` | claro | Bucle de coche (~850 km) con tiempos entre etapas |
| Itinerario | `#itinerario` | claro | Timeline de 10 `.tl-item` (cada uno con `data-goto` a su día del bloque) |
| **Viaje** | `#viaje` | **oscuro** | **Bloque con pestañas**: `.viaje__tabs` (D01–D10 + Tu viaje) + paneles `dia-1`…`dia-10` (anatomía abajo) + panel `tu-viaje` (resumen, `#trip-summary`) |
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
- **Colores/tipografía:** tokens en `:root` de `styles.css` (paleta caliza + turquesa de ibón,
  Inter/Inter Tight + JetBrains Mono). Reutilizar tokens, no hardcodear colores.
- **Accesibilidad:** mantener `role`/`aria-label` en SVG e iconos y `aria-pressed` en los
  botones de selección, como en el resto del documento.
- **Datos:** verificar altitudes, desniveles, tiempos y distancias de coche antes de publicarlos.

## Changelog

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
