import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { differenceInMinutes } from 'date-fns'
import { Quote } from '@/services/quotes'
import { Clock, Calendar, Gauge } from 'lucide-react'

interface Props {
  quote: Quote
  onClick?: (quote: Quote) => void
}

export function QuoteCard({ quote, onClick }: Props) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const expiresAt = new Date(quote.expires_at)
      const now = new Date()
      const mins = differenceInMinutes(expiresAt, now)

      if (mins <= 0) {
        setTimeLeft('Expirado')
        setIsUrgent(true)
        return
      }

      const hours = Math.floor(mins / 60)
      const remainingMins = mins % 60
      setTimeLeft(`${hours}h ${remainingMins}min`)
      setIsUrgent(hours < 1)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [quote.expires_at])

  const vehicle = quote.expand?.vehicle

  return (
    <Card
      className={`cursor-pointer transition-colors shadow-sm ${onClick ? 'hover:border-primary/50' : ''}`}
      onClick={() => onClick && onClick(quote)}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-semibold flex justify-between items-start gap-2">
          <span className="truncate">
            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo Indisponível'}
          </span>
          <Badge
            variant={isUrgent ? 'destructive' : 'secondary'}
            className="text-xs font-normal whitespace-nowrap flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            {timeLeft}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-3">
        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {vehicle?.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" /> {vehicle?.km_current?.toLocaleString('pt-BR')} km
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">Itens solicitados:</p>
          <div className="flex flex-wrap gap-1">
            {quote.items_requested?.map((item, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-muted/50">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
