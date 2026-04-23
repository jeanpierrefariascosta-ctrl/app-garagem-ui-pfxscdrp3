import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription as DrawerDesc,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Quote, createProposal, updateQuote } from '@/services/quotes'
import pb from '@/lib/pocketbase/client'
import { Loader2, Wrench } from 'lucide-react'

interface Props {
  quote: Quote | null
  workshopId: string
  workshopName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProposalModal({ quote, workshopId, workshopName, open, onOpenChange }: Props) {
  const isMobile = useIsMobile()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalValue, setTotalValue] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (open && quote?.vehicle) {
      const vId = quote.expand?.vehicle?.id || quote.vehicle
      pb.collection('vehicle_maintenance_status')
        .getList(1, 3, {
          filter: `vehicle="${vId}"`,
          sort: '-created',
          expand: 'plan_item',
        })
        .then((res) => setHistory(res.items))
        .catch(() => {})

      setSelectedItems(quote.items_requested || [])
      setTotalValue('')
      setHours('')
      setNotes('')
    }
  }, [open, quote])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quote || !totalValue || !hours) return

    setLoading(true)
    try {
      await createProposal({
        quote: quote.id,
        workshop: workshopId,
        workshop_name: workshopName,
        total_value: parseFloat(totalValue.replace(',', '.')),
        estimated_hours: parseInt(hours),
        items_included: selectedItems,
        notes,
        status: 'pending',
      })
      await updateQuote(quote.id, { status: 'in_progress' })
      toast({ title: 'Sucesso', description: 'Proposta enviada!' })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a proposta.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return null

  const vehicleInfo = `Veículo: ${quote.expand?.vehicle?.brand} ${quote.expand?.vehicle?.model} (${quote.expand?.vehicle?.year})`

  const Content = (
    <div className="space-y-6 py-2 px-4 md:px-0">
          {history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Histórico Recente
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground bg-muted p-3 rounded-md">
                {history.map((h) => (
                  <li key={h.id}>
                    • {h.expand?.plan_item?.item_name} -{' '}
                    {h.status === 'ok' ? 'Realizado' : h.status}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form id="proposal-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total">Valor Total (R$)</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  required
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Prazo (Horas)</Label>
                <Input
                  id="hours"
                  type="number"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Ex: 4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Itens Inclusos</Label>
              <div className="space-y-2 border p-3 rounded-md">
                {quote.items_requested?.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={`chk-${item}`}
                      checked={selectedItems.includes(item)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedItems([...selectedItems, item])
                        else setSelectedItems(selectedItems.filter((i) => i !== item))
                      }}
                    />
                    <label htmlFor={`chk-${item}`} className="text-sm leading-none cursor-pointer">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais..."
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t px-4 md:px-0 pb-4 md:pb-0">
          <Button type="button" variant="ghost" className="order-2" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="proposal-form" disabled={loading} className="order-1 md:order-2">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar Proposta
          </Button>
        </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Enviar Proposta</DrawerTitle>
            <DrawerDesc>{vehicleInfo}</DrawerDesc>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {Content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Proposta</DialogTitle>
          <DialogDescription>{vehicleInfo}</DialogDescription>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  )
}
