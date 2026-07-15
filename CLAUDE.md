# CLAUDE.md — Guía del proyecto "Pirineos 2026"

Documento vivo para entender el proyecto y registrar el trabajo. Léelo antes de editar.

## Qué es

Web estática de una sola página que planifica un **viaje de montaña por el Pirineo Aragonés**.
Es una **guía de ruta** (estilo ficha de montaña) con itinerario día a día, alternativas por
jornada y un selector para "montar tu viaje".

- **Stack:** HTML5 + CSS3, **sin framework, sin build, sin dependencias**. Un único bloque de
  JavaScript vanilla (IIFE) al final de `index.html`.
- **Sin imágenes externas:** todas las ilustraciones (montañas, perfiles de altimetría, iconos)
  son **SVG inline** escritos a mano.

## El viaje real

- **Fechas:** 21–30 de **agosto de 2026** (10 días de calendario).
- **Salida:** desde **Alicante**; se recoge a un amigo en **Teruel** de camino.
- **Núcleo:** **8 días de montaña** (lo que documenta la web) + los trayectos Alicante↔Teruel
  como contexto (no son secciones propias).
- **Enfoque:** montañístico. Las paradas de pueblos son secundarias (para tardes, lluvia o
  días de piernas cansadas).
- **Campamentos base:**
  - Días 1–3: **Sallent de Gállego** (Valle de Tena)
  - Días 4–5: **Torla / Ordesa**
  - Día 6: **Selva de Oza** (Valle de Hecho)
  - Día 7: **Linza / Zuriza** (Valle de Ansó)
  - Día 8: **Regreso a Teruel** (patrimonio)
- **Nota agosto:** masificación alta y calor (madrugar); ibones templados, buenos para baño;
  poca nieve en los tresmiles. **Ordesa (días 4–5): lanzadera obligatoria desde Torla**
  (aprox. 6:00–19:00, cada 15–20 min); el coche particular no accede a la Pradera.

## Ficheros

```
viaje/
├── index.html   ← todo el contenido y los datos (escritos a mano en el markup)
├── styles.css   ← sistema de diseño y componentes
└── CLAUDE.md    ← este documento
```

No hay JSON ni módulo de datos: **cada día y cada plan es HTML literal**. No hay plantillas ni
bucles de render (salvo el resumen de "Tu viaje", que se genera por JS).

## Estructura de `index.html`

| Sección | id | Contenido |
|---|---|---|
| Hero | `#hero` | Portada y stats generales |
| Mapa | `#mapa` | Bucle de coche (~850 km) con tiempos entre etapas |
| Itinerario | `#itinerario` | Timeline de 8 `.tl-item` |
| Días | `#dia-1` … `#dia-8` | El grueso (ver anatomía abajo) |
| Tu viaje | `#tu-viaje` | Resumen de la selección (lo rellena el JS en `#trip-summary`) |
| Top rutas | `#top` | Ranking de rutas destacadas |
| Material | `#material` | Equipo recomendado |
| Script | — | JS de selección de planes |

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

## Convenciones para editar

- **Añadir un plan/pico nuevo a un día:** duplicar un `<article class="plan">` dentro del
  `.carousel` de ese día, usar la siguiente letra libre (F, G…) en `.plan__badge` y en
  `data-plan`, rellenar todos los sub-bloques, actualizar el rótulo `.plans-head h4`
  ("Cinco planes…" → "Seis planes…") y añadir la columna correspondiente a la tabla comparativa.
- **Añadir un pueblo/parada:** usar el componente `.nearby` / `.town` (ver `styles.css`).
- **Colores/tipografía:** tokens en `:root` de `styles.css` (paleta caliza + turquesa de ibón,
  Inter/Inter Tight + JetBrains Mono). Reutilizar tokens, no hardcodear colores.
- **Accesibilidad:** mantener `role`/`aria-label` en SVG e iconos y `aria-pressed` en los
  botones de selección, como en el resto del documento.
- **Datos:** verificar altitudes, desniveles, tiempos y distancias de coche antes de publicarlos.

## Changelog

### 2026-07 — Enriquecimiento de alternativas y pueblos
- **Picos/dosmiles nuevos** como alternativas montañísticas por día (datos verificados):
  Peña Foratata (2.340 m, técnica) en el bloque de Tena, Punta Acuta (2.242 m) en Ordesa,
  Bisaurín (2.670 m) en Hecho y Peña Ezcaurri (2.045 m) en Ansó.
- **Nuevo bloque "Pueblos y paradas cerca"** (`.nearby`/`.town`) al final de cada día, con
  pueblos bonitos y paradas (p. ej. Panticosa/Lanuza, Aínsa, Siresa/Hecho, Ansó, Albarracín),
  tiempo de coche y tiempo de visita, pensados para tardes, lluvia o descanso.
- Matices de **agosto** incorporados (masificación, lanzadera de Ordesa, baño en ibones).
