import { useState } from 'react'
import useVehicleStore from '@/stores/use-vehicle-store'
import { Header } from '@/components/dashboard/Header'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { VehicleInfo } from '@/components/dashboard/VehicleInfo'
import { MaintenanceGrid } from '@/components/dashboard/MaintenanceGrid'
import { ActionButtons } from '@/components/dashboard/ActionButtons'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { VehicleRegistrationDrawer } from '@/components/VehicleRegistrationDrawer'

export default function Index() {
  const { vehicle, isLoading } = useVehicleStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header />

      {/* Content pulled up slightly over the header background */}
      <div className="p-5 md:p-8 space-y-7 -mt-4 md:mt-0 relative z-10">
        {!vehicle ? (
          <EmptyState onRegister={() => setIsDrawerOpen(true)} />
        ) : (
          <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 space-y-6">
              <VehicleInfo vehicle={vehicle} onChangeVehicle={() => setIsDrawerOpen(true)} />
              <div className="hidden md:block">
                <ActionButtons />
              </div>
            </div>
            <div className="md:col-span-8">
              <MaintenanceGrid />
            </div>
            <div className="md:hidden">
              <ActionButtons />
            </div>
          </div>
        )}
      </div>

      <VehicleRegistrationDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  )
}
