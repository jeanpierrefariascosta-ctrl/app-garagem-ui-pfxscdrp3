import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/dashboard/Header'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <div className="p-5 space-y-6 -mt-4 relative z-10">
        <Skeleton className="h-[140px] w-full rounded-2xl shadow-soft" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
