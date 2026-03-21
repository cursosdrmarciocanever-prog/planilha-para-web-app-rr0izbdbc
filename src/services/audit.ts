import { supabase } from '@/lib/supabase/client'

export type AuditEntity =
  | 'transacao'
  | 'paciente'
  | 'funcionario'
  | 'sala'
  | 'ocupacao'
  | 'importacao'
  | 'registro_diario'

/**
 * Função utilitária para registrar ações de auditoria no sistema.
 * @param action Descrição textual da ação (ex: 'Criou paciente', 'Excluiu sala')
 * @param entity A entidade ou módulo afetado
 * @param entity_id (Opcional) O ID do registro afetado
 */
export const logAction = async (action: string, entity: AuditEntity, entity_id?: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action,
      entity,
      entity_id,
    })
  } catch (error) {
    console.error('Failed to log audit action:', error)
  }
}
