import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
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
import { useVehicleStore } from '@/stores/use-vehicle-store'
import pb from '@/lib/pocketbase/client'
import { createVehicle, updateVehicle } from '@/services/vehicles'
import { initVehicleMaintenance } from '@/services/maintenance'
import { Loader2, Camera } from 'lucide-react'
import type { RecordModel } from 'pocketbase'

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

const YEARS = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString())

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleToEdit?: RecordModel | null
}

export function VehicleRegistrationDrawer({ open, onOpenChange, vehicleToEdit }: Props) {
  const isMobile = useIsMobile()
  const { refreshVehicles } = useVehicleStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')
  const [plate, setPlate] = useState('')
  const [color, setColor] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!vehicleToEdit) {
      setModel('')
    }
  }, [brand, vehicleToEdit])

  useEffect(() => {
    if (open) {
      if (vehicleToEdit) {
        setBrand(vehicleToEdit.brand)
        setModel(vehicleToEdit.model)
        setYear(vehicleToEdit.year.toString())
        setKm(vehicleToEdit.km_current.toString())
        setPlate(vehicleToEdit.plate || '')
        setColor(vehicleToEdit.color || '')
        setPhoto(null)
        setPhotoPreview(
          vehicleToEdit.photo ? pb.files.getUrl(vehicleToEdit, vehicleToEdit.photo) : null,
        )
      } else {
        setBrand('')
        setModel('')
        setYear('')
        setKm('')
        setPlate('')
        setColor('')
        setPhoto(null)
        setPhotoPreview(null)
      }
    }
  }, [open, vehicleToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model || !year || !km || !pb.authStore.record?.id) return

    setIsLoading(true)
    try {
      const vehicleData = {
        brand,
        model,
        year: parseInt(year),
        km_current: parseInt(km),
        plate: plate || undefined,
        color: color || undefined,
        user: pb.authStore.record.id,
        ...(photo && { photo }),
      }

      if (vehicleToEdit) {
        await updateVehicle(vehicleToEdit.id, vehicleData)
        toast({
          title: 'Veículo atualizado!',
          description: `Os dados do ${brand} ${model} foram salvos com sucesso.`,
          className: 'bg-success text-success-foreground border-success',
        })
      } else {
        const newVehicle = await createVehicle(vehicleData)
        await initVehicleMaintenance(newVehicle.id, model)
        toast({
          title: 'Veículo cadastrado!',
          description: `${brand} ${model} adicionado com sucesso à sua garagem.`,
          className: 'bg-success text-success-foreground border-success',
        })
      }

      await refreshVehicles()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: vehicleToEdit ? 'Erro ao atualizar' : 'Erro ao cadastrar',
        description: 'Verifique os dados e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = brand && model && year && km && !isLoading

  const FormContent = (
    <form onSubmit={handleSubmit} className="p-4 md:p-2 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
          <Label className="font-semibold text-foreground">Foto do Veículo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPhoto(file)
                    setPhotoPreview(URL.createObjectURL(file))
                  }
                }}
                className="text-sm cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-auto py-2"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Max: 5MB</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand" className="font-semibold text-foreground">
            Marca *
          </Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger id="brand" className="h-11 rounded-xl border-input/60">
              <SelectValue placeholder="Selecione" />
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
            Modelo *
          </Label>
          <Select value={model} onValueChange={setModel} disabled={!brand}>
            <SelectTrigger id="model" className="h-11 rounded-xl border-input/60">
              <SelectValue placeholder="Selecione" />
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

        <div className="space-y-2">
          <Label htmlFor="year" className="font-semibold text-foreground">
            Ano *
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year" className="h-11 rounded-xl border-input/60">
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
            KM atual *
          </Label>
          <Input
            id="km"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 45000"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="h-11 rounded-xl border-input/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plate" className="font-semibold text-foreground">
            Placa <span className="text-muted-foreground font-normal">(Opcional)</span>
          </Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="h-11 rounded-xl border-input/60 uppercase"
            maxLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color" className="font-semibold text-foreground">
            Cor <span className="text-muted-foreground font-normal">(Opcional)</span>
          </Label>
          <Input
            id="color"
            placeholder="Ex: Prata"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 rounded-xl border-input/60 capitalize"
          />
        </div>
      </div>

      <div className="pt-4 flex flex-col md:flex-row md:justify-end gap-3">
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
          {vehicleToEdit ? 'Salvar Alterações' : 'Confirmar'}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-[450px] mx-auto bg-background">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-2xl font-bold text-primary">
              {vehicleToEdit ? 'Editar Veículo' : 'Cadastrar Veículo'}
            </DrawerTitle>
            <DrawerDescription>
              {vehicleToEdit
                ? 'Atualize os dados do seu carro.'
                : 'Insira os dados do seu carro para acompanhar a manutenção.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[80vh] px-2 pb-6">{FormContent}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 bg-background rounded-2xl">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-2xl font-bold text-primary">
            {vehicleToEdit ? 'Editar Veículo' : 'Cadastrar Veículo'}
          </DialogTitle>
          <DialogDesc>
            {vehicleToEdit
              ? 'Atualize os dados do seu carro.'
              : 'Insira os dados do seu carro para acompanhar a manutenção.'}
          </DialogDesc>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  )
}
