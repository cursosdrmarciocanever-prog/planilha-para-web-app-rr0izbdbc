import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useEvolutionApi } from '@/hooks/use-evolution-api'
import { toast } from 'sonner'

interface WhatsAppNotificationProps {
  /** Número de telefone pré-preenchido (com +55) */
  defaultPhone?: string
  /** Mensagem pré-preenchida */
  defaultMessage?: string
  /** Callback quando mensagem é enviada com sucesso */
  onSuccess?: () => void
  /** Callback quando há erro */
  onError?: (error: string) => void
  /** Texto do botão */
  buttonText?: string
  /** Variante do botão */
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  /** Tamanho do botão */
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  /** Instância WhatsApp a usar */
  instanceName?: string
  /** Se deve abrir o diálogo automaticamente */
  autoOpen?: boolean
}

/**
 * Componente para enviar notificações via WhatsApp
 * Integrado com Evolution Proxy API
 */
export function WhatsAppNotification({
  defaultPhone = '',
  defaultMessage = '',
  onSuccess,
  onError,
  buttonText = 'Enviar WhatsApp',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  instanceName = 'clinica-canever',
  autoOpen = false,
}: WhatsAppNotificationProps) {
  const [open, setOpen] = useState(autoOpen)
  const [phone, setPhone] = useState(defaultPhone)
  const [message, setMessage] = useState(defaultMessage)
  const [charCount, setCharCount] = useState(defaultMessage.length)
  const { sendMessage, loading } = useEvolutionApi()

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setMessage(text)
    setCharCount(text.length)
  }

  const handleSend = async () => {
    // Validação
    if (!phone.trim()) {
      toast.error('Por favor, insira um número de telefone')
      onError?.('Telefone vazio')
      return
    }

    if (!message.trim()) {
      toast.error('Por favor, insira uma mensagem')
      onError?.('Mensagem vazia')
      return
    }

    // Validar formato do telefone (básico)
    if (!phone.includes('+') || phone.length < 10) {
      toast.error('Telefone inválido. Use o formato: +5544999999999')
      onError?.('Formato de telefone inválido')
      return
    }

    // Enviar mensagem
    const success = await sendMessage({
      instanceName,
      phoneNumber: phone,
      message,
    })

    if (success) {
      setOpen(false)
      setPhone(defaultPhone)
      setMessage(defaultMessage)
      setCharCount(defaultMessage.length)
      onSuccess?.()
    } else {
      onError?.('Erro ao enviar mensagem')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset ao abrir
      setPhone(defaultPhone)
      setMessage(defaultMessage)
      setCharCount(defaultMessage.length)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className="gap-2">
          <MessageCircle className="w-4 h-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Enviar Mensagem WhatsApp
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação via WhatsApp para o paciente. Use o formato +55 com DDD.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de Telefone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Número de Telefone *
            </label>
            <Input
              id="phone"
              placeholder="+5544999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              type="tel"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Formato: +55 + DDD + 9 + número (ex: +5544999999999)
            </p>
          </div>

          {/* Campo de Mensagem */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="text-sm font-medium">
                Mensagem *
              </label>
              <span className="text-xs text-muted-foreground">
                {charCount}/1000
              </span>
            </div>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={handleMessageChange}
              disabled={loading}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Máximo 1000 caracteres
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !phone.trim() || !message.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {/* Dica de Uso */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Dica:</p>
            <p className="text-blue-800 dark:text-blue-200">
              Use quebras de linha para melhor formatação. A mensagem será enviada exatamente como digitada.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
