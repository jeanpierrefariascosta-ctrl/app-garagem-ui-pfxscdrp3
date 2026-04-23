import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { RecordModel } from 'pocketbase'
import { updateVehicleKm } from '@/services/maintenance'
import { toast } from '@/hooks/use-toast'
import useVehicleStore from '@/stores/use-vehicle-store'

interface UpdateKmDialogProps {
  vehicle: RecordModel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateKmDialog({ vehicle, open, onOpenChange }: UpdateKmDialogProps) {
  const [km, setKm] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshVehicles } = useVehicleStore()

  useEffect(() => {
    if (open && vehicle) {
      setKm(vehicle.km_current?.toString() || '')
    }
  }, [open, vehicle])

  if (!vehicle) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newKm = parseInt(km, 10)
    if (isNaN(newKm) || newKm < 0) {
      toast({ title: 'Erro', description: 'O novo KM deve ser válido.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await updateVehicleKm(vehicle, newKm)
      await refreshVehicles()
      toast({
        title: 'Sucesso',
        description: `KM atualizado para ${newKm.toLocaleString('pt-BR')} km`,
      })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar KM. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Quilometragem</DialogTitle>
          <DialogDescription>
            Informe a quilometragem atual do seu {vehicle.brand} {vehicle.model}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="km">Quilometragem (KM)</Label>
            <Input
              id="km"
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              disabled={loading}
              placeholder="Ex: 45000"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
