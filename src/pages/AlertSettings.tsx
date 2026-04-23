import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { getAlertSettings, saveAlertSettings, UserAlertSettings } from '@/services/alerts'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Label } from '@/components/ui/label'

const defaultItems = [
  'Óleo',
  'Filtro de Ar',
  'Filtro de Cabine',
  'Pneus',
  'Pastilhas de Freio',
  'Correia Dentada',
]

export default function AlertSettings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Partial<UserAlertSettings>>({
    enabled: true,
    default_threshold_km: '500',
    item_preferences: Object.fromEntries(defaultItems.map((i) => [i, true])),
  })

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const data = await getAlertSettings(user.id)
        if (data) {
          setSettings(data)
        }
      } catch (e) {
        // use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveAlertSettings({ ...settings, user: user.id })
      toast.success('Configurações salvas com sucesso!')
      navigate('/perfil')
    } catch (e) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const toggleItem = (item: string) => {
    setSettings((prev) => ({
      ...prev,
      item_preferences: {
        ...prev.item_preferences,
        [item]: !prev.item_preferences?.[item],
      },
    }))
  }

  return (
    <div className="flex flex-col min-h-full animate-fade-in pb-20">
      <Header />
      <div className="p-5 space-y-6 mt-2 flex-1">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/perfil')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-primary">Configurações de Alertas</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <Card className="p-5 space-y-6 shadow-soft border-none rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <Label className="text-base font-semibold">Ativar notificações push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas sobre a manutenção do seu veículo.
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(c) => setSettings((s) => ({ ...s, enabled: c }))}
                  />
                </div>

                {settings.enabled && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label className="text-base font-semibold">Antecedência padrão</Label>
                    <p className="text-sm text-muted-foreground">
                      Com quantos quilômetros de antecedência deseja ser avisado?
                    </p>
                    <Select
                      value={settings.default_threshold_km}
                      onValueChange={(v: any) =>
                        setSettings((s) => ({ ...s, default_threshold_km: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">300 km</SelectItem>
                        <SelectItem value="500">500 km</SelectItem>
                        <SelectItem value="1000">1000 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>

              {settings.enabled && (
                <Card className="p-5 space-y-4 shadow-soft border-none rounded-xl">
                  <Label className="text-base font-semibold">Preferências por Item</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione quais itens deseja monitorar.
                  </p>
                  <div className="space-y-4">
                    {defaultItems.map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <Label
                          className="text-sm font-medium leading-none cursor-pointer"
                          onClick={() => toggleItem(item)}
                        >
                          {item}
                        </Label>
                        <Switch
                          checked={settings.item_preferences?.[item] ?? false}
                          onCheckedChange={() => toggleItem(item)}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end md:mt-4">
              <Button
                className="w-full md:w-auto md:min-w-[200px] h-12 text-lg rounded-xl shadow-soft"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
