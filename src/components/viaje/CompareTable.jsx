import Icon from '../icons/Icon.jsx'
import Rating from '../ui/Rating.jsx'
import styles from './CompareTable.module.css'

function Cell({ row, value }) {
  if (row.type === 'rating') return <Rating value={value} />
  if (row.type === 'bool') {
    return (
      <>
        <span className={value.ok ? 'tick' : 'cross'}>
          <Icon name={value.ok ? 'check' : 'cross'} />
        </span>{' '}
        {value.text}
      </>
    )
  }
  if (row.type === 'reco') {
    return value ? (
      <>
        <span className="tick">✓</span> {value}
      </>
    ) : (
      '—'
    )
  }
  return value
}

export default function CompareTable({ compare }) {
  return (
    <div className={`${styles.wrap} reveal`}>
      <table className={styles.table}>
        <caption className={`${styles.caption} mini-h`}>{compare.caption}</caption>
        <thead>
          <tr>
            <th>Criterio</th>
            {compare.columns.map((c) => (
              <th className={styles['plan' + c.plan]} key={c.plan}>
                Plan {c.plan}
                <br />
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{c.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compare.rows.map((row) => (
            <tr key={row.criterio} className={row.type === 'reco' ? styles.reco : undefined}>
              <th scope="row">{row.criterio}</th>
              {row.values.map((v, i) => (
                <td key={i}>
                  <Cell row={row} value={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
