import { useState, useEffect, useCallback } from 'react'

/* Selección de un plan por día, persistida en localStorage.
   MISMA clave y forma que la web original ({ "1":"C", "3":"A" }) para no perder
   selecciones previas de usuarios. Reemplaza load/save/applyCards del IIFE. */
const KEY = 'pirineos2026-seleccion'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function useTripSelection() {
  const [sel, setSel] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(sel))
    } catch {
      /* ignora cuota/privado */
    }
  }, [sel])

  const toggle = useCallback((day, plan) => {
    const k = String(day)
    setSel((s) => {
      if (s[k] === plan) {
        const next = { ...s }
        delete next[k]
        return next
      }
      return { ...s, [k]: plan }
    })
  }, [])

  const reset = useCallback(() => setSel({}), [])

  return { sel, toggle, reset }
}
