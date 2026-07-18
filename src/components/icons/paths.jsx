/* Registro de iconos de línea (viewBox 0 0 24 24). Solo el interior del <svg>;
   los atributos comunes (stroke, width, linecap…) los aporta <Icon>. Cada clave
   se referencia desde los datos por su nombre (icon:"car"). */
export const ICON_PATHS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  dblArrow: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16" />,
  car: (
    <>
      <path d="M5 11l1.5-4a2 2 0 0 1 1.9-1.3h7.2a2 2 0 0 1 1.9 1.3L20 11M4 11h16v5H4zM5 16v2M19 16v2" />
      <circle cx="7.5" cy="13.5" r="1" />
      <circle cx="16.5" cy="13.5" r="1" />
    </>
  ),
  bed: <path d="M3 18V7M3 12h13a4 4 0 0 1 4 4v2M20 16v2M3 18h18M6.5 9.5h3a1.5 1.5 0 0 1 1.5 1.5v1H5v-1a1.5 1.5 0 0 1 1.5-1.5z" />,
  flame: <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-1.5 1-2 .8 1 2 2.5 2 5a5 5 0 0 1-10 0c0-4 4-6 5-10z" />,
  landscape: (
    <>
      <path d="M3 20l6-11 4 6 2-3 6 8z" />
      <path d="M9 9l1.4 2.4" />
    </>
  ),
  waves: (
    <>
      <path d="M3 8c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0" />
      <path d="M3 13c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0" />
      <path d="M3 18c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0" />
    </>
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 17V8h3.5a2.5 2.5 0 0 1 0 5H9" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15l4-4" />
      <circle cx="12" cy="15" r="1" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6M17 20a6 6 0 0 0-3-5.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z" />,
  signal: <path d="M4 20v-3M9 20v-6M14 20v-9M19 20V6" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.2" />
      <path d="M9 7l1.5-2h3L15 7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  star: <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8z" />,
  check: <path d="M4 12l5 5L20 6" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  ruler: (
    <>
      <path d="M4 16L16 4l4 4L8 20z" />
      <path d="M9 9l1.4 1.4M12 6l1.4 1.4M6 12l1.4 1.4" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 19h6a3 3 0 0 0 3-3V8" />
    </>
  ),
  backpack: (
    <>
      <path d="M7 8a5 5 0 0 1 10 0v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M9 13h6M10 20v-3h4v3" />
    </>
  ),
  layers: <path d="M8 4L4 7l2 3 2-1v8h8v-8l2 1 2-3-4-3-2.2 2H10z" />,
  tent: <path d="M12 4L3 20h18zM12 4v16M12 20l4-6" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
}
