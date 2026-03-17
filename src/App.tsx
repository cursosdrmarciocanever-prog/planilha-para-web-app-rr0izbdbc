import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/store/main'

import Layout from './components/Layout'
import ProjectLayout from './pages/project/ProjectLayout'
import Index from './pages/Index'
import Structure from './pages/project/Structure'
import Rules from './pages/project/Rules'
import Functions from './pages/project/Functions'
import DataModel from './pages/project/DataModel'
import Screens from './pages/project/Screens'
import NotFound from './pages/NotFound'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/p/:id" element={<ProjectLayout />}>
              <Route index element={<Navigate to="estrutura" replace />} />
              <Route path="estrutura" element={<Structure />} />
              <Route path="regras" element={<Rules />} />
              <Route path="funcoes" element={<Functions />} />
              <Route path="dados" element={<DataModel />} />
              <Route path="telas" element={<Screens />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
