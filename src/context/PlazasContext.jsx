import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import instantanea from '../data/plazas.json'
import { PLAZAS_NECESARIAS } from '../data/noches.js'

/**
 * Disponibilidad de plazas en los refugios del viaje.
 *
 * Dos fuentes, en este orden:
 *   1. La INSTANTÁNEA `src/data/plazas.json`, que viaja en el bundle y siempre está.
 *      Se refresca con `npm run fetch:plazas` (ver scripts/fetch-plazas.mjs).
 *   2. Un intento de refresco EN VIVO contra la API al abrir la web. La API está en
 *      otro dominio, así que puede fallar por CORS: si pasa, nos quedamos con la
 *      instantánea y lo decimos. Nunca deja la sección vacía.
 *
 * El refresco se dispara a mano (`refrescar`) desde la sección cuando entra en
 * pantalla, para no pedir nada a la API si el visitante no llega a bajar hasta ahí.
 */

const API = 'https://api.alberguesyrefugios.com'

const PlazasContext = createContext(null)

/** Clasifica un número de huecos: sin dato · cero · pocas · libre. */
export function clasificar(libres, necesarias = PLAZAS_NECESARIAS) {
  if (libres === null || libres === undefined) return 'sindato'
  if (libres <= 0) return 'cero'
  if (libres < necesarias) return 'pocas'
  return 'libre'
}

export function PlazasProvider({ children }) {
  const [datos, setDatos] = useState(instantanea)
  const [estado, setEstado] = useState('instantanea') // instantanea | cargando | envivo | bloqueado
  const yaIntentado = useRef(false)

  const refrescar = useCallback(async () => {
    if (yaIntentado.current) return
    yaIntentado.current = true

    const conId = Object.entries(instantanea.refugios || {}).filter(([, r]) => r?.id)
    if (!conId.length) return

    setEstado('cargando')
    const { desde, hasta } = instantanea.ventana
    const refugios = { ...instantanea.refugios }
    let alguno = false

    for (const [clave, ref] of conId) {
      try {
        const res = await fetch(`${API}/refugios/get/${ref.id}/getPlazas2/`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) continue
        const json = await res.json()

        const alojamientos = Object.values(json?.result || {}).map((h) => {
          const dias = {}
          for (const [fecha, d] of Object.entries(h.plazas || {})) {
            if (fecha < desde || fecha > hasta) continue
            const declarado = Number(d.plazas)
            dias[fecha] = Number.isFinite(declarado)
              ? declarado
              : Number(d.plazasDisponibles) - Number(d.plazasUsadas)
          }
          return { id: h.id, nombre: h.nombre, maxPlazas: h.maxPlazas, dias }
        }).filter((a) => Object.keys(a.dias).length)

        if (alojamientos.length) {
          refugios[clave] = { ...ref, alojamientos }
          alguno = true
        }
      } catch {
        // CORS, red caída o la API cambió: nos quedamos con la instantánea
      }
    }

    if (alguno) {
      setDatos({ ...instantanea, refugios, generado: new Date().toISOString() })
      setEstado('envivo')
    } else {
      setEstado('bloqueado')
    }
  }, [])

  /** Huecos libres de un refugio en una fecha. null si no hay dato. */
  const huecos = useCallback((claveRefugio, fecha) => {
    const ref = datos.refugios?.[claveRefugio]
    if (!ref?.alojamientos?.length) return null
    let mejor = null
    for (const a of ref.alojamientos) {
      const v = a.dias?.[fecha]
      if (typeof v === 'number') mejor = mejor === null ? v : Math.max(mejor, v)
    }
    return mejor
  }, [datos])

  const valor = useMemo(
    () => ({ datos, estado, refrescar, huecos }),
    [datos, estado, refrescar, huecos]
  )

  return <PlazasContext.Provider value={valor}>{children}</PlazasContext.Provider>
}

export function usePlazas() {
  const ctx = useContext(PlazasContext)
  if (!ctx) throw new Error('usePlazas debe usarse dentro de <PlazasProvider>')
  return ctx
}

/** Dispara el refresco cuando el elemento entra en pantalla. */
export function useRefrescoVisible(ref) {
  const { refrescar } = usePlazas()
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      refrescar()
      return
    }
    const obs = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        refrescar()
        obs.disconnect()
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, refrescar])
}
