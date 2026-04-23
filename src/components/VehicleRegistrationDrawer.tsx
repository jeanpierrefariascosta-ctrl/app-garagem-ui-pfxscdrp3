import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useVehicleStore from '@/stores/use-vehicle-store'
import pb from '@/lib/pocketbase/client'
import { createVehicle } from '@/services/vehicles'
import { initVehicleMaintenance } from '@/services/maintenance'
import { Loader2 } from 'lucide-react'

const CAR_DATA: Record<string, string[]> = {
  Chevrolet: ['Onix', 'Tracker', 'Montana', 'Cruze'],
  Hyundai: ['HB20', 'Creta', 'Tucson'],
  Volkswagen: ['Gol', 'T-Cross', 'Polo', 'Virtus', 'Nivus'],
  Fiat: ['Argo', 'Strada', 'Mobi', 'Cronos', 'Toro'],
  Jeep: ['Compass', 'Renegade', 'Commander'],
  Renault: ['Kwid', 'Duster', 'Sandero'],
  Ford: ['Ka', 'EcoSport', 'Ranger'],
  Toyota: ['Corolla', 'Hilux', 'Yaris'],
  Honda: ['Civic', 'HR-V', 'City'],
}

const YEARS = Array.from({ length: 12 }, (_, i) => (2026 - i).toString())

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehicleRegistrationDrawer({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile()
  const { refreshVehicles } = useVehicleStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')

  useEffect(() => {
    setModel('')
  }, [brand])

  useEffect(() => {
    if (open) {
      setBrand('')
      setModel('')
      setYear('')
      setKm('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model || !year || !km || !pb.authStore.record?.id) return

    setIsLoading(true)
    try {
      const newVehicle = await createVehicle({
        brand,
        model,
        year: parseInt(year),
        km_current: parseInt(km),
        user: pb.authStore.record.id,
      })

      // Initialize basic plans for this vehicle
      await initVehicleMaintenance(newVehicle.id, model)

      await refreshVehicles()

      toast({
        title: 'Veículo cadastrado!',
        description: `${brand} ${model} adicionado com sucesso à sua garagem.`,
        className: 'bg-success text-success-foreground border-success',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description: 'Verifique os dados e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = brand && model && year && km && !isLoading

  const FormContent = (
    <form onSubmit={handleSubmit} className="p-4 md:p-2 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="brand" className="font-semibold text-foreground">
          Marca
        </Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger id="brand" className="h-12 rounded-xl border-input/60">
            <SelectValue placeholder="Selecione a marca" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(CAR_DATA)
              .sort()
              .map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model" className="font-semibold text-foreground">
          Modelo
        </Label>
        <Select value={model} onValueChange={setModel} disabled={!brand}>
          <SelectTrigger id="model" className="h-12 rounded-xl border-input/60">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            {brand &&
              CAR_DATA[brand]?.sort().map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year" className="font-semibold text-foreground">
            Ano
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year" className="h-12 rounded-xl border-input/60">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="km" className="font-semibold text-foreground">
            KM atual
          </Label>
          <Input
            id="km"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 45000"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="h-12 rounded-xl border-input/60"
          />
        </div>
      </div>

      <div className="pt-6 pb-2 flex flex-col md:flex-row md:justify-end gap-3">
        {isMobile ? (
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl text-muted-foreground order-2"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </DrawerClose>
        ) : (
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-12 md:h-10 rounded-xl text-muted-foreground order-2"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!isFormValid}
          className="w-full md:w-auto h-14 md:h-10 rounded-xl font-bold text-base md:text-sm transition-transform active:scale-[0.98] order-1 md:order-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          Confirmar Cadastro
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-[450px] mx-auto bg-background">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-2xl font-bold text-primary">Cadastrar Veículo</DrawerTitle>
            <DrawerDescription>
              Insira os dados do seu carro para acompanhar a manutenção.
            </DrawerDescription>
          </DrawerHeader>
          {FormContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-background rounded-2xl">
        <DialogHeader className="text-left pb-4">
          <DialogTitle className="text-2xl font-bold text-primary">Cadastrar Veículo</DialogTitle>
          <DialogDesc>Insira os dados do seu carro para acompanhar a manutenção.</DialogDesc>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  )
}
