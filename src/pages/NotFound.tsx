import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota não existente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-indigo-600 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Página não encontrada</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        A etapa de análise ou o projeto que você está procurando foi removido ou não existe mais.
      </p>
      <Button asChild size="lg" className="shadow-md">
        <Link to="/">Voltar ao Dashboard</Link>
      </Button>
    </div>
  )
}

export default NotFound
