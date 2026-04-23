import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

interface VehicleStoreContextType {
  vehicles: any[]
  currentVehicle: any | null
  setCurrentVehicle: (vehicle: any | null) => void
  loading: boolean
  refreshVehicles: () => Promise<void>
}

const VehicleStoreContext = createContext<VehicleStoreContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [currentVehicle, setCurrentVehicle] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshVehicles = async () => {
    if (!user) {
      setVehicles([])
      setCurrentVehicle(null)
      setLoading(false)
      return
    }

    try {
      const records = await pb.collection('vehicles').getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created',
      })
      setVehicles(records)

      if (records.length > 0) {
        setCurrentVehicle((prev) => {
          if (!prev) return records[0]
          const exists = records.find((r) => r.id === prev.id)
          return exists || records[0]
        })
      } else {
        setCurrentVehicle(null)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshVehicles()
  }, [user?.id])

  return (
    <VehicleStoreContext.Provider
      value={{ vehicles, currentVehicle, setCurrentVehicle, loading, refreshVehicles }}
    >
      {children}
    </VehicleStoreContext.Provider>
  )
}

export function useVehicleStore() {
  const context = useContext(VehicleStoreContext)
  if (context === undefined) {
    throw new Error('useVehicleStore must be used within a VehicleProvider')
  }
  return context
}

export default useVehicleStore
