import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'
import { getMyVehicles } from '@/services/vehicles'

interface VehicleStore {
  vehicle: RecordModel | null
  setVehicle: (vehicle: RecordModel | null) => void
  isLoading: boolean
  refreshVehicles: () => Promise<void>
}

const VehicleContext = createContext<VehicleStore | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<RecordModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshVehicles = async () => {
    setIsLoading(true)
    try {
      if (pb.authStore.isValid) {
        const vehicles = await getMyVehicles()
        if (vehicles.length > 0) {
          setVehicle(vehicles[0])
        } else {
          setVehicle(null)
        }
      } else {
        setVehicle(null)
      }
    } catch (error) {
      console.error('Failed to load vehicles', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshVehicles()

    // Listen to auth changes to reload or clear vehicles
    return pb.authStore.onChange(() => {
      refreshVehicles()
    })
  }, [])

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, isLoading, refreshVehicles }}>
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
