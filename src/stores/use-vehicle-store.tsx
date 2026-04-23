import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'
import { useAuth } from '@/hooks/use-auth'

interface VehicleStoreType {
  vehicle: RecordModel | null
  setVehicle: (vehicle: RecordModel | null) => void
  vehicles: RecordModel[]
  isLoading: boolean
  refreshVehicles: () => Promise<void>
}

const VehicleContext = createContext<VehicleStoreType | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState<RecordModel | null>(null)
  const [vehicles, setVehicles] = useState<RecordModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([])
      setVehicle(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const records = await pb.collection('vehicles').getFullList({
        sort: '-created',
      })
      setVehicles(records)

      if (records.length > 0) {
        setVehicle((prev) => {
          // Keep currently selected vehicle if it still exists
          if (prev && records.find((r) => r.id === prev.id)) {
            return records.find((r) => r.id === prev.id) || records[0]
          }
          return records[0]
        })
      } else {
        setVehicle(null)
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshVehicles()
  }, [refreshVehicles])

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, vehicles, isLoading, refreshVehicles }}>
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
