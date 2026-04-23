import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Star, Clock, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import useVehicleStore from '@/stores/use-vehicle-store'
import { useAuth } from '@/hooks/use-auth'
import { createQuote } from '@/services/quotes'
import { useToast } from '@/hooks/use-toast'

const MOCK_WORKSHOPS = [
  { id: 1, name: 'Mecânica Silva', distance: 2, rating: 4.8, top: '40%', left: '30%' },
  { id: 2, name: 'Auto Center João', distance: 5, rating: 4.5, top: '20%', left: '60%' },
  { id: 3, name: 'Oficina Rápida', distance: 7, rating: 4.2, top: '70%', left: '40%' },
  { id: 4, name: 'Mecânica do Zé', distance: 8, rating: 3.9, top: '60%', left: '75%' },
  { id: 5, name: 'Auto Serviços', distance: 9, rating: 3.5, top: '30%', left: '80%' },
]

const SERVICES = [
  'Filtro de ar',
  'Troca de óleo',
  'Pastilhas de freio',
  'Alinhamento e Balanceamento',
  'Revisão Geral',
]

export default function QuoteRequest() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { vehicle } = useVehicleStore()
  const { user } = useAuth()

  const [selectedServices, setSelectedServices] = useState<string[]>(['Filtro de ar'])
  const [loading, setLoading] = useState(false)

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    )
  }

  const handleRequestQuote = async () => {
    if (!vehicle || !user) {
      toast({
        title: 'Erro',
        description: 'Selecione um veículo primeiro.',
        variant: 'destructive',
      })
      return
    }
    if (selectedServices.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione ao menos um serviço.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 6)

      const quote = await createQuote({
        user: user.id,
        vehicle: vehicle.id,
        items_requested: selectedServices,
        status: 'open',
        expires_at: expiresAt.toISOString(),
        lat: -23.5505,
        lng: -46.6333,
      })

      navigate(`/cotacao/${quote.id}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar cotação. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitar Cotação</h1>
        {vehicle && (
          <p className="text-muted-foreground mt-1 text-lg">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Itens do Serviço
            </h2>
            <Card>
              <CardContent className="p-4 grid gap-3">
                {SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <Checkbox
                      checked={selectedServices.includes(service)}
                      onCheckedChange={() => toggleService(service)}
                    />
                    <span className="font-medium text-sm md:text-base">{service}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Oficinas na Região
            </h2>
            <div className="relative w-full h-[300px] bg-muted rounded-xl overflow-hidden border">
              <img
                src="https://img.usecurling.com/p/800/400?q=map&color=gray"
                alt="Mapa"
                className="object-cover w-full h-full opacity-40"
              />
              {MOCK_WORKSHOPS.map((w) => (
                <div
                  key={w.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer hover:z-10"
                  style={{ top: w.top, left: w.left }}
                >
                  <div className="bg-background border shadow-lg rounded-lg px-2 py-1 text-xs font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {w.name}
                  </div>
                  <MapPin className="text-primary w-8 h-8 drop-shadow-md transition-transform group-hover:scale-125" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4 text-lg">5 Oficinas Encontradas</h3>
                <div className="space-y-4">
                  {MOCK_WORKSHOPS.map((w) => (
                    <div
                      key={w.id}
                      className="flex justify-between items-center text-sm pb-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{w.name}</p>
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                          {w.rating} • {w.distance} km
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  size="lg"
                  className="w-full font-bold h-14 rounded-xl shadow-lg shadow-primary/20"
                  onClick={handleRequestQuote}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5 mr-2" />
                  )}
                  Enviar Cotação para 5 Oficinas
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Serviço sem compromisso e gratuito.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
