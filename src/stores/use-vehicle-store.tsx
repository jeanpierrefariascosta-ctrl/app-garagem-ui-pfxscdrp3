import { createContext, useContext, useState, ReactNode } from 'react'

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  license_plate?: string
}

interface VehicleStoreType {
  activeVehicle: Vehicle | null
  setActiveVehicle: (vehicle: Vehicle | null) => void
  vehicles: Vehicle[]
  setVehicles: (vehicles: Vehicle[]) => void
}

const VehicleContext = createContext<VehicleStoreType | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  // Initialize with a mock vehicle so the user can see the app working
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>({
    id: 'mock-vehicle-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    license_plate: 'ABC-1234',
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'mock-vehicle-1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      license_plate: 'ABC-1234',
    },
  ])

  return (
    <VehicleContext.Provider value={{ activeVehicle, setActiveVehicle, vehicles, setVehicles }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicleStore() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error('useVehicleStore must be used within a VehicleProvider')
  }
  return context
}
