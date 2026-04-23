import React from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

export const getVehicleMaintenanceStatus = async (vehicleId: string): Promise<RecordModel[]> => {
  return pb.collection('vehicle_maintenance_status').getFullList({
    filter: `vehicle = "${vehicleId}"`,
    expand: 'plan_item',
    sort: 'status,-created',
  })
}

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

export const calculateMaintenanceItemStatus = (
  kmCurrent: number,
  lastDoneKm: number,
  intervalKm: number,
) => {
  const nextDue = lastDoneKm + intervalKm
  const warningAt = nextDue - intervalKm * 0.2

  let status: 'ok' | 'upcoming' | 'overdue' = 'ok'
  if (kmCurrent >= nextDue) status = 'overdue'
  else if (kmCurrent >= warningAt) status = 'upcoming'

  const diff = Math.abs(nextDue - kmCurrent)

  return { status, diff, nextDue }
}

export const updateVehicleKm = async (vehicle: RecordModel, newKm: number): Promise<void> => {
  await pb.collection('vehicles').update(vehicle.id, { km_current: newKm })

  const statuses = await getVehicleMaintenanceStatus(vehicle.id)

  for (const item of statuses) {
    const plan = item.expand?.plan_item
    if (!plan) continue

    const interval = plan.interval_km || 0
    const lastDone = item.last_done_km || 0

    const { status: calculatedStatus, diff } = calculateMaintenanceItemStatus(
      newKm,
      lastDone,
      interval,
    )

    if (calculatedStatus !== item.status) {
      await pb
        .collection('vehicle_maintenance_status')
        .update(item.id, { status: calculatedStatus })

      if (calculatedStatus === 'upcoming') {
        toast({
          title: 'Atenção',
          description: `Seu ${vehicle.model} precisa de ${plan.item_name} em ${diff.toLocaleString('pt-BR')} km`,
          action: React.createElement(
            ToastAction,
            {
              altText: 'Solicitar Cotação',
              className: 'bg-[#D97706] text-white hover:bg-[#B45309] hover:text-white border-none',
              onClick: () => console.log('Cotação solicitada'),
            },
            'Solicitar Cotação',
          ),
        })
      } else if (calculatedStatus === 'overdue') {
        toast({
          title: 'Atrasado!',
          description: `Seu ${vehicle.model} está atrasado em ${plan.item_name} (${diff.toLocaleString('pt-BR')} km)`,
          variant: 'destructive',
          action: React.createElement(
            ToastAction,
            {
              altText: 'Solicitar Cotação',
              onClick: () => console.log('Cotação solicitada'),
            },
            'Solicitar Cotação',
          ),
        })
      }
    }
  }
}
