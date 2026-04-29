import { useState } from 'react'
import {
  Car,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  ClipboardCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useVehicleStore } from '@/stores/use-vehicle-store'
import { VehicleRegistrationDrawer } from '@/components/VehicleRegistrationDrawer'
import { deleteVehicle } from '@/services/vehicles'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import { ChecklistDialog } from '@/components/ChecklistDialog'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export default function VehiclesPage() {
  const { vehicles, currentVehicle, setCurrentVehicle, refreshVehicles, loading } =
    useVehicleStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<RecordModel | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)
  const [checklistVehicle, setChecklistVehicle] = useState<RecordModel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useRealtime('vehicles', () => {
    refreshVehicles()
  })

  const handleDelete = async () => {
    if (!vehicleToDelete) return
    setIsDeleting(true)
    try {
      await deleteVehicle(vehicleToDelete)
      toast({
        title: 'Veículo removido',
        description: 'O veículo foi removido da sua garagem com sucesso.',
      })
      if (currentVehicle?.id === vehicleToDelete) {
        setCurrentVehicle(null)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o veículo. Tente novamente.',
      })
    } finally {
      setIsDeleting(false)
      setVehicleToDelete(null)
    }
  }

  const handleSetActive = (vehicle: any) => {
    setCurrentVehicle(vehicle)
    toast({
      title: 'Veículo selecionado',
      description: `${vehicle.brand} ${vehicle.model} agora é o veículo ativo.`,
    })
  }

  const openEditDrawer = (vehicle: RecordModel) => {
    setVehicleToEdit(vehicle)
    setIsDrawerOpen(true)
  }

  const closeDrawer = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) setVehicleToEdit(null)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Veículos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os veículos da sua garagem.</p>
        </div>
        <Button onClick={() => openEditDrawer(null as any)} className="gap-2 rounded-xl h-11">
          <Plus className="w-5 h-5" />
          Adicionar Veículo
        </Button>
      </div>

      {!loading && vehicles.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Nenhum veículo encontrado</h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-base">
              Você ainda não tem veículos cadastrados. Adicione seu primeiro veículo para começar a
              acompanhar as manutenções.
            </p>
            <Button
              onClick={() => openEditDrawer(null as any)}
              size="lg"
              className="rounded-xl h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Meu Veículo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => {
            const isActive = currentVehicle?.id === vehicle.id
            return (
              <Card
                key={vehicle.id}
                className={cn(
                  'relative overflow-hidden transition-all duration-300 group flex flex-col',
                  isActive
                    ? 'border-primary shadow-md ring-1 ring-primary/20'
                    : 'hover:border-primary/50',
                )}
              >
                <CardHeader className="pb-3 p-0 relative overflow-hidden group/header">
                  {vehicle.photo ? (
                    <div className="w-full h-40 bg-muted">
                      <img
                        src={pb.files.getUrl(vehicle, vehicle.photo)}
                        alt={vehicle.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-muted/50 flex flex-col items-center justify-center border-b">
                      <Car className="w-14 h-14 text-muted-foreground opacity-30 mb-2" />
                      <span className="text-xs font-medium text-muted-foreground">Sem foto</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-md shadow-sm flex items-center gap-1 z-10">
                      <Check className="w-3 h-3" /> ATIVO
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-md rounded-lg shadow-sm border border-border/50">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-transparent"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem
                          onClick={() => openEditDrawer(vehicle)}
                          className="rounded-lg cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setVehicleToDelete(vehicle.id)}
                          className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <CardTitle
                      className="text-xl line-clamp-1"
                      title={`${vehicle.brand} ${vehicle.model}`}
                    >
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="mt-1.5 font-medium text-foreground/80 flex items-center gap-2 mb-4">
                      <span>{vehicle.year}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{vehicle.km_current.toLocaleString('pt-BR')} km</span>
                    </CardDescription>

                    <div className="flex flex-wrap gap-2 mb-6 min-h-[28px]">
                      {vehicle.plate && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                          Placa:{' '}
                          <span className="uppercase ml-1 text-foreground">{vehicle.plate}</span>
                        </span>
                      )}
                      {vehicle.color && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground border">
                          Cor:{' '}
                          <span className="capitalize ml-1 text-foreground">{vehicle.color}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch justify-between gap-2 pt-4 border-t mt-auto">
                    <Button
                      variant={isActive ? 'secondary' : 'outline'}
                      onClick={() => handleSetActive(vehicle)}
                      className={cn(
                        'flex-1 rounded-xl h-10 font-semibold',
                        isActive && 'pointer-events-none opacity-90',
                      )}
                    >
                      {isActive ? 'Selecionado' : 'Tornar Ativo'}
                    </Button>
                    <Button
                      variant="default"
                      className="rounded-xl h-10 px-3 sm:flex-none flex-1 font-semibold"
                      onClick={() => setChecklistVehicle(vehicle)}
                    >
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <VehicleRegistrationDrawer
        open={isDrawerOpen}
        onOpenChange={closeDrawer}
        vehicleToEdit={vehicleToEdit}
      />
      <ChecklistDialog
        vehicle={checklistVehicle}
        open={!!checklistVehicle}
        onOpenChange={(open: boolean) => !open && setChecklistVehicle(null)}
      />

      <AlertDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Remover veículo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Esta ação não pode ser desfeita. Isso excluirá o veículo e todos os históricos
              associados a ele permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-11">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-11 font-bold"
            >
              {isDeleting ? 'Removendo...' : 'Sim, remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
