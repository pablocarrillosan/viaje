/* Resuelve las ilustraciones por CLAVE contra los ficheros .svg importados como
   componentes React (svgr ?react → inline en el DOM). El glob evita listar 60+
   imports a mano y mantiene los datos (dias.js) libres de rutas y de markup SVG.
   Los perfiles van inline (no <img>) para heredar var(--ibon) del tema. */
const landscapes = import.meta.glob('../assets/svg/landscapes/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
})
const profiles = import.meta.glob('../assets/svg/profiles/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
})

export function Landscape({ art, className }) {
  const Comp = landscapes[`../assets/svg/landscapes/${art}.svg`]
  if (!Comp) return null
  return <Comp className={className} preserveAspectRatio="xMidYMid slice" role="img" />
}

export function Profile({ profile, className }) {
  const Comp = profiles[`../assets/svg/profiles/${profile}.svg`]
  if (!Comp) return null
  return <Comp className={className} preserveAspectRatio="none" />
}
