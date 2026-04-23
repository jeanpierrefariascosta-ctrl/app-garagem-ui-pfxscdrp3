import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, MapPin, Clock, Star, Phone, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import pb from '@/lib/pocketbase/client'

export default function WorkshopProfile() {
  const { id } = useParams()
  const [workshop, setWorkshop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    pb.collection('workshops')
      .getOne(id)
      .then(setWorkshop)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="bg-background border-b px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" asChild className="-ml-2 mr-2">
            <Link to={-1 as any}>
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Oficina não encontrada</h2>
        <Button asChild>
          <Link to="/">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <div className="bg-background border-b px-4 py-4 flex items-center sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="-ml-2 mr-2">
          <Link to={-1 as any}>
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold truncate">Perfil da Oficina</h1>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Card className="border-none shadow-soft overflow-hidden">
          <div className="h-32 bg-primary/10 flex items-center justify-center">
            <Wrench className="w-12 h-12 text-primary/30" />
          </div>
          <CardContent className="p-6 text-center -mt-10 relative">
            <div className="w-20 h-20 bg-background border-4 border-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl font-bold text-primary">{workshop.name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{workshop.name}</h2>
            <div className="flex items-center justify-center text-muted-foreground text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {workshop.address || 'Endereço não informado'}
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full font-semibold text-sm">
                <Star className="w-4 h-4 fill-current mr-1" />
                {workshop.score ? workshop.score.toFixed(1) : 'Novo'}
              </div>
              <Badge
                variant="outline"
                className={
                  workshop.is_active ? 'text-green-600 border-green-200' : 'text-muted-foreground'
                }
              >
                {workshop.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center text-foreground mb-3">
                <Wrench className="w-4 h-4 mr-2 text-primary" />
                Serviços Oferecidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(workshop.services) && workshop.services.length > 0 ? (
                  workshop.services.map((svc: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-secondary/20">
                      {svc}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Não informados</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="font-semibold flex items-center text-foreground mb-3">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Horário de Funcionamento
              </h3>
              <p className="text-sm text-muted-foreground">
                {workshop.opening_hours || 'Seg - Sex, 08:00 - 18:00'}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="font-semibold flex items-center text-foreground mb-3">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                Contato
              </h3>
              <p className="text-sm text-muted-foreground">Não disponível pelo app no momento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
