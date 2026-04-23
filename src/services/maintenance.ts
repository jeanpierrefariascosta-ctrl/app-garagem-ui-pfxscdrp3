import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getVehicleMaintenanceStatus = async (vehicleId: string): Promise<RecordModel[]> => {
  return pb.collection('vehicle_maintenance_status').getFullList({
    filter: `vehicle = "${vehicleId}"`,
    expand: 'plan_item',
    sort: 'status,-created',
  })
}

// Automatically populate basic maintenance plan statuses for a new vehicle
export const initVehicleMaintenance = async (vehicleId: string, model: string): Promise<void> => {
  try {
    const plans = await pb.collection('maintenance_plans').getFullList({
      filter: `model = "${model}"`,
    })

    for (const plan of plans) {
      await pb.collection('vehicle_maintenance_status').create({
        vehicle: vehicleId,
        plan_item: plan.id,
        status: 'ok',
        last_done_km: 0,
      })
    }
  } catch (error) {
    console.error('Failed to init maintenance plans', error)
  }
}
