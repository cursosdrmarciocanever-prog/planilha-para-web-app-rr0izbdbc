import { useState, useEffect, useCallback } from 'react'
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Clock, ServerCrash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { format, parseISO, subDays, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

interface LogAutomacao {
  id: string
  timestamp: string
  funcao: string
  status: 'sucesso' | 'erro' | 'pendente'
  mensagem_erro: string | null
}

export default function Monitoramento() {
  const [logs, setLogs] = useState<LogAutomacao[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [period, setPeriod] = useState('24h')
  const [statusFilter, setStatusFilter] = useState('all')
  const [functionFilter, setFunctionFilter] = useState('all')

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchLogs = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      let query = supabase.from('logs_automacao').select('*', { count: 'exact' })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (functionFilter !== 'all') {
        query = query.eq('funcao', functionFilter)
      }

      if (period !== 'all') {
        const now = new Date()
        let fromDate
        if (period === '24h') fromDate = subHours(now, 24)
        if (period === '7d') fromDate = subDays(now, 7)
        if (period === '30d') fromDate = subDays(now, 30)

        if (fromDate) {
          query = query.gte('timestamp', fromDate.toISOString())
        }
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      query = query.order('timestamp', { ascending: false }).range(from, to)

      const { data, count, error } = await query

      if (!error && data) {
        setLogs(data as LogAutomacao[])
        if (count !== null) setTotalCount(count)
      }

      setLoading(false)
      setRefreshing(false)
    },
    [period, statusFilter, functionFilter, page],
  )

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setPage(1)
  }, [period, statusFilter, functionFilter])

  const handleRefresh = () => {
    fetchLogs(true)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Sucesso
          </Badge>
        )
      case 'erro':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-medium">
            <AlertCircle className="w-3 h-3 mr-1.5" /> Erro
          </Badge>
        )
      case 'pendente':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none font-medium">
            <Clock className="w-3 h-3 mr-1.5" /> Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Monitoramento de Automações
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Acompanhe o histórico de execução das tarefas automáticas do sistema.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="gap-2 rounded-full shadow-sm bg-background"
          disabled={loading || refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm rounded-3xl bg-card mb-6 overflow-hidden">
        <CardContent className="p-5 flex flex-col md:flex-row gap-5 items-end md:items-center bg-secondary/10">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Período
            </label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-background border-border/50 h-11 rounded-xl">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background border-border/50 h-11 rounded-xl">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="erro">Erro</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Função
            </label>
            <Select value={functionFilter} onValueChange={setFunctionFilter}>
              <SelectTrigger className="bg-background border-border/50 h-11 rounded-xl">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Funções</SelectItem>
                <SelectItem value="verificar_contas_vencidas">verificar_contas_vencidas</SelectItem>
                <SelectItem value="enviar_email_lembrete">enviar_email_lembrete</SelectItem>
                <SelectItem value="agendar_lembretes_automaticos">
                  agendar_lembretes_automaticos
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm rounded-3xl bg-card flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/40 bg-secondary/5 flex justify-between items-center">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <ServerCrash className="w-4 h-4 text-muted-foreground" /> Logs de Execução
          </h2>
          <span className="text-sm text-muted-foreground font-medium">
            Total: {totalCount} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center opacity-70">
            <div className="bg-secondary p-5 rounded-full mb-4">
              <Activity className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum log encontrado</h3>
            <p className="text-muted-foreground max-w-sm">
              Não existem registros de automação para os filtros selecionados no momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider h-12">
                    Data/Hora
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider h-12">
                    Função
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider h-12">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider h-12">
                    Mensagem de Erro
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-secondary/10 transition-colors border-border/40"
                  >
                    <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                      {format(parseISO(log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border/50 font-mono">
                        {log.funcao}
                      </span>
                    </TableCell>
                    <TableCell>{renderStatusBadge(log.status)}</TableCell>
                    <TableCell className="max-w-[300px]">
                      {log.mensagem_erro ? (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help text-sm text-muted-foreground border-b border-dashed border-muted-foreground/50 inline-block pb-0.5">
                                {log.mensagem_erro}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px] break-words p-3 shadow-lg">
                              <p className="text-sm leading-relaxed">{log.mensagem_erro}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-border/40 bg-secondary/5 mt-auto">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  )
}
