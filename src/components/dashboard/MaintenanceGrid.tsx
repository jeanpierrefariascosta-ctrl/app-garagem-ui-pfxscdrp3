import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Droplets,
  Wind,
  Disc,
  Settings,
  Toolbox,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { RecordModel } from 'pocketbase'
import { getVehicleMaintenanceStatus, calculateMaintenanceItemStatus } from '@/services/maintenance'
import useVehicleStore from '@/stores/use-vehicle-store'
import { useRealtime } from '@/hooks/use-realtime'

const getIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('óleo') || n.includes('oleo')) return Droplets
  if (n.includes('filtro') || n.includes('ar')) return Wind
  if (n.includes('freio') || n.includes('pastilha')) return Disc
  if (n.includes('correia')) return Settings
  return Toolbox
}

export function MaintenanceGrid() {
  const { vehicle } = useVehicleStore()
  const [statuses, setStatuses] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!vehicle) return
    try {
      const data = await getVehicleMaintenanceStatus(vehicle.id)
      setStatuses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [vehicle])

  useRealtime('vehicle_maintenance_status', loadData, !!vehicle)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (statuses.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
        Nenhum plano de manutenção encontrado para este veículo.
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-foreground">Status de Manutenção</h3>
        <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {statuses.length} itens
        </span>
      </div>

      <div className="grid gap-3">
        {statuses.map((item) => {
          const plan = item.expand?.plan_item
          const itemName = plan?.item_name || 'Desconhecido'
          const Icon = getIcon(itemName)

          const interval = plan?.interval_km || 0
          const lastDone = item.last_done_km || 0
          const { status, diff } = calculateMaintenanceItemStatus(
            vehicle.km_current,
            lastDone,
            interval,
          )

          let statusType = 'success'
          let message = `Próximo em ${diff.toLocaleString('pt-BR')} km`

          if (status === 'overdue') {
            statusType = 'error'
            message = `Atrasado em ${diff.toLocaleString('pt-BR')} km`
          } else if (status === 'upcoming') {
            statusType = 'warning'
          }

          return (
            <Card
              key={item.id}
              className="p-4 flex items-center gap-4 border-none shadow-soft hover:shadow-md transition-shadow"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                  statusType === 'success' && 'bg-success/10 text-success',
                  statusType === 'warning' && 'bg-warning/10 text-warning',
                  statusType === 'error' && 'bg-destructive/10 text-destructive',
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{itemName}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  {statusType === 'success' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  )}
                  {statusType === 'warning' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  )}
                  {statusType === 'error' && (
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      statusType === 'success' && 'text-success',
                      statusType === 'warning' && 'text-warning',
                      statusType === 'error' && 'text-destructive',
                    )}
                  >
                    {message}
                  </span>
                </div>
              </div>

              {statusType !== 'success' && (
                <button className="text-xs font-semibold text-secondary hover:underline px-2 py-1 shrink-0">
                  Agendar
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
