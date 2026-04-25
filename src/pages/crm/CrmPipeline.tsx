import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  ArrowRight,
  Flame,
  ThermometerSun,
  Snowflake,
  Bot,
  Eye,
  Trash2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchLeads, updateLeadStage, deleteLead } from '@/services/crm'
import type { CrmLead, PipelineStage } from '@/types/crm'
import { PIPELINE_STAGES } from '@/types/crm'
import { LeadDetailDialog } from '@/components/crm/LeadDetailDialog'

export function CrmPipeline() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await fetchLeads({ limit: 500 })
      setLeads(data)
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const handleMoveStage = async (leadId: string, newStage: PipelineStage) => {
    try {
      await updateLeadStage(leadId, newStage)
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, pipeline_stage: newStage } : l)),
      )
      toast.success(`Lead movido para "${PIPELINE_STAGES.find((s) => s.key === newStage)?.label}"`)
    } catch (err) {
      toast.error('Erro ao mover lead')
    }
  }

  const handleDelete = async (leadId: string) => {
    try {
      await deleteLead(leadId)
      setLeads((prev) => prev.filter((l) => l.id !== leadId))
      toast.success('Lead removido')
    } catch (err) {
      toast.error('Erro ao remover lead')
    }
  }

  const getLeadsByStage = (stage: PipelineStage) => leads.filter((l) => l.pipeline_stage === stage)

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'quente':
        return <Flame className="w-3.5 h-3.5 text-red-500" />
      case 'morno':
        return <ThermometerSun className="w-3.5 h-3.5 text-yellow-500" />
      case 'frio':
        return <Snowflake className="w-3.5 h-3.5 text-blue-500" />
      default:
        return null
    }
  }

  const getNextStages = (currentStage: PipelineStage): PipelineStage[] => {
    const stageOrder: PipelineStage[] = [
      'novo',
      'contatado',
      'qualificando',
      'qualificado',
      'agendado',
      'convertido',
    ]
    const currentIndex = stageOrder.indexOf(currentStage)
    const next = stageOrder.slice(currentIndex + 1)
    if (currentStage !== 'perdido') {
      next.push('perdido')
    }
    return next
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{leads.length} leads no pipeline</p>
        <Button variant="outline" size="sm" onClick={loadLeads} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.key)
          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-[280px] rounded-xl border ${stage.bgColor} p-3`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${stage.color}`}>{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stageLeads.length}
                </Badge>
              </div>

              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-2 pr-2">
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      Nenhum lead
                    </div>
                  )}
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition-all border bg-background"
                      onClick={() => {
                        setSelectedLead(lead)
                        setDetailOpen(true)
                      }}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            {getClassificationIcon(lead.classification)}
                            <span className="font-medium text-sm truncate max-w-[160px]">
                              {lead.name}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLead(lead)
                                  setDetailOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {getNextStages(lead.pipeline_stage).map((nextStage) => (
                                <DropdownMenuItem
                                  key={nextStage}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMoveStage(lead.id, nextStage)
                                  }}
                                >
                                  <ChevronRight className="w-4 h-4 mr-2" />
                                  Mover para{' '}
                                  {PIPELINE_STAGES.find((s) => s.key === nextStage)?.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(lead.id)
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-wrap gap-1.5">
                          {lead.whatsapp && (
                            <Badge variant="outline" className="text-[10px] gap-1 py-0">
                              <MessageSquare className="w-2.5 h-2.5" />
                              WhatsApp
                            </Badge>
                          )}
                          {lead.email && (
                            <Badge variant="outline" className="text-[10px] gap-1 py-0">
                              <Mail className="w-2.5 h-2.5" />
                              Email
                            </Badge>
                          )}
                          {lead.ai_qualified && (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 py-0 bg-purple-50 text-purple-600 border-purple-200"
                            >
                              <Bot className="w-2.5 h-2.5" />
                              IA
                            </Badge>
                          )}
                        </div>

                        {/* Score & Source */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>
                            Score: <strong className="text-foreground">{lead.score}/100</strong>
                          </span>
                          <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                        </div>

                        {/* Interest */}
                        {lead.interest && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {lead.interest}
                          </p>
                        )}

                        {/* Date */}
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={loadLeads}
        />
      )}
    </div>
  )
}
