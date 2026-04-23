import { Home, Bell, Calendar, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()

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
            <item.icon className={cn('w-5 h-5', isActive && 'fill-secondary/10')} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
