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
import { Button } from '@/components/ui/button'
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
  const { setVehicle } = useVehicleStore()
  const { toast } = useToast()

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')

  // Reset model when brand changes
  useEffect(() => {
    setModel('')
  }, [brand])

  // Reset form on open
  useEffect(() => {
    if (open) {
      setBrand('')
      setModel('')
      setYear('')
      setKm('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model || !year || !km) return

    setVehicle({ brand, model, year, km })
    toast({
      title: 'Veículo cadastrado!',
      description: `${brand} ${model} adicionado com sucesso à sua garagem.`,
      className: 'bg-success text-success-foreground border-success',
    })
    onOpenChange(false)
  }

  const isFormValid = brand && model && year && km

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-[450px] mx-auto bg-background">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-2xl font-bold text-primary">Cadastrar Veículo</DrawerTitle>
          <DrawerDescription>
            Insira os dados do seu carro para acompanhar a manutenção.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
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

          <DrawerFooter className="px-0 pt-6 pb-2">
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid}
              className="w-full h-14 rounded-xl font-bold text-base transition-transform active:scale-[0.98]"
            >
              Confirmar Cadastro
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
