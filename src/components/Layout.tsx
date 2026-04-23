import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { DesktopNav } from '@/components/DesktopNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row w-full">
      <DesktopNav />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full transition-all duration-300 relative">
        <main className="flex-1 w-full max-w-full overflow-y-auto pb-20 md:pb-8 scrollbar-hide pt-0 md:pt-8 md:px-8">
          <div className="w-full max-w-6xl mx-auto bg-background md:rounded-[2rem] md:shadow-sm md:min-h-[85vh] relative flex flex-col overflow-hidden ring-1 ring-border/50 md:ring-border/10">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
