import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Layout from './components/Layout'
import Index from './pages/Index'
import Diario from './pages/Diario'
import RaioX from './pages/RaioX'
import Custo from './pages/Custo'
import Precisao from './pages/Precisao'
import TaxaSala from './pages/TaxaSala'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/raio-x" element={<RaioX />} />
          <Route path="/custo" element={<Custo />} />
          <Route path="/precisao" element={<Precisao />} />
          <Route path="/taxa" element={<TaxaSala />} />
        </Route>
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
