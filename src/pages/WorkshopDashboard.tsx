import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getWorkshopByUser, Workshop } from '@/services/workshops'
import { Quote, Proposal } from '@/services/quotes'
import pb from '@/lib/pocketbase/client'
import { LogOut, LayoutDashboard, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QuoteCard } from '@/components/workshop/QuoteCard'
import { ProposalModal } from '@/components/workshop/ProposalModal'
import { useRealtime } from '@/hooks/use-realtime'

export default function WorkshopDashboard() {
  const { user, signOut } = useAuth()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [openQuotes, setOpenQuotes] = useState<Quote[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [error, setError] = useState(false)

  const loadData = async () => {
    if (!user) return
    setError(false)
    try {
      const ws = await getWorkshopByUser(user.id)
      if (ws) {
        setWorkshop(ws)
        const [quotesRes, propsRes] = await Promise.all([
          pb
            .collection('quotes')
            .getFullList<Quote>({ filter: 'status="open"', expand: 'vehicle' }),
          pb.collection('proposals').getFullList<Proposal>({
            filter: `workshop="${ws.id}"`,
            expand: 'quote,quote.vehicle',
          }),
        ])
        setOpenQuotes(quotesRes)
        setProposals(propsRes)
      }
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('quotes', () => {
    loadData()
  })
  useRealtime('proposals', () => {
    loadData()
  })

  const { newQuotesList, inProgressList, completedList } = useMemo(() => {
    const proposedIds = new Set(proposals.map((p) => p.quote))

    const newQ = openQuotes
      .filter((q) => !proposedIds.has(q.id))
      .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())

    const expandQuote = (p: Proposal) =>
      ({ ...p.expand?.quote, expand: { vehicle: p.expand?.quote?.expand?.vehicle } }) as Quote

    const inProg = proposals
      .filter(
        (p) =>
          ['pending', 'accepted'].includes(p.status) && p.expand?.quote?.status !== 'completed',
      )
      .map(expandQuote)
      .filter((q) => q && q.id)

    const comp = proposals
      .filter((p) => p.expand?.quote?.status === 'completed')
      .map(expandQuote)
      .filter((q) => q && q.id)

    return { newQuotesList: newQ, inProgressList: inProg, completedList: comp }
  }, [openQuotes, proposals])

  const renderColumn = (title: string, items: Quote[], canPropose: boolean) => (
    <div className="flex-1 min-w-[320px] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h2 className="font-semibold text-foreground tracking-tight">{title}</h2>
        <Badge variant="secondary" className="rounded-full px-2.5">
          {items.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : items.length === 0 ? (
          <div className="text-center p-8 bg-background/50 rounded-xl border border-dashed flex flex-col items-center gap-3 text-muted-foreground/60">
            <Inbox className="w-10 h-10 stroke-1" />
            <p className="text-sm font-medium">Nenhuma cotação</p>
          </div>
        ) : (
          items.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              onClick={canPropose ? () => setSelectedQuote(q) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col animate-fade-in md:pl-20">
      <header className="bg-background border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
            {workshop?.name?.charAt(0) || <LayoutDashboard className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-semibold leading-none mb-1 text-foreground">
              Olá, {workshop?.name || 'Oficina'}
            </h1>
            <p className="text-xs text-muted-foreground">Painel Kanban de Cotações</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors hidden md:flex"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors md:hidden"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Very simple fixed minimal sidebar just for workshop if needed, but the header handles logout. */}
      <aside className="hidden md:flex flex-col w-20 fixed inset-y-0 left-0 bg-background border-r z-50 items-center py-6 shadow-soft">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm text-primary-foreground font-bold text-xl">
          G
        </div>
        <div className="mt-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="hover:bg-destructive/10 hover:text-destructive rounded-xl w-12 h-12"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <p>Ocorreu um erro ao carregar os dados.</p>
            <Button onClick={loadData} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-start pb-8 min-h-full">
            {renderColumn('Novas Cotações', newQuotesList, true)}
            {renderColumn('Em Andamento', inProgressList, false)}
            {renderColumn('Concluídas', completedList, false)}
          </div>
        )}
      </main>

      <ProposalModal
        quote={selectedQuote}
        workshopId={workshop?.id || ''}
        workshopName={workshop?.name || ''}
        open={!!selectedQuote}
        onOpenChange={(v) => !v && setSelectedQuote(null)}
      />
    </div>
  )
}
