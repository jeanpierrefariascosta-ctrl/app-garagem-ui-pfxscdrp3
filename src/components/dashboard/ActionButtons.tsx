import { Wrench, History, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <Button
        asChild
        size="lg"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 rounded-xl text-base shadow-lg shadow-accent/20 transition-transform active:scale-[0.98]"
      >
        <Link to="/cotacao">
          <Wrench className="w-5 h-5 mr-2" />
          Solicitar Cotação
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="w-full h-14 rounded-xl font-semibold border-2 hover:bg-muted/50 transition-transform active:scale-[0.98]"
      >
        <Link to="/plano">
          <History className="w-5 h-5 mr-2 text-muted-foreground" />
          Ver Plano de Manutenção
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="w-full h-14 rounded-xl font-semibold border-2 hover:bg-muted/50 transition-transform active:scale-[0.98]"
      >
        <Link to="/historico">
          <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
          Histórico de Serviços
        </Link>
      </Button>
    </div>
  )
}
