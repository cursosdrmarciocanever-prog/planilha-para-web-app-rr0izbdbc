import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import React from 'react'

export function useLembretes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedConta, setSelectedConta] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    const checkLembretes = async () => {
      let hasPermission = false

      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          hasPermission = true
        } else if (Notification.permission !== 'denied') {
          try {
            const permission = await Notification.requestPermission()
            hasPermission = permission === 'granted'
          } catch (e) {
            console.error('Erro ao pedir permissão de notificação', e)
          }
        }
      }

      const { data: lembretes, error } = await supabase
        .from('lembretes_contas')
        .select(`
          id,
          tipo_lembrete,
          enviado,
          conta_fixa_id,
          contas_fixas (
            id,
            descricao,
            valor,
            data_vencimento
          )
        `)
        .in('tipo_lembrete', ['push', 'ambos'])
        .eq('enviado', false)
        .order('criado_em', { ascending: true })

      if (error) {
        console.error('Erro ao buscar lembretes:', error)
        return
      }

      if (!lembretes || lembretes.length === 0) return

      const idsToUpdate: string[] = []

      for (const lembrete of lembretes) {
        const conta = lembrete.contas_fixas as any
        if (!conta) continue

        const title = 'Conta a Pagar'
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        const valorFormatado = formatter.format(conta.valor)
        const body = `${conta.descricao} - ${valorFormatado}`

        if (hasPermission) {
          try {
            const notification = new Notification(title, {
              body,
              icon: '/favicon.ico',
            })

            notification.onclick = (event) => {
              event.preventDefault()
              window.focus()
              setSelectedConta(conta)
              notification.close()
            }
          } catch (e) {
            console.error('Erro ao exibir notificação', e)
          }
        } else {
          toast({
            title,
            description: body,
            action: React.createElement(
              'button',
              {
                onClick: () => setSelectedConta(conta),
                className:
                  'bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-xs rounded-md font-medium',
              },
              'Ver Detalhes',
            ),
          })
        }

        idsToUpdate.push(lembrete.id)
      }

      if (idsToUpdate.length > 0) {
        await supabase.from('lembretes_contas').update({ enviado: true }).in('id', idsToUpdate)
      }
    }

    const triggerVerificacao = async () => {
      try {
        await supabase.functions.invoke('verificar_contas_vencidas')
      } catch (e) {
        console.error('Erro ao invocar verificação de contas', e)
      }
      checkLembretes()
    }

    triggerVerificacao()

    const channel = supabase
      .channel('lembretes_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lembretes_contas' },
        () => {
          checkLembretes()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, toast])

  return { selectedConta, setSelectedConta }
}
