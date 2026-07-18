import { ICON_PATHS } from './paths.jsx'

/* Icono de línea reutilizable. `name` resuelve contra ICON_PATHS.
   Si se pasa `title`, el SVG es accesible (role=img); si no, decorativo. */
export default function Icon({ name, className, title, size }) {
  const shape = ICON_PATHS[name]
  if (!shape) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {shape}
    </svg>
  )
}
