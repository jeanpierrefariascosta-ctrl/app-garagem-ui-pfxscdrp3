import { useState } from 'react'
import { Car, RefreshCw, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { RecordModel } from 'pocketbase'
import { UpdateKmDialog } from '@/components/UpdateKmDialog'
import pb from '@/lib/pocketbase/client'

interface VehicleInfoProps {
  vehicle: RecordModel
  onChangeVehicle: () => void
}

export function VehicleInfo({ vehicle, onChangeVehicle }: VehicleInfoProps) {
  const [isUpdateKmOpen, setIsUpdateKmOpen] = useState(false)
  // Format KM with dots (e.g., 42000 -> 42.000)
  const formattedKm = Number(vehicle.km_current || 0).toLocaleString('pt-BR')
  const photoUrl = vehicle.photo ? pb.files.getUrl(vehicle, vehicle.photo) : null

  return (
    <Card className="border-none shadow-soft overflow-hidden animate-fade-in-up">
      <div className="bg-primary/5 px-5 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Car className="w-4 h-4" />
          Veículo Ativo
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onChangeVehicle}
          className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 h-8 text-xs font-semibold px-2"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Trocar
        </Button>
      </div>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {photoUrl ? (
            <div className="w-full md:w-1/3 h-48 md:h-auto bg-muted">
              <img src={photoUrl} alt={vehicle.model} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-1/3 h-32 md:h-auto bg-muted/30 flex flex-col items-center justify-center border-r border-b md:border-b-0">
              <Car className="w-12 h-12 text-muted-foreground opacity-30 mb-2" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Sem foto
              </span>
            </div>
          )}
          <div className="flex-1 p-5 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Ano {vehicle.year} {vehicle.plate && `• ${vehicle.plate.toUpperCase()}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Odômetro
                </p>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-xl font-mono font-bold text-primary">
                    {formattedKm}{' '}
                    <span className="text-sm font-sans font-medium text-muted-foreground">km</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                    onClick={() => setIsUpdateKmOpen(true)}
                    title="Atualizar KM"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <UpdateKmDialog vehicle={vehicle} open={isUpdateKmOpen} onOpenChange={setIsUpdateKmOpen} />
    </Card>
  )
}
