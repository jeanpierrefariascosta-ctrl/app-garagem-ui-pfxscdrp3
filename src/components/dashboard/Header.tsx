import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BellRing } from 'lucide-react'

export function Header() {
  return (
    <header className="px-5 py-6 flex items-center justify-between bg-primary text-primary-foreground rounded-b-3xl shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary-foreground/20 ring-2 ring-transparent transition-all hover:ring-primary-foreground/40">
          <AvatarImage
            src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1"
            alt="Ana Silva"
          />
          <AvatarFallback className="bg-secondary text-secondary-foreground">AS</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-primary-foreground/80 font-medium">Olá,</p>
          <h1 className="text-xl font-bold tracking-tight">Ana Silva</h1>
        </div>
      </div>
      <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
        <BellRing className="w-5 h-5" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-primary"></span>
      </button>
    </header>
  )
}
