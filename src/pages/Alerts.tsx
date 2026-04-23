import { BellRing, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'

export default function Alerts() {
  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      <Header />
      <div className="p-5 space-y-6 mt-2">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <BellRing className="w-6 h-6" />
          Alertas
        </h2>

        <div className="bg-white rounded-2xl p-8 text-center shadow-soft border border-border flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Tudo em ordem!</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Você não tem alertas pendentes no momento. Continue acompanhando a saúde do seu veículo.
          </p>
        </div>
      </div>
    </div>
  )
}
