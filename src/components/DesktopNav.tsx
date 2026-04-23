import { Link, useLocation } from 'react-router-dom'
import { Home, Bell, Calendar, User, Map, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { getUnreadNotifications } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'

export function DesktopNav() {
  const location = useLocation()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const loadUnread = async () => {
    if (!user) return
    try {
      const res = await getUnreadNotifications()
      setUnreadCount(res.totalItems)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadUnread()
  }, [user])
  useRealtime('notifications', () => {
    loadUnread()
  })

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Bell, label: 'Alertas', path: '/alertas' },
    { icon: Calendar, label: 'Agendamentos', path: '/agendamentos' },
    { icon: Map, label: 'Roadmap', path: '/roadmap' },
    { icon: User, label: 'Meu Perfil', path: '/perfil' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-background border-r shadow-soft z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <Wrench className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-foreground">Garagem</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4 px-2">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <div className="relative flex items-center justify-center">
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-110',
                    isActive ? 'fill-primary/10' : '',
                  )}
                />
                {item.label === 'Alertas' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
              {user.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
