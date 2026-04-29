import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createChecklist, getLatestChecklist, ChecklistItems } from '@/services/checklists'
import { Loader2, ClipboardCheck } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const ITEMS = [
  { id: 'tires', label: 'Pneus (calibragem e estado)' },
  { id: 'oil', label: 'Óleo do motor (nível)' },
  { id: 'coolant', label: 'Líquido de arrefecimento (nível)' },
  { id: 'lights', label: 'Luzes e faróis (funcionamento)' },
  { id: 'brakes', label: 'Freios (fluido e resposta)' },
]

export function ChecklistDialog({ vehicle, open, onOpenChange }: any) {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const [items, setItems] = useState<ChecklistItems>({
    tires: false,
    oil: false,
    coolant: false,
    lights: false,
    brakes: false,
  })
  const [loading, setLoading] = useState(false)
  const [lastChecklistDate, setLastChecklistDate] = useState<string | null>(null)

  useEffect(() => {
    if (open && vehicle) {
      setItems({ tires: false, oil: false, coolant: false, lights: false, brakes: false })
      getLatestChecklist(vehicle.id).then((record) => {
        if (record) {
          setLastChecklistDate(new Date(record.created).toLocaleDateString('pt-BR'))
        } else {
          setLastChecklistDate(null)
        }
      })
    }
  }, [open, vehicle])

  const handleSave = async () => {
    setLoading(true)
    try {
      await createChecklist(vehicle.id, items)
      toast({
        title: 'Checklist salvo!',
        description: 'Tenha uma viagem segura.',
        className: 'bg-success text-success-foreground border-success',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  const Content = (
    <div className="space-y-6 py-4">
      {lastChecklistDate && (
        <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          Último checklist: <span className="font-bold text-foreground">{lastChecklistDate}</span>
        </div>
      )}
      <div className="space-y-4">
        {ITEMS.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <Checkbox
              id={item.id}
              checked={items[item.id as keyof ChecklistItems]}
              onCheckedChange={(checked) => setItems((prev) => ({ ...prev, [item.id]: !!checked }))}
              className="w-5 h-5 rounded-md"
            />
            <Label
              htmlFor={item.id}
              className="text-base font-medium leading-none cursor-pointer select-none"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-w-[450px] mx-auto bg-background">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              Checklist Pré-Viagem
            </DrawerTitle>
            <DrawerDescription>Marque os itens verificados antes de viajar.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{Content}</div>
          <DrawerFooter className="flex-row gap-2 mt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 h-12 rounded-xl">
                Cancelar
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Checklist Pré-Viagem
          </DialogTitle>
          <DialogDescription>
            Verifique estes itens essenciais antes de pegar a estrada.
          </DialogDescription>
        </DialogHeader>
        {Content}
        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-xl h-11 font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Checklist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
