import { useState, useCallback } from 'react'
import { toast } from 'sonner'

const EVOLUTION_API_URL = 'https://evo-proxy-67kziszg.manus.space'

interface SendMessageParams {
  instanceName: string
  phoneNumber: string
  message: string
}

interface QRCodeResponse {
  success: boolean
  base64?: string
  connected?: boolean
  message: string
  cached?: boolean
  retries?: number
}

interface HealthResponse {
  status: 'ok' | 'error'
  latencyMs: number
  message: string
  instances?: any[]
}

/**
 * Hook para integração com Evolution Proxy API
 * Fornece funções para enviar mensagens WhatsApp, gerar QR Code e verificar saúde
 */
export function useEvolutionApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Enviar mensagem WhatsApp
   * @param params - Parâmetros da mensagem (instanceName, phoneNumber, message)
   * @returns true se enviado com sucesso, false caso contrário
   */
  const sendMessage = useCallback(async (params: SendMessageParams): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        const errorMsg = data.message || 'Erro desconhecido ao enviar mensagem'
        setError(errorMsg)
        toast.error(`Erro ao enviar: ${errorMsg}`)
        return false
      }

      toast.success('Mensagem enviada com sucesso! ✅')
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao conectar com Evolution API'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Erro ao enviar mensagem:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Gerar QR Code para conectar WhatsApp
   * @param instanceName - Nome da instância
   * @returns Dados do QR Code ou null se falhar
   */
  const getQRCode = useCallback(async (instanceName: string): Promise<QRCodeResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/api/qr-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: QRCodeResponse = await response.json()

      if (!data.success) {
        setError(data.message)
        toast.error(`Erro: ${data.message}`)
        return null
      }

      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao gerar QR Code'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Erro ao gerar QR Code:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Verificar saúde da Evolution API
   * @returns true se API está online, false caso contrário
   */
  const checkHealth = useCallback(async (): Promise<HealthResponse | null> => {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/api/health`)

      if (!response.ok) {
        return {
          status: 'error',
          latencyMs: -1,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data: HealthResponse = await response.json()
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao conectar'
      return {
        status: 'error',
        latencyMs: -1,
        message: errorMsg,
      }
    }
  }, [])

  /**
   * Obter logs de requisições
   * @returns Array de logs ou null se falhar
   */
  const getLogs = useCallback(async (): Promise<any[] | null> => {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/api/logs`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Erro ao obter logs:', err)
      return null
    }
  }, [])

  return {
    sendMessage,
    getQRCode,
    checkHealth,
    getLogs,
    loading,
    error,
  }
}
