import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export type ChecklistItems = {
  tires: boolean
  oil: boolean
  coolant: boolean
  lights: boolean
  brakes: boolean
}

export const createChecklist = async (
  vehicleId: string,
  items: ChecklistItems,
): Promise<RecordModel> => {
  return pb.collection('pre_travel_checklists').create({
    vehicle: vehicleId,
    items,
  })
}

export const getLatestChecklist = async (vehicleId: string): Promise<RecordModel | null> => {
  try {
    const records = await pb.collection('pre_travel_checklists').getList(1, 1, {
      filter: `vehicle = "${vehicleId}"`,
      sort: '-created',
    })
    return records.items[0] || null
  } catch {
    return null
  }
}
