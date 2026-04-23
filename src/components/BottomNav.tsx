import { Home, Bell, Calendar, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getUnreadNotifications } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

export function BottomNav() {
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
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bell, label: 'Alertas', path: '/alertas' },
    { icon: Calendar, label: 'Agendamentos', path: '/agendamentos' },
    { icon: User, label: 'Perfil', path: '/perfil' },
  ]

  return (
    <nav className="absolute bottom-0 w-full bg-card border-t flex justify-around py-3 px-2 z-20 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-200',
              isActive
                ? 'text-secondary scale-105'
                : 'text-muted-foreground hover:text-foreground hover:scale-105',
            )}
          >
            <div className="relative">
              <item.icon className={cn('w-5 h-5', isActive && 'fill-secondary/10')} />
              {item.label === 'Alertas' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
