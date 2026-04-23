import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Layout from './components/Layout'
import Index from './pages/Index'
import Alerts from './pages/Alerts'
import Schedules from './pages/Schedules'
import Profile from './pages/Profile'
import AlertSettings from './pages/AlertSettings'
import MaintenancePlan from './pages/MaintenancePlan'
import QuoteRequest from './pages/QuoteRequest'
import QuoteDashboard from './pages/QuoteDashboard'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { ProtectedRoute } from './components/ProtectedRoute'
import { WorkshopRoute } from './components/WorkshopRoute'
import WorkshopDashboard from './pages/WorkshopDashboard'
import { VehicleProvider } from './stores/use-vehicle-store'
import { AuthProvider } from './hooks/use-auth'
import { GlobalAlerts } from './components/GlobalAlerts'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <GlobalAlerts />
      <TooltipProvider>
        <VehicleProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/alertas" element={<Alerts />} />
                <Route path="/agendamentos" element={<Schedules />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/perfil/alertas" element={<AlertSettings />} />
                <Route path="/plano" element={<MaintenancePlan />} />
                <Route path="/cotacao" element={<QuoteRequest />} />
                <Route path="/cotacao/:id" element={<QuoteDashboard />} />
              </Route>
            </Route>

            <Route element={<WorkshopRoute />}>
              <Route path="/workshop" element={<WorkshopDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </VehicleProvider>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
