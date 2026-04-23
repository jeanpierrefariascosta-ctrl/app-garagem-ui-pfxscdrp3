import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Layout from './components/Layout'
import Index from './pages/Index'
import Alerts from './pages/Alerts'
import Schedules from './pages/Schedules'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { VehicleProvider } from './stores/use-vehicle-store'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <VehicleProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/agendamentos" element={<Schedules />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </VehicleProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
