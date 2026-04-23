import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, CheckCircle2, Wrench, XCircle, Settings, Clock } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { getNotifications, updateNotification, Notification } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Alerts() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('notifications', () => {
    loadData()
  })

  const handleAction = async (id: string, action: 'action_taken' | 'ignored') => {
    try {
      await updateNotification(id, { action_status: action, read_at: new Date().toISOString() })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const renderAlerts = (filterStatus: string[]) => {
    const filtered = notifications.filter((n) => filterStatus.includes(n.action_status))

    if (loading) {
      return (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 flex gap-4 border-none shadow-soft rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (filtered.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-8 text-center shadow-soft border border-border flex flex-col items-center justify-center min-h-[300px] mt-4">
          <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
            <BellRing className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Nenhum alerta</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Tudo certo por aqui! Continue acompanhando a saúde do seu veículo.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4 mt-4 max-w-2xl mx-auto w-full">
        {filtered.map((notif) => (
          <Card
            key={notif.id}
            className="p-4 shadow-soft border-none rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    notif.action_status === 'none'
                      ? 'bg-primary/10 text-primary'
                      : notif.action_status === 'action_taken'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                  }
                `}
                >
                  {notif.action_status === 'none' ? (
                    <Wrench className="w-5 h-5" />
                  ) : notif.action_status === 'action_taken' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold text-foreground text-[15px] leading-tight">
                    {notif.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{notif.body}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(notif.sent_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {notif.action_status === 'none' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 h-9 rounded-lg text-xs"
                      onClick={() => {
                        handleAction(notif.id, 'action_taken')
                        navigate('/cotacao')
                      }}
                    >
                      Solicitar Cotação
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-lg text-xs"
                      onClick={() => handleAction(notif.id, 'ignored')}
                    >
                      Ignorar
                    </Button>
                  </div>
                )}

                {notif.action_status === 'action_taken' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wider mt-2">
                    Ação Tomada
                  </div>
                )}

                {notif.action_status === 'ignored' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mt-2">
                    Ignorado
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full animate-fade-in pb-20">
      <Header />
      <div className="px-4 py-5 space-y-6 mt-2 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Alertas
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('/perfil/alertas')}>
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">
              Todos
            </TabsTrigger>
            <TabsTrigger value="action_taken" className="rounded-lg text-xs font-semibold">
              Tratados
            </TabsTrigger>
            <TabsTrigger value="ignored" className="rounded-lg text-xs font-semibold">
              Ignorados
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[400px] relative">
            <TabsContent value="all" className="animate-fade-in-up mt-0 absolute w-full top-0">
              {renderAlerts(['none', 'action_taken', 'ignored'])}
            </TabsContent>

            <TabsContent
              value="action_taken"
              className="animate-fade-in-up mt-0 absolute w-full top-0"
            >
              {renderAlerts(['action_taken'])}
            </TabsContent>

            <TabsContent value="ignored" className="animate-fade-in-up mt-0 absolute w-full top-0">
              {renderAlerts(['ignored'])}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
