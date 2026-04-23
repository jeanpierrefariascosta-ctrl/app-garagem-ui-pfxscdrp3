import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type Vehicle = {
  brand: string
  model: string
  year: string
  km: string
}

interface VehicleStore {
  vehicle: Vehicle | null
  setVehicle: (vehicle: Vehicle | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const VehicleContext = createContext<VehicleStore | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial load from a remote server or local storage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, isLoading, setIsLoading }}>
      {children}
    </VehicleContext.Provider>
  )
}

export default function useVehicleStore() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error('useVehicleStore must be used within a VehicleProvider')
  }
  return context
}
