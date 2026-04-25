import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  MessageSquare,
  Flame,
  ThermometerSun,
  Snowflake,
  Bot,
  Download,
  Filter,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchLeads, deleteLead } from '@/services/crm'
import type { CrmLead, PipelineStage, LeadClassification, LeadSource } from '@/types/crm'
import { PIPELINE_STAGES, LEAD_SOURCES, CLASSIFICATION_OPTIONS } from '@/types/crm'
import { LeadDetailDialog } from '@/components/crm/LeadDetailDialog'
import { NewLeadDialog } from '@/components/crm/NewLeadDialog'

export function CrmLeadsList() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newLeadOpen, setNewLeadOpen] = useState(false)

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      const filters: any = { limit: 100 }
      if (search) filters.search = search
      if (stageFilter !== 'all') filters.pipeline_stage = stageFilter
      if (classFilter !== 'all') filters.classification = classFilter
      if (sourceFilter !== 'all') filters.source = sourceFilter

      const { data, count } = await fetchLeads(filters)
      setLeads(data)
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }, [search, stageFilter, classFilter, sourceFilter])

  useEffect(() => {
    const timer = setTimeout(loadLeads, 300)
    return () => clearTimeout(timer)
  }, [loadLeads])

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
      toast.success('Lead removido')
    } catch (err) {
      toast.error('Erro ao remover lead')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStageFilter('all')
    setClassFilter('all')
    setSourceFilter('all')
  }

  const hasFilters =
    search || stageFilter !== 'all' || classFilter !== 'all' || sourceFilter !== 'all'

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'quente':
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200 gap-1">
            <Flame className="w-3 h-3" /> Quente
          </Badge>
        )
      case 'morno':
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 gap-1">
            <ThermometerSun className="w-3 h-3" /> Morno
          </Badge>
        )
      case 'frio':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-blue-200 gap-1">
            <Snowflake className="w-3 h-3" /> Frio
          </Badge>
        )
      default:
        return <Badge variant="outline">{classification}</Badge>
    }
  }

  const getStageBadge = (stage: PipelineStage) => {
    const stageConfig = PIPELINE_STAGES.find((s) => s.key === stage)
    if (!stageConfig) return <Badge variant="outline">{stage}</Badge>
    return (
      <Badge className={`${stageConfig.bgColor} ${stageConfig.color} border`}>
        {stageConfig.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Etapas</SelectItem>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CLASSIFICATION_OPTIONS.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Origens</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button onClick={() => setNewLeadOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalCount} lead{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                )}
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedLead(lead)
                      setDetailOpen(true)
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lead.name}</span>
                        {lead.ai_qualified && <Bot className="w-3.5 h-3.5 text-purple-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {lead.whatsapp && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-green-500" />
                            {lead.whatsapp}
                          </span>
                        )}
                        {lead.email && (
                          <span className="text-muted-foreground truncate max-w-[180px]">
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStageBadge(lead.pipeline_stage)}</TableCell>
                    <TableCell>{getClassificationBadge(lead.classification)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="h-2 rounded-full bg-muted" style={{ width: '60px' }}>
                          <div
                            className={`h-2 rounded-full ${
                              lead.score >= 70
                                ? 'bg-green-500'
                                : lead.score >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">
                        {LEAD_SOURCES.find((s) => s.key === lead.source)?.label || lead.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs truncate max-w-[120px] block">
                        {lead.interest || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={loadLeads}
        />
      )}

      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} onCreated={loadLeads} />
    </div>
  )
}
