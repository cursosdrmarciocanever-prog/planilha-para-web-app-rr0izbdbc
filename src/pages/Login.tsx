import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Infinity as InfinityIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, session } = useAuth()
  const navigate = useNavigate()

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <InfinityIcon className="w-10 h-10 text-primary stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Clínica Canever</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Financeiro</p>
        </div>

        <Card className="border-border/60 shadow-lg rounded-2xl overflow-hidden bg-card">
          <CardHeader className="space-y-1 pb-6 px-8 pt-8">
            <CardTitle className="text-2xl font-bold">Acessar sistema</CardTitle>
            <CardDescription className="text-base">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border-none rounded-xl"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@canever.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary/30 border-border focus-visible:ring-primary rounded-xl px-4"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Senha
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-secondary/30 border-border focus-visible:ring-primary rounded-xl px-4"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl shadow-sm mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
