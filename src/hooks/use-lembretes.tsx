import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function useLembretes() {
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const checkLembretes = async () => {
      let hasPermission = false

      // Pedir permissão para Notificações Web
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

      // Buscar lembretes ainda não notificados para o usuário logado
      const { data: lembretes, error } = await supabase
        .from('lembretes_contas')
        .select(`
          id,
          tipo,
          conta_id,
          contas_fixas (
            descricao,
            valor,
            data_vencimento
          )
        `)
        .eq('notificado', false)
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

        const isVencida = lembrete.tipo === 'vencida'
        const title = isVencida ? 'Conta Vencida!' : 'Conta Próxima do Vencimento'
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        const valorFormatado = formatter.format(conta.valor)
        const body = `${conta.descricao} - ${valorFormatado}\nVencimento: ${conta.data_vencimento}`

        // Disparar notificação nativa se permitido
        if (hasPermission) {
          try {
            new Notification(title, {
              body,
              icon: '/favicon.ico',
            })
          } catch (e) {
            console.error('Erro ao exibir notificação', e)
          }
        } else {
          // Fallback para toast interno caso bloqueado ou não suportado
          toast({
            title,
            description: body,
            variant: isVencida ? 'destructive' : 'default',
          })
        }

        idsToUpdate.push(lembrete.id)
      }

      // Marcar os lembretes como notificados para evitar spam
      if (idsToUpdate.length > 0) {
        await supabase.from('lembretes_contas').update({ notificado: true }).in('id', idsToUpdate)
      }
    }

    // Opcional: Acionar a Edge Function manualmente para garantir atualização imediata
    // quando o usuário entra (útil caso o cronjob diário ainda não tenha rodado).
    const triggerVerificacao = async () => {
      try {
        await supabase.functions.invoke('verificar_contas_vencidas')
      } catch (e) {
        console.error('Erro ao invocar verificação de contas', e)
      }
      checkLembretes()
    }

    triggerVerificacao()

    // Inscrever para atualizações realtime na tabela de lembretes
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
}
