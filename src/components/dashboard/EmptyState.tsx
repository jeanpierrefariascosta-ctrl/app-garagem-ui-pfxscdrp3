import { CarFront, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  onRegister: () => void
}

export function EmptyState({ onRegister }: EmptyStateProps) {
  return (
    <div className="mt-8 animate-fade-in-up">
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30 shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <CarFront className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-primary">Nenhum veículo</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-[250px]">
            Cadastre seu primeiro veículo para acompanhar manutenções e histórico.
          </p>
          <Button
            onClick={onRegister}
            size="lg"
            className="w-full font-semibold group rounded-xl bg-secondary hover:bg-secondary/90 text-white"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Cadastrar agora
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
