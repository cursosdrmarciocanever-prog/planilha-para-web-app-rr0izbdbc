import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { useEffect } from 'react'

import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Index from './pages/Index'
import Diario from './pages/Diario'
import RaioX from './pages/RaioX'
import Custo from './pages/Custo'
import Precisao from './pages/Precisao'
import TaxaSala from './pages/TaxaSala'
import Medicamentos from './pages/Medicamentos'
import Importar from './pages/Importar'
import Despesas from './pages/Despesas'
import Monitoramento from './pages/Monitoramento'
import Faturamento from './pages/Faturamento'

function PrintHandler() {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const printLayout = params.get('print')
    if (printLayout) {
      document.body.setAttribute('data-print-layout', printLayout)
      const timer = setTimeout(() => {
        window.print()
        const url = new URL(window.location.href)
        url.searchParams.delete('print')
        window.history.replaceState({}, '', url.pathname + url.search + url.hash)
        document.body.removeAttribute('data-print-layout')
      }, 1500) // Aguarda o carregamento dos dados antes de abrir o diálogo
      return () => clearTimeout(timer)
    }
  }, [location])

  return null
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <PrintHandler />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/faturamento" element={<Faturamento />} />
              <Route path="/diario" element={<Diario />} />
              <Route path="/raio-x" element={<RaioX />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/custo" element={<Custo />} />
              <Route path="/precisao" element={<Precisao />} />
              <Route path="/taxa" element={<TaxaSala />} />
              <Route path="/medicamentos" element={<Medicamentos />} />
              <Route path="/importar" element={<Importar />} />
              <Route path="/monitoramento" element={<Monitoramento />} />
            </Route>
          </Route>
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
