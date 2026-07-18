import { Landscape } from '../SvgArt.jsx'
import Icon from '../icons/Icon.jsx'
import RichText from '../ui/RichText.jsx'
import Datasheet from './Datasheet.jsx'
import PlanCarousel from './PlanCarousel.jsx'
import CompareTable from './CompareTable.jsx'
import Nearby from './Nearby.jsx'
import styles from './Day.module.css'

export default function Day({ day }) {
  return (
    <section className={styles.day}>
      <div className="wrap">
        <div className={styles.head}>
          <div className={styles.num} aria-hidden="true">{day.num}</div>
          <div className={styles.titles}>
            <span className={styles.date}>{day.date}</span>
            <span className="eyebrow">{day.zone}</span>
            <h3>{day.title}</h3>
          </div>
        </div>

        {day.pending ? (
          <p className={styles.pending}>
            Contenido de este día en preparación. El esquema (planes, ficha, comparativa y pueblos) se porta
            desde la guía original replicando el día 1.
          </p>
        ) : (
          <>
            <div className={styles.grid}>
              <div className={styles.content}>
                <div className={styles.desc}>
                  {day.desc.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {day.proscons && (
                  <div className={styles.proscons}>
                    <div className={styles.prosconsTtl}>{day.proscons.title}</div>
                    <div className={styles.prosconsCols}>
                      {day.proscons.cols.map((col) => (
                        <div key={col.h}>
                          <div className="pc-h">{col.h}</div>
                          <ul className={`${styles.pc} ${col.kind === 'pro' ? styles.pro : styles.con}`}>
                            {col.items.map((it) => (
                              <li key={it}>
                                <Icon name={col.kind === 'pro' ? 'check' : 'cross'} />
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {day.decide && (
                  <div className={styles.decide}>
                    <div className={styles.decideTtl}>
                      <Icon name="compass" /> {day.decide.title}
                    </div>
                    <ul className={styles.decideList}>
                      {day.decide.items.map((it) => (
                        <li key={it.b}>
                          <b>{it.b}</b>
                          <span>{it.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {day.callout && (
                  <div className={styles.callout}>
                    <span className="eyebrow">{day.callout.eyebrow}</span>
                    <RichText as="p" html={day.callout.body} />
                  </div>
                )}
                {day.tips.length > 0 && (
                  <>
                    <div className="mini-h">Consejos</div>
                    <div className="chips">
                      {day.tips.map((t) => (
                        <span className="chip" key={t}>{t}</span>
                      ))}
                    </div>
                  </>
                )}
                {day.gear.length > 0 && (
                  <>
                    <div className="mini-h">Material recomendado</div>
                    <div className="chips">
                      {day.gear.map((g) => (
                        <span className="chip" key={g}>{g}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.photoWrap}>
                {day.photo && (
                  <figure className={styles.photo}>
                    <Landscape art={day.photo.art} />
                    <span className={`${styles.photoTag} pill`}>{day.photo.tag}</span>
                    <figcaption className={styles.photoCap}>{day.photo.caption}</figcaption>
                  </figure>
                )}
                <Datasheet rows={day.datasheet} />
              </div>
            </div>

            <PlanCarousel day={day} />
            {day.compare && <CompareTable compare={day.compare} />}
            {day.nearby && <Nearby nearby={day.nearby} />}
          </>
        )}
      </div>
    </section>
  )
}
