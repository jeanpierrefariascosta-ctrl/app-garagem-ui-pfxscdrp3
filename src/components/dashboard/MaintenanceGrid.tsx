import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Droplets,
  Wind,
  Disc,
  Settings,
  Navigation,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatusType = 'success' | 'warning' | 'error'

interface MaintenanceItem {
  id: string
  name: string
  status: StatusType
  message: string
  icon: React.ElementType
}

const MOCK_ITEMS: MaintenanceItem[] = [
  { id: '1', name: 'Óleo do Motor', status: 'warning', message: 'Faltam 500 km', icon: Droplets },
  { id: '2', name: 'Filtro de Ar', status: 'error', message: 'Vencido há 2.000 km', icon: Wind },
  { id: '3', name: 'Pastilhas de freio', status: 'success', message: 'Em dia', icon: Disc },
  { id: '4', name: 'Correia dentada', status: 'success', message: 'Em dia', icon: Settings },
  { id: '5', name: 'Alinhamento', status: 'success', message: 'Em dia', icon: Navigation },
]

export function MaintenanceGrid() {
  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-foreground">Status de Manutenção</h3>
        <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {MOCK_ITEMS.length} itens
        </span>
      </div>

      <div className="grid gap-3">
        {MOCK_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="p-4 flex items-center gap-4 border-none shadow-soft hover:shadow-md transition-shadow"
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                item.status === 'success' && 'bg-success/10 text-success',
                item.status === 'warning' && 'bg-warning/10 text-warning',
                item.status === 'error' && 'bg-destructive/10 text-destructive',
              )}
            >
              <item.icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                {item.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                {item.status === 'warning' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    item.status === 'success' && 'text-success',
                    item.status === 'warning' && 'text-warning',
                    item.status === 'error' && 'text-destructive',
                  )}
                >
                  {item.message}
                </span>
              </div>
            </div>

            {item.status !== 'success' && (
              <button className="text-xs font-semibold text-secondary hover:underline px-2 py-1">
                Agendar
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
