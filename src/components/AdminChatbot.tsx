import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  text: string
  sender: 'user' | 'agent'
}

export function AdminChatbot() {
  const { profile, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá, Admin! Sou seu assistente de dados. Pergunte qualquer coisa sobre as transações do sistema e consultarei o banco de dados em tempo real para você.',
      sender: 'agent',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  if (profile?.role !== 'admin') return null

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')

    setMessages((prev) => [...prev, { id: Date.now().toString(), text: userMsg, sender: 'user' }])
    setIsLoading(true)

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (!webhookUrl || webhookUrl.includes('example.com')) {
        // Mock se não houver URL real configurada
        await new Promise((r) => setTimeout(r, 1500))
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `[SIMULAÇÃO] O webhook do n8n não está configurado. Configure a variável VITE_N8N_WEBHOOK_URL no .env.\n\nSua pergunta foi: "${userMsg}"`,
            sender: 'agent',
          },
        ])
      } else {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg, userId: user?.id, email: user?.email }),
        })

        if (!res.ok) throw new Error(`Falha na comunicação (Status ${res.status})`)
        const data = await res.json()

        // n8n pode retornar em diferentes formatos dependendo do nó de webhook
        const replyText =
          data.reply ||
          data.output ||
          data.message ||
          (typeof data === 'string' ? data : JSON.stringify(data))

        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: replyText, sender: 'agent' },
        ])
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Erro ao conectar com o assistente n8n: ${error.message}. Verifique se o webhook está ativo e respondendo.`,
          sender: 'agent',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Assistente Administrativo</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-current hover:bg-black/20 dark:hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[90%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground self-end rounded-br-none'
                    : 'bg-muted text-foreground self-start rounded-bl-none',
                )}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted text-muted-foreground self-start rounded-2xl rounded-bl-none px-4 py-2 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando dados...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card flex gap-2 shrink-0">
            <Input
              placeholder="Pergunte sobre os dados..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              className="rounded-full bg-background"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-full shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!isOpen && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
          onClick={() => setIsOpen(true)}
          title="Assistente de Dados (Apenas Admin)"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
