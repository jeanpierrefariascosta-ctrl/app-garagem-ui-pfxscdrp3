import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export type VehicleCreateData = {
  brand: string
  model: string
  year: number
  km_current: number
  user: string
  plate?: string
  color?: string
}

export const getMyVehicles = async (): Promise<RecordModel[]> => {
  if (!pb.authStore.record?.id) return []
  return pb.collection('vehicles').getFullList({
    filter: `user = "${pb.authStore.record.id}"`,
    sort: '-created',
  })
}

export const createVehicle = async (data: VehicleCreateData): Promise<RecordModel> => {
  return pb.collection('vehicles').create(data)
}

export const updateVehicle = async (
  id: string,
  data: Partial<VehicleCreateData>,
): Promise<RecordModel> => {
  return pb.collection('vehicles').update(id, data)
}

export const deleteVehicle = async (id: string): Promise<void> => {
  return pb.collection('vehicles').delete(id)
}
