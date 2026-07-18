import { createContext, useContext } from 'react'
import { useTripSelection } from '../hooks/useTripSelection.js'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const trip = useTripSelection()
  return <TripContext.Provider value={trip}>{children}</TripContext.Provider>
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip debe usarse dentro de <TripProvider>')
  return ctx
}
