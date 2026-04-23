import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-200 flex justify-center items-start sm:py-8">
      {/* Mobile Constrained Wrapper for Desktop Viewing */}
      <div className="w-full max-w-[450px] bg-background sm:rounded-[2rem] sm:shadow-2xl sm:h-[850px] sm:max-h-[90vh] h-screen relative flex flex-col overflow-hidden ring-1 ring-border/50">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
