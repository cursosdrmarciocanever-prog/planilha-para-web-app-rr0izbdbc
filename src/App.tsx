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
import HomePublic from './pages/public/Home'
import Sobre from './pages/public/Sobre'
import Servicos from './pages/public/Servicos'
import Blog from './pages/public/Blog'
import Galeria from './pages/public/Galeria'
import FAQ from './pages/public/FAQ'
import Contato from './pages/public/Contato'

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
          {/* Public Routes */}
          <Route path="/" element={<HomePublic />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contato" element={<Contato />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/admin/faturamento" element={<Faturamento />} />
              <Route path="/admin/diario" element={<Diario />} />
              <Route path="/admin/raio-x" element={<RaioX />} />
              <Route path="/admin/despesas" element={<Despesas />} />
              <Route path="/admin/custo" element={<Custo />} />
              <Route path="/admin/precisao" element={<Precisao />} />
              <Route path="/admin/taxa" element={<TaxaSala />} />
              <Route path="/admin/medicamentos" element={<Medicamentos />} />
              <Route path="/admin/importar" element={<Importar />} />
              <Route path="/admin/monitoramento" element={<Monitoramento />} />
            </Route>
          </Route>
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
