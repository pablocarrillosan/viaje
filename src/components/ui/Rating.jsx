/* Puntos de valoración (reutiliza las clases globales .rating/.dot/.dot.on). */
export default function Rating({ value, max = 5 }) {
  return (
    <span className="rating" role="img" aria-label={`${value} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'dot on' : 'dot'} />
      ))}
    </span>
  )
}
