/* Renderiza texto con marcado ligero (<strong>, <em>…) proveniente de los datos.
   El contenido es propio (no input de usuario), por lo que dangerouslySetInnerHTML
   es seguro aquí y evita fragmentar cada frase en el modelo de datos. */
export default function RichText({ html, as: Tag = 'span', className }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
