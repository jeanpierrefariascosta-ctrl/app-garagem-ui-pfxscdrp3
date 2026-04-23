import { User, Settings, Shield, LogOut, ChevronRight, Bell } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Profile() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const menuItems = [
    { icon: User, label: 'Meus Dados', onClick: () => {} },
    { icon: Bell, label: 'Configurações de Alertas', onClick: () => navigate('/perfil/alertas') },
    { icon: Shield, label: 'Privacidade e Segurança', onClick: () => {} },
    { icon: Settings, label: 'Configurações', onClick: () => {} },
  ]

  return (
    <div className="flex flex-col min-h-full animate-fade-in pb-10">
      <Header />
      <div className="p-5 space-y-6 mt-2">
        <h2 className="text-2xl font-bold text-primary">Perfil</h2>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg px-1">Menu</h3>
            {menuItems.map((item, i) => (
              <Card
                key={i}
                onClick={item.onClick}
                className="flex items-center justify-between p-4 border-none shadow-soft hover:bg-muted/30 transition-colors cursor-pointer rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg px-1">Conta</h3>
            <Card
              onClick={signOut}
              className="flex items-center justify-between p-4 border-none shadow-soft hover:bg-destructive/5 transition-colors cursor-pointer rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-semibold text-destructive">Sair do aplicativo</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
