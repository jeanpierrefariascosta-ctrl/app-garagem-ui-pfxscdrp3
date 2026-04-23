import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Clock, AlertCircle, MapPin, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getQuote,
  getProposalsByQuote,
  createProposal,
  updateQuote,
  type Quote,
  type Proposal,
} from '@/services/quotes'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

const CONTACTED_WORKSHOPS = [
  'Mecânica Silva',
  'Auto Center João',
  'Oficina Rápida',
  'Mecânica do Zé',
  'Auto Serviços',
]

export default function QuoteDashboard() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number } | null>(null)
  const [showProposals, setShowProposals] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      const q = await getQuote(id)
      setQuote(q)
      const p = await getProposalsByQuote(id)
      setProposals(p)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('proposals', () => {
    if (id) getProposalsByQuote(id).then(setProposals)
  })

  // Simulation: create a proposal after 3 seconds if none exists
  useEffect(() => {
    if (quote && proposals.length === 0 && quote.status === 'open') {
      const timer = setTimeout(async () => {
        try {
          await createProposal({
            quote: quote.id,
            workshop_name: 'Mecânica Silva',
            total_value: 180,
            estimated_hours: 2,
            items_included: ['Filtro de ar original'],
            notes: 'Temos disponibilidade imediata. Serviço rápido.',
            status: 'pending',
          })
          toast({
            title: 'Nova Proposta!',
            description: 'Mecânica Silva acabou de enviar uma proposta.',
          })
        } catch (e) {
          console.error('Simulation error', e)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [quote, proposals.length])

  // Countdown and expiration
  useEffect(() => {
    if (!quote || quote.status !== 'open') return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const exp = new Date(quote.expires_at).getTime()
      const diff = exp - now

      if (diff <= 0) {
        clearInterval(interval)
        setTimeLeft({ h: 0, m: 0 })
        if (quote.status === 'open') {
          updateQuote(quote.id, { status: 'expired' }).then(() => {
            setQuote((prev) => (prev ? { ...prev, status: 'expired' } : prev))
            toast({
              title: 'Cotação Expirada',
              description: 'O tempo limite de 6 horas para propostas acabou.',
            })
          })
        }
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft({ h, m })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [quote])

  if (loading) {
    return (
      <div className="container max-w-3xl py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="container max-w-3xl py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Erro ao carregar cotação</h2>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-6 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aguardando Respostas</h1>
          <p className="text-muted-foreground mt-1">
            {quote.expand?.vehicle?.brand} {quote.expand?.vehicle?.model} •{' '}
            {quote.items_requested?.join(', ')}
          </p>
        </div>
        <Badge
          variant={quote.status === 'expired' ? 'destructive' : 'secondary'}
          className="w-fit text-sm px-3 py-1"
        >
          {quote.status === 'expired' ? 'Expirado' : 'Em andamento'}
        </Badge>
      </div>

      <Card
        className={`border-2 transition-colors duration-500 ${quote.status === 'expired' ? 'border-destructive/20 bg-destructive/5' : 'border-primary/20 bg-primary/5'}`}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <Clock
            className={`w-12 h-12 ${quote.status === 'expired' ? 'text-destructive' : 'text-primary animate-pulse'}`}
          />
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tempo restante
            </p>
            <p
              className={`text-5xl font-black mt-1 ${quote.status === 'expired' ? 'text-destructive' : 'text-primary'}`}
            >
              {timeLeft
                ? `${String(timeLeft.h).padStart(2, '0')}h ${String(timeLeft.m).padStart(2, '0')}min`
                : '--h --min'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Enviamos sua solicitação para 5 oficinas num raio de 10km. Fique tranquilo, você será
            notificado assim que receber respostas.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Status das Oficinas</h2>
          <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
            {proposals.length} de 5 respondidas
          </span>
        </div>

        <div className="grid gap-3">
          {CONTACTED_WORKSHOPS.map((workshopName, idx) => {
            const proposal = proposals.find((p) => p.workshop_name === workshopName)
            return (
              <Card
                key={idx}
                className={`overflow-hidden transition-all duration-500 ${proposal ? 'border-green-500/40 bg-green-50/30 dark:bg-green-950/20 shadow-sm' : ''}`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${proposal ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{workshopName}</p>
                      {proposal && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-0.5">
                          R$ {proposal.total_value.toFixed(2)} • {proposal.estimated_hours}h
                          estimadas
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {proposal ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 py-1 px-3 w-fit">
                        <Check className="w-4 h-4" /> Respondida
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2 text-muted-foreground py-1 px-3 w-fit"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" /> Aguardando...
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="pt-8 border-t pb-12">
        {showProposals ? (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="font-semibold text-2xl">Propostas Recebidas</h3>
            {proposals.map((p) => (
              <Card key={p.id} className="border-primary/50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <span className="text-xl">{p.workshop_name}</span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        Há{' '}
                        {Math.floor((new Date().getTime() - new Date(p.created).getTime()) / 60000)}{' '}
                        minutos
                      </p>
                    </div>
                    <span className="text-2xl text-primary font-black">
                      R$ {p.total_value.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-6 bg-muted/50 p-4 rounded-xl">
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Tempo Estimado
                      </span>
                      <span className="font-medium">{p.estimated_hours} horas</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Itens Inclusos
                      </span>
                      <span className="font-medium">
                        {p.items_included?.join(', ') || 'Não especificado'}
                      </span>
                    </div>
                  </div>
                  {p.notes && (
                    <div className="text-sm">
                      <span className="font-semibold text-foreground mb-1 block">
                        Observações do Mecânico:
                      </span>
                      <p className="text-muted-foreground italic">"{p.notes}"</p>
                    </div>
                  )}
                  <Button className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-shadow mt-4">
                    Aceitar esta Proposta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold rounded-xl shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={proposals.length === 0}
            onClick={() => setShowProposals(true)}
          >
            Ver {proposals.length} Proposta{proposals.length !== 1 && 's'} Recebida
            {proposals.length !== 1 && 's'}
            <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
