import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Download,
  Info,
  Settings,
  Plus,
  Trash2,
  History,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { logAction } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type EntityType = 'pacientes' | 'despesas' | 'produtos_servicos' | 'salas' | 'lancamentos_pacientes'

const TEMPLATES: Record<EntityType, string> = {
  pacientes:
    'nome,cpf,telefone,email,data_nascimento\nJoão Silva,12345678900,11999999999,joao@email.com,1990-01-01',
  despesas:
    'Descrição,Departamento,Fornecedor,Plano de contas,Conta contábil,Conta bancária,Categoria,Valor,Referência/Competência,Forma de pagamento,Parcelamento,Mês de competência,Data de vencimento,Data de pagamento\nMaterial de Escritório,Administrativo,Kalunga,Despesas Administrativas,1.1.01,Itaú,Materiais,150.50,Ref 01/2024,Boleto,1/1,01/2024,10/02/2024,10/02/2024',
  produtos_servicos: 'nome,descricao,preco\nConsulta Geral,Consulta de rotina,250.00',
  salas: 'nome,status,taxa_hora,taxa_dia\nSala 01,Ativa,50.00,300.00',
  lancamentos_pacientes:
    'paciente,data,categoria,numero_orcamento,profissional_orcamento,colaborador_responsavel,valor,parcelas,forma_pagamento,documento_maquina,nota_fiscal,observacoes\nMaria Silva,2024-02-15,Consultas,ORC-123,Dr. João,Pedro,250.00,1,PIX,,NF-001,Primeira consulta',
}

const REQUIRED_FIELDS: Record<EntityType, string[]> = {
  pacientes: ['nome'],
  despesas: ['descricao', 'valor'],
  produtos_servicos: ['nome'],
  salas: ['nome'],
  lancamentos_pacientes: ['paciente'],
}

export default function Importar() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('nova')
  const [entity, setEntity] = useState<EntityType | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mesReferencia, setMesReferencia] = useState('')
  const [hasValidationErrors, setHasValidationErrors] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])

  const [result, setResult] = useState<{
    success: number
    errors: number
    details: string[]
  } | null>(null)
  const [duplicateAlert, setDuplicateAlert] = useState<{
    show: boolean
    duplicates: any[]
    preparedData: any[]
  }>({ show: false, duplicates: [], preparedData: [] })

  const [rules, setRules] = useState<{ keyword: string; category: string }[]>(() => {
    const saved = localStorage.getItem('import_category_rules')
    return saved ? JSON.parse(saved) : [{ keyword: 'aluguel', category: 'Fixas' }]
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('import_category_rules', JSON.stringify(rules))
  }, [rules])

  useEffect(() => {
    if (activeTab === 'historico' && user) fetchHistory()
  }, [activeTab, user])

  const fetchHistory = async () => {
    if (!user) return
    const { data } = await supabase
      .from('import_jobs')
      .select('*')
      .like('type', 'import_%')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setHistoryData(data)
  }

  const mapHeader = (h: string, entityType: EntityType | '') => {
    let norm = h
      .toLowerCase()
      .trim()
      .replace(/ /g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    if (entityType === 'lancamentos_pacientes') {
      if (norm.includes('paciente') || norm === 'nome') return 'paciente'
      if (norm === 'data' || norm.includes('data')) return 'data_atendimento'
      if (norm === 'valor' || norm === 'preco') return 'valor'
    }
    if (entityType === 'despesas') {
      if (norm === 'descricao' || norm.includes('descri')) return 'descricao'
      if (norm.includes('departamento')) return 'departamento'
      if (norm.includes('fornecedor')) return 'fornecedor'
      if (norm.includes('plano') && norm.includes('conta')) return 'plano_contas'
      if (norm.includes('conta') && norm.includes('contabil')) return 'conta_contabil'
      if (norm.includes('conta') && norm.includes('bancaria')) return 'conta_bancaria'
      if (norm === 'categoria') return 'categoria'
      if (norm === 'valor') return 'valor'
      if (norm.includes('forma') && norm.includes('pagamento')) return 'forma_pagamento'
      if (norm.includes('mes') && norm.includes('competencia')) return 'mes_competencia'
      if (norm.includes('referencia') || norm.includes('competencia'))
        return 'referencia_competencia'
      if (norm.includes('parcelamento') || norm.includes('parcela')) return 'parcelamento'
      if (norm.includes('data') && norm.includes('pagamento')) return 'data_pagamento'
      if (norm.includes('vencimento') || norm.includes('venc')) return 'data_vencimento'
    }
    return norm
  }

  const parseNumericValue = (val: any, header: string) => {
    if (val === undefined || val === null || val === '') return null
    const strVal = String(val).trim()
    const stringHeaders = [
      'descricao',
      'departamento',
      'fornecedor',
      'plano_contas',
      'conta_contabil',
      'conta_bancaria',
      'referencia_competencia',
      'parcelamento',
      'mes_competencia',
      'data_vencimento',
      'data_pagamento',
    ]
    if (stringHeaders.includes(header)) return strVal
    if (typeof val === 'number') return val
    let cleanStr = strVal.replace(/R\$\s?/gi, '').trim()
    if (cleanStr.includes(',')) {
      const lastComma = cleanStr.lastIndexOf(',')
      const lastDot = cleanStr.lastIndexOf('.')
      if (lastComma > lastDot) {
        const dotStr = cleanStr.replace(/\./g, '').replace(',', '.')
        if (!isNaN(Number(dotStr)) && dotStr !== '') return Number(dotStr)
      } else {
        const usStr = cleanStr.replace(/,/g, '')
        if (!isNaN(Number(usStr)) && usStr !== '') return Number(usStr)
      }
    }
    if (!isNaN(Number(cleanStr)) && cleanStr !== '') return Number(cleanStr)
    return strVal
  }

  const validateAndFormatData = (data: any[], entityType: string) => {
    let hasErrors = false
    const validated = data.map((row, index) => {
      const errors: any = {}
      const formattedRow = { ...row }

      if (entityType === 'despesas') {
        if (!formattedRow.descricao) errors.descricao = 'Descrição é obrigatória'
        if (
          formattedRow.valor === undefined ||
          formattedRow.valor === null ||
          formattedRow.valor === ''
        ) {
          errors.valor = 'Valor obrigatório'
        } else if (isNaN(Number(formattedRow.valor))) {
          errors.valor = 'Deve ser número válido'
        }

        ;['data_vencimento', 'data_pagamento'].forEach((dateField) => {
          let val = formattedRow[dateField]
          if (val && typeof val === 'string') {
            if (val.includes('/')) {
              const parts = val.split('/')
              if (parts.length >= 3) {
                const parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`)
                if (!isNaN(parsedDate.getTime())) {
                  formattedRow[dateField] = parsedDate.toISOString().split('T')[0]
                } else {
                  errors[dateField] = 'Data inválida (use DD/MM/AAAA)'
                }
              } else {
                errors[dateField] = 'Formato inválido (use DD/MM/AAAA)'
              }
            } else if (val.includes('-')) {
              const parsedDate = new Date(`${val}T12:00:00Z`)
              if (isNaN(parsedDate.getTime())) {
                errors[dateField] = 'Data inválida'
              } else {
                formattedRow[dateField] = parsedDate.toISOString().split('T')[0]
              }
            }
          }
        })
      }

      if (Object.keys(errors).length > 0) hasErrors = true
      return { ...formattedRow, _errors: errors, _originalIndex: index + 2 }
    })
    return { validated, hasErrors }
  }

  const processParsedData = (data: any[]) => {
    return data.map((row) => {
      if (entity === 'despesas' && row.descricao && !row.categoria) {
        const lowerDesc = String(row.descricao).toLowerCase()
        const matchedRule = rules.find(
          (r) => r.keyword && lowerDesc.includes(r.keyword.toLowerCase()),
        )
        if (matchedRule) row.categoria = matchedRule.category
      }
      return row
    })
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    if (lines.length === 0) return []
    const parsedHeaders = lines[0].split(',').map((h) => mapHeader(h, entity))
    setHeaders(parsedHeaders)
    const data = lines.slice(1).map((line) => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      return parsedHeaders.reduce(
        (acc, header, index) => {
          let val: any = values[index]?.trim().replace(/^"|"$/g, '')
          acc[header] = parseNumericValue(val, header)
          return acc
        },
        {} as Record<string, any>,
      )
    })
    return processParsedData(data)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setResult(null)
    setHasValidationErrors(false)

    if (selectedFile) {
      const isCsv = selectedFile.name.endsWith('.csv')
      const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')

      if (!isCsv && !isExcel) {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo .CSV ou .XLSX.',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)

      if (isExcel) {
        setLoading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        try {
          const { data, error } = await supabase.functions.invoke('parse-excel', { body: formData })
          if (error) throw error

          if (data?.data?.length > 0) {
            const rawHeaders = Object.keys(data.data[0])
            const mappedHeaders = rawHeaders.map((h) => mapHeader(h, entity))
            setHeaders(mappedHeaders)

            const parsedData = data.data.map((row: any) => {
              const newRow: any = {}
              rawHeaders.forEach((h, i) => {
                newRow[mappedHeaders[i]] = parseNumericValue(row[h], mappedHeaders[i])
              })
              return newRow
            })

            const processed = processParsedData(parsedData)
            const { validated, hasErrors } = validateAndFormatData(processed, entity as string)
            setPreviewData(validated)
            setHasValidationErrors(hasErrors)
            toast({ title: 'Planilha Excel lida com sucesso' })
          } else {
            setPreviewData([])
            toast({ title: 'Planilha Vazia', description: 'Nenhum dado encontrado no arquivo.' })
          }
        } catch (err: any) {
          toast({
            title: 'Erro ao processar Excel',
            description: err.message,
            variant: 'destructive',
          })
        } finally {
          setLoading(false)
        }
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          const parsed = parseCSV(text)
          const { validated, hasErrors } = validateAndFormatData(parsed, entity as string)
          setPreviewData(validated)
          setHasValidationErrors(hasErrors)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  const handleDownloadTemplate = () => {
    if (!entity) return
    const csvContent = TEMPLATES[entity as EntityType]
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `template_${entity}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const processImport = async () => {
    if (!entity || previewData.length === 0 || hasValidationErrors) return

    setLoading(true)

    const validColumns: Record<string, string[]> = {
      despesas: [
        'descricao',
        'departamento',
        'fornecedor',
        'plano_contas',
        'conta_contabil',
        'conta_bancaria',
        'categoria',
        'valor',
        'referencia_competencia',
        'forma_pagamento',
        'parcelamento',
        'mes_competencia',
        'data_vencimento',
        'data_pagamento',
        'user_id',
      ],
    }

    const preparedData = previewData.map((row) => {
      let processedRow: any = { ...row, user_id: user?.id }
      const allowedKeys = validColumns[entity] || Object.keys(processedRow)
      const cleanRow: any = {}
      Object.keys(processedRow).forEach((key) => {
        if (allowedKeys.includes(key) && !key.startsWith('_')) {
          cleanRow[key] = processedRow[key]
        }
      })
      return cleanRow
    })

    let duplicates: any[] = []

    if (entity === 'despesas') {
      const validRows = preparedData.filter((r) => r.data_vencimento && r.descricao && r.valor)
      if (validRows.length > 0) {
        const dates = validRows.map((p) => new Date(p.data_vencimento))
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

        minDate.setDate(1)
        maxDate.setMonth(maxDate.getMonth() + 1)
        maxDate.setDate(0)

        const { data: existing } = await supabase
          .from('despesas')
          .select('descricao, data_vencimento, valor')
          .gte('data_vencimento', minDate.toISOString().split('T')[0])
          .lte('data_vencimento', maxDate.toISOString().split('T')[0])

        if (existing) {
          duplicates = preparedData.filter((row) => {
            if (!row.data_vencimento) return false
            const rowDate = new Date(row.data_vencimento)
            return existing.some((e) => {
              if (!e.data_vencimento) return false
              const eDate = new Date(e.data_vencimento)
              return (
                e.descricao?.toLowerCase().trim() === row.descricao?.toLowerCase().trim() &&
                Number(e.valor) === Number(row.valor) &&
                eDate.getMonth() === rowDate.getMonth() &&
                eDate.getFullYear() === rowDate.getFullYear()
              )
            })
          })
        }
      }
    }

    if (duplicates.length > 0) {
      setLoading(false)
      setDuplicateAlert({ show: true, duplicates, preparedData })
      return
    }

    await executeImport(preparedData)
  }

  const executeImport = async (dataToImport: any[]) => {
    setDuplicateAlert({ show: false, duplicates: [], preparedData: [] })
    setLoading(true)
    setProgress(0)
    setResult(null)

    let successCount = 0
    let errorCount = 0
    const errorDetails: string[] = []

    const chunks = []
    for (let i = 0; i < dataToImport.length; i += 50) chunks.push(dataToImport.slice(i, i + 50))

    for (let i = 0; i < chunks.length; i++) {
      const { error } = await supabase.from(entity as string).insert(chunks[i])
      if (error) {
        errorCount += chunks[i].length
        errorDetails.push(`Lote ${i + 1}: ${error.message}`)
      } else {
        successCount += chunks[i].length
      }
      setProgress(Math.round(((i + 1) / chunks.length) * 100))
    }

    const finalStatus = errorCount === 0 ? 'completed' : 'failed'
    if (user) {
      await supabase.from('import_jobs').insert({
        user_id: user.id,
        type: `import_${entity}`,
        status: finalStatus,
        total_items: dataToImport.length,
        processed_items: successCount,
        updated_at: new Date().toISOString(),
      })
    }

    setResult({ success: successCount, errors: errorCount, details: errorDetails })
    setLoading(false)
    setProgress(100)

    if (errorCount === 0) {
      toast({ title: 'Importação concluída', description: `${successCount} registros importados.` })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      toast({ title: 'Importação com erros', variant: 'destructive' })
    }
  }

  const resetState = () => {
    setFile(null)
    setPreviewData([])
    setResult(null)
    setProgress(0)
    setHasValidationErrors(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Upload className="w-8 h-8 text-primary" />
          Importação de Dados
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Traga seus dados legados de planilhas para dentro do sistema de forma rápida e segura.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="nova" className="flex gap-2">
            <Plus className="w-4 h-4" /> Nova Importação
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex gap-2">
            <History className="w-4 h-4" /> Histórico de Importações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Configuração</CardTitle>
                  <CardDescription>Selecione o tipo de dado e envie o arquivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      1. Entidade de Destino
                    </label>
                    <Select
                      value={entity}
                      onValueChange={(val: any) => {
                        setEntity(val)
                        resetState()
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="despesas">Despesas (Saídas)</SelectItem>
                      </SelectContent>
                    </Select>

                    {entity && (
                      <div className="flex flex-col gap-2 mt-4 animate-fade-in">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-9 justify-start"
                          onClick={handleDownloadTemplate}
                        >
                          <Download className="w-4 h-4 mr-2" /> Planilha Modelo (14 Colunas)
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">2. Arquivo</label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border/80 hover:border-primary/50'}`}
                    >
                      <FileText
                        className={`w-8 h-8 mb-3 ${file ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      {file ? (
                        <>
                          <p className="text-sm font-medium">{file.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetState}
                            className="mt-4 h-8 text-xs text-destructive"
                          >
                            Remover arquivo
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Clique para selecionar</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Arquivos .CSV ou .XLSX
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFileChange}
                            disabled={!entity || loading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card min-h-[400px] flex flex-col">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pré-visualização e Progresso</CardTitle>
                      <CardDescription>
                        Confirme e corrija os dados antes de importar
                      </CardDescription>
                    </div>
                    {previewData.length > 0 && !loading && !result && (
                      <Button
                        onClick={processImport}
                        disabled={hasValidationErrors}
                        className="gap-2 rounded-full h-10 px-6"
                      >
                        Iniciar Importação <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  {!file && !result && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1.5} />
                      <p className="text-base font-medium">Nenhum arquivo selecionado</p>
                    </div>
                  )}

                  {previewData.length > 0 && !result && (
                    <div className="p-6">
                      {hasValidationErrors && (
                        <Alert
                          variant="destructive"
                          className="mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="font-semibold">
                            Erros de Validação Encontrados
                          </AlertTitle>
                          <AlertDescription className="text-sm mt-1">
                            O sistema detectou inconsistências no formato dos dados. Verifique as
                            células destacadas em vermelho na tabela abaixo (passe o mouse para ver
                            o erro). Corrija em sua planilha original e faça o upload novamente.
                          </AlertDescription>
                        </Alert>
                      )}

                      {loading && (
                        <div className="mb-6 space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Processando{' '}
                              {previewData.length} registros...
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="rounded-xl border border-border/60 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-secondary/40">
                            <TableRow>
                              <TableHead className="w-12 text-center">#</TableHead>
                              {headers.slice(0, 6).map((h, i) => (
                                <TableHead
                                  key={i}
                                  className="font-semibold text-xs uppercase tracking-wider"
                                >
                                  {h.replace(/_/g, ' ')}
                                </TableHead>
                              ))}
                              {headers.length > 6 && <TableHead className="w-12">...</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.slice(0, 15).map((row, rowIndex) => {
                              const rowHasError = Object.keys(row._errors || {}).length > 0
                              return (
                                <TableRow
                                  key={rowIndex}
                                  className={rowHasError ? 'bg-red-50/30 dark:bg-red-900/10' : ''}
                                >
                                  <TableCell className="text-xs text-muted-foreground text-center font-medium">
                                    {row._originalIndex}
                                  </TableCell>
                                  {headers.slice(0, 6).map((h, colIndex) => {
                                    const errorMsg = row._errors?.[h]
                                    return (
                                      <TableCell
                                        key={colIndex}
                                        className={cn(
                                          'truncate max-w-[150px] text-sm',
                                          errorMsg
                                            ? 'border border-red-400 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-medium'
                                            : 'text-muted-foreground',
                                        )}
                                      >
                                        {errorMsg ? (
                                          <Tooltip>
                                            <TooltipTrigger className="cursor-help w-full text-left truncate">
                                              {String(row[h] || '(Vazio)')}
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-red-600 text-white font-medium border-none">
                                              {errorMsg}
                                            </TooltipContent>
                                          </Tooltip>
                                        ) : (
                                          String(row[h] || '')
                                        )}
                                      </TableCell>
                                    )
                                  })}
                                  {headers.length > 6 && (
                                    <TableCell className="text-muted-foreground">...</TableCell>
                                  )}
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      {previewData.length > 15 && (
                        <p className="text-xs text-center text-muted-foreground mt-4">
                          Mostrando as 15 primeiras linhas de {previewData.length}.
                        </p>
                      )}
                    </div>
                  )}

                  {result && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
                      {result.errors === 0 ? (
                        <>
                          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Importação Concluída!</h3>
                          <p className="text-muted-foreground mb-6">
                            Todos os {result.success} registros foram inseridos.
                          </p>
                          <Button
                            variant="outline"
                            onClick={resetState}
                            className="rounded-full px-8"
                          >
                            Realizar nova importação
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Importação com Erros</h3>
                          <div className="w-full text-left bg-secondary/30 rounded-xl p-5 mb-6 border">
                            <p className="text-sm font-bold mb-3 uppercase tracking-wider">
                              Log da Operação
                            </p>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b pb-2">
                                <span>Sucesso:</span>
                                <span className="text-green-600 font-bold">{result.success}</span>
                              </div>
                              <div className="flex justify-between border-b pb-2">
                                <span>Erros:</span>
                                <span className="text-red-600 font-bold">{result.errors}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={resetState}
                            className="rounded-full px-8"
                          >
                            Tentar novamente
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card min-h-[500px]">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Histórico de Importações</CardTitle>
                  <CardDescription>
                    Acompanhe os lotes de dados inseridos recentemente
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchHistory}>
                  <ListFilter className="w-4 h-4 mr-2" /> Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <History className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1.5} />
                  <p className="text-base font-medium">Nenhum histórico encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Total de Itens</TableHead>
                      <TableHead>Processados</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {new Date(job.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="capitalize">
                          {job.type.replace('import_', '')}
                        </TableCell>
                        <TableCell>{job.total_items}</TableCell>
                        <TableCell>{job.processed_items}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-semibold',
                              job.status === 'completed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            )}
                          >
                            {job.status === 'completed' ? 'Sucesso' : 'Com Erros'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={duplicateAlert.show}
        onOpenChange={(open) => !open && setDuplicateAlert({ ...duplicateAlert, show: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicidade de Lançamentos Detectada</AlertDialogTitle>
            <AlertDialogDescription>
              O sistema identificou <strong>{duplicateAlert.duplicates.length}</strong> registro(s)
              que já possuem a mesma descrição, valor e mês de vencimento. O que você deseja fazer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[200px] overflow-y-auto border rounded p-2 text-sm text-muted-foreground space-y-2 mt-2">
            {duplicateAlert.duplicates.slice(0, 5).map((d, idx) => (
              <div key={idx} className="flex justify-between bg-secondary/20 p-2 rounded">
                <span className="font-medium">{d.descricao}</span>
                <span>
                  R$ {Number(d.valor).toFixed(2)} - {d.data_vencimento}
                </span>
              </div>
            ))}
            {duplicateAlert.duplicates.length > 5 && (
              <p className="text-center text-xs pt-2">
                E mais {duplicateAlert.duplicates.length - 5} registros...
              </p>
            )}
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setDuplicateAlert({ show: false, duplicates: [], preparedData: [] })}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                const uniqueData = duplicateAlert.preparedData.filter(
                  (row) => !duplicateAlert.duplicates.includes(row),
                )
                executeImport(uniqueData)
              }}
            >
              Ignorar Duplicados
            </Button>
            <AlertDialogAction
              onClick={() => executeImport(duplicateAlert.preparedData)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Forçar Importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
