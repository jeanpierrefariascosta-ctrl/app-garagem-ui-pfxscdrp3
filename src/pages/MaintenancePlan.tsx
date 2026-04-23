import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Clock,
} from 'lucide-react'
import useVehicleStore from '@/stores/use-vehicle-store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getVehicleMaintenanceStatus, calculateMaintenanceItemStatus } from '@/services/maintenance'
import type { RecordModel } from 'pocketbase'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { UpdateKmDialog } from '@/components/UpdateKmDialog'

const okBg = 'bg-emerald-100 dark:bg-emerald-500/20'
const okText = 'text-emerald-700 dark:text-emerald-400'
const warnBg = 'bg-amber-100 dark:bg-amber-500/20'
const warnText = 'text-amber-700 dark:text-amber-500'
const dangerBg = 'bg-red-100 dark:bg-red-500/20'
const dangerText = 'text-red-700 dark:text-red-400'

export default function MaintenancePlan() {
  const { vehicle } = useVehicleStore()
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isUpdateKmOpen, setIsUpdateKmOpen] = useState(false)

  const loadData = async () => {
    if (!vehicle) return
    setError(false)
    try {
      const data = await getVehicleMaintenanceStatus(vehicle.id)
      setStatuses(data)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!vehicle && !loading) {
      navigate('/')
    } else {
      loadData()
    }
  }, [vehicle, navigate])

  useRealtime('vehicle_maintenance_status', loadData, !!vehicle)

  if (!vehicle) return null

  return (
    <div className="flex flex-col min-h-full pb-8 bg-background">
      <header className="px-5 py-6 bg-primary text-primary-foreground rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-primary-foreground hover:bg-white/10 rounded-full"
          >
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold tracking-tight truncate">
            Plano de Manutenção — {vehicle.brand} {vehicle.model} {vehicle.year}
          </h1>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">KM Atual</p>
            <p className="text-2xl font-bold font-mono">
              {vehicle.km_current?.toLocaleString('pt-BR')} km
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsUpdateKmOpen(true)}
            className="rounded-full font-semibold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar KM
          </Button>
        </div>
      </header>

      <div className="p-5 flex-1">
        {loading ? (
          <div className="space-y-4 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Erro ao carregar plano. Tente novamente.</p>
            <Button onClick={loadData} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
            <p className="text-muted-foreground font-medium">
              Nenhum plano disponível para este veículo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {statuses.map((item) => {
              const plan = item.expand?.plan_item
              if (!plan) return null

              const interval = plan.interval_km || 0
              const lastDone = item.last_done_km || 0
              const { status, diff } = calculateMaintenanceItemStatus(
                vehicle.km_current,
                lastDone,
                interval,
              )

              let message = ''
              if (status === 'overdue') message = `Atrasado em ${diff.toLocaleString('pt-BR')} km`
              else message = `Próximo em ${diff.toLocaleString('pt-BR')} km`

              return (
                <div
                  key={item.id}
                  className="bg-card border shadow-soft rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-foreground text-lg">{plan.item_name}</h3>
                      <div
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5',
                          status === 'ok' && `${okBg} ${okText}`,
                          status === 'upcoming' && `${warnBg} ${warnText}`,
                          status === 'overdue' && `${dangerBg} ${dangerText}`,
                        )}
                      >
                        {status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {status === 'upcoming' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {status === 'overdue' && <AlertCircle className="w-3.5 h-3.5" />}
                        {status === 'ok' ? 'Ok' : status === 'upcoming' ? 'Próximo' : 'Atrasado'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Troca a cada {interval.toLocaleString('pt-BR')} km</span>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-3">
                      <p
                        className={cn(
                          'font-medium text-sm',
                          status === 'ok' && 'text-muted-foreground',
                          status === 'upcoming' && warnText,
                          status === 'overdue' && dangerText,
                        )}
                      >
                        {message}
                      </p>
                    </div>
                  </div>

                  {(status === 'upcoming' || status === 'overdue') && (
                    <Button className="w-full mt-4 font-bold bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-sm">
                      Solicitar Cotação
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <UpdateKmDialog vehicle={vehicle} open={isUpdateKmOpen} onOpenChange={setIsUpdateKmOpen} />
    </div>
  )
}
