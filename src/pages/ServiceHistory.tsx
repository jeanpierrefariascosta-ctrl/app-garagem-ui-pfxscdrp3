import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, FileUp, Eye, Star, Wrench, Receipt, Navigation } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useVehicleStore } from '@/stores/use-vehicle-store'
import { useAuth } from '@/hooks/use-auth'
import { getServiceRecords, updateServiceRecordNF } from '@/services/service_records'
import { getUserReviews, createReview } from '@/services/reviews'
import { useRealtime } from '@/hooks/use-realtime'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ServiceHistory() {
  const { currentVehicle } = useVehicleStore()
  const { user } = useAuth()

  const [records, setRecords] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  const loadData = async () => {
    if (!currentVehicle || !user) return
    try {
      const [recs, revs] = await Promise.all([
        getServiceRecords(currentVehicle.id),
        getUserReviews(user.id),
      ])
      setRecords(recs)
      setReviews(revs)
    } catch (err) {
      toast.error('Erro ao carregar histórico.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentVehicle?.id, user?.id])

  useRealtime('service_records', () => {
    loadData()
  })

  const serviceTypes = useMemo(() => {
    const types = new Set<string>()
    records.forEach((r) => {
      if (Array.isArray(r.items_done)) {
        r.items_done.forEach((item: string) => types.add(item))
      }
    })
    return Array.from(types).sort()
  }, [records])

  const filteredRecords = useMemo(() => {
    if (filterType === 'all') return records
    return records.filter((r) => Array.isArray(r.items_done) && r.items_done.includes(filterType))
  }, [records, filterType])

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 md:pb-0">
      <div className="bg-background border-b px-4 py-4 flex items-center sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="-ml-2 mr-2">
          <Link to="/">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Histórico de Serviços</h1>
          {currentVehicle && (
            <p className="text-sm text-muted-foreground">
              {currentVehicle.brand} {currentVehicle.model}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-primary" />
            Linha do Tempo
          </h2>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[250px] bg-background">
              <SelectValue placeholder="Filtrar por serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os serviços</SelectItem>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-6 pl-6 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted" />
            {[1, 2, 3].map((i) => (
              <Card key={i} className="ml-4">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Receipt className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum serviço registrado</h3>
            <p className="text-muted-foreground max-w-md">
              Mantenha o histórico do seu veículo atualizado. Ao fazer manutenções nas oficinas
              parceiras, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-primary/20 ml-2 md:ml-4 py-4 space-y-8 animate-fade-in">
            {filteredRecords.map((record) => (
              <ServiceCard
                key={record.id}
                record={record}
                review={reviews.find((r) => r.service_record === record.id)}
                user={user}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({
  record,
  review,
  user,
  onUpdate,
}: {
  record: any
  review: any
  user: any
  onUpdate: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [nfPreviewOpen, setNfPreviewOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const workshop = record.expand?.workshop
  const formattedDate = format(new Date(record.service_date), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })
  const formattedKm = Number(record.km_at_service).toLocaleString('pt-BR')
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(record.total_value)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB.')
      return
    }

    setUploading(true)
    setProgress(10)

    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 90))
    }, 300)

    try {
      await updateServiceRecordNF(record.id, file)
      clearInterval(timer)
      setProgress(100)
      toast.success('Nota Fiscal anexada com sucesso!')
      onUpdate()
    } catch (err) {
      clearInterval(timer)
      toast.error('Erro ao anexar arquivo.')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    }
  }

  const nfUrl = record.nf_file ? pb.files.getURL(record, record.nf_file) : null
  const isPdf = record.nf_file?.endsWith('.pdf')

  return (
    <div className="relative pl-6 md:pl-8">
      <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />

      <Card className="shadow-soft border-border/50 hover:border-primary/20 transition-colors">
        <CardContent className="p-0">
          <div className="p-5 md:p-6 border-b border-border/50 bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary mb-1">{formattedDate}</div>
              {workshop && (
                <Link
                  to={`/oficina/${workshop.id}`}
                  className="text-lg font-bold hover:underline flex items-center group"
                >
                  {workshop.name}
                  <Navigation className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs mr-2">
                  {formattedKm} km
                </span>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="text-xl font-bold">{formattedValue}</div>

              {!review && workshop && user && (
                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 mr-1.5" />
                      Avaliar Serviço
                    </Button>
                  </DialogTrigger>
                  <ReviewDialog
                    user={user}
                    workshop={workshop}
                    recordId={record.id}
                    onSuccess={() => {
                      setReviewOpen(false)
                      onUpdate()
                    }}
                  />
                </Dialog>
              )}
              {review && (
                <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  {review.rating}.0
                </div>
              )}
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
              Serviços Realizados
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.isArray(record.items_done) &&
                record.items_done.map((item: string, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground font-medium"
                  >
                    {item}
                  </Badge>
                ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center">
                <Receipt className="w-5 h-5 text-muted-foreground mr-3" />
                <div>
                  <p className="font-semibold text-sm">Nota Fiscal</p>
                  {record.nf_file ? (
                    <p className="text-xs text-green-600 font-medium">Anexada</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Não anexada</p>
                  )}
                </div>
              </div>

              {uploading ? (
                <div className="w-24">
                  <Progress value={progress} className="h-2" />
                </div>
              ) : record.nf_file ? (
                <Dialog open={nfPreviewOpen} onOpenChange={setNfPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4 mr-2 hidden sm:block" />
                      Visualizar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Visualização da Nota Fiscal</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center relative">
                      {isPdf ? (
                        <iframe src={nfUrl!} className="w-full h-full border-0" title="NF PDF" />
                      ) : (
                        <img
                          src={nfUrl!}
                          alt="NF"
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleUpload}
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Anexar NF</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewDialog({
  user,
  workshop,
  recordId,
  onSuccess,
}: {
  user: any
  workshop: any
  recordId: string
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createReview({
        user: user.id,
        workshop: workshop.id,
        service_record: recordId,
        rating,
        comment,
      })
      toast.success('Avaliação enviada com sucesso!')
      onSuccess()
    } catch (err) {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Avaliar Serviço</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Como foi o serviço em <strong>{workshop.name}</strong>?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-8 h-8',
                    rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Comentário (opcional)</Label>
          <Textarea
            placeholder="Conte um pouco sobre sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
          />
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </div>
    </DialogContent>
  )
}
