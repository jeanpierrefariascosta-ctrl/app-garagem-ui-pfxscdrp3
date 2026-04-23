import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BellRing, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, signOut } = useAuth()

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário'
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'
  const avatarUrl = user?.avatar
    ? `/api/files/users/${user.id}/${user.avatar}`
    : `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${user?.id || 1}`

  return (
    <header className="px-5 py-6 flex items-center justify-between bg-primary text-primary-foreground rounded-b-3xl shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary-foreground/20 ring-2 ring-transparent transition-all hover:ring-primary-foreground/40">
          <AvatarImage src={avatarUrl} alt={user?.name || ''} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-primary-foreground/80 font-medium">Olá,</p>
          <h1 className="text-xl font-bold tracking-tight">{user?.name || 'Usuário'}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
          <BellRing className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-primary"></span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="hover:bg-white/10 rounded-full"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
