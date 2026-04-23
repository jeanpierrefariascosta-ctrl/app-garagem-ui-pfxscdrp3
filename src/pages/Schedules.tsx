import { Calendar, Plus } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'

export default function Schedules() {
  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      <Header />
      <div className="p-5 space-y-6 mt-2 flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Agendamentos
          </h2>
          <Button
            size="icon"
            className="rounded-full h-10 w-10 bg-secondary hover:bg-secondary/90 shadow-md shadow-secondary/20"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center shadow-soft border border-border flex flex-col items-center justify-center flex-1 min-h-[350px]">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum agendamento</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Agende serviços de manutenção diretamente pelas oficinas parceiras.
          </p>
        </div>
      </div>
    </div>
  )
}
