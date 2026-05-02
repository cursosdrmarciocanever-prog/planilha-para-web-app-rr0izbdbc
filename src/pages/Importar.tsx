import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  History,
  FileWarning,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const EXPECTED_COLUMNS_SAIDAS = [
  { key: 'descricao', label: 'Descrição', required: true },
  { key: 'valor', label: 'Valor', required: true },
  { key: 'data_vencimento', label: 'Data de vencimento', required: true },
  { key: 'departamento', label: 'Departamento', required: false },
  { key: 'fornecedor', label: 'Fornecedor', required: false },
  { key: 'plano_contas', label: 'Plano de contas', required: false },
  { key: 'conta_contabil', label: 'Conta contábil', required: false },
  { key: 'conta_bancaria', label: 'Conta bancária', required: false },
  { key: 'categoria', label: 'Categoria', required: false },
  { key: 'referencia_competencia', label: 'Referência/Competência', required: false },
  { key: 'forma_pagamento', label: 'Forma de pagamento', required: false },
  { key: 'parcelamento', label: 'Parcelamento', required: false },
  { key: 'mes_competencia', label: 'Mês de competência', required: false },
  { key: 'data_pagamento', label: 'Data de pagamento', required: false },
]

const EXPECTED_COLUMNS_ENTRADAS = [
  { key: 'paciente', label: 'Paciente', required: true },
  { key: 'valor', label: 'Valor', required: true },
  { key: 'data_atendimento', label: 'Data de atendimento', required: true },
  { key: 'tipo', label: 'Tipo', required: false },
  { key: 'descricao', label: 'Descrição', required: false },
  { key: 'forma_pagamento', label: 'Forma de pagamento', required: false },
  { key: 'conta_recebimento', label: 'Conta de recebimento', required: false },
  { key: 'status_pagamento', label: 'Status de pagamento', required: false },
  { key: 'parcelas', label: 'Parcelas', required: false },
  { key: 'numero_orcamento', label: 'Nº Orçamento', required: false },
  { key: 'profissional', label: 'Profissional', required: false },
  { key: 'nota_fiscal', label: 'Nota Fiscal', required: false },
]

function parseExcelDate(val: any): Date | null {
  if (!val) return null
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000))
  }
  const str = String(val).trim()
  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 3) {
      let year = Number(parts[2])
      if (parts[2].length === 2) year += 2000
      return new Date(year, Number(parts[1]) - 1, Number(parts[0]))
    }
  }
  const d = new Date(str)
  if (!isNaN(d.getTime())) return d
  return null
}

function parseNumber(val: any): number {
  if (val === undefined || val === null || val === '') return NaN
  if (typeof val === 'number') return val
  const str = String(val).trim()
  const lastComma = str.lastIndexOf(',')
  const lastDot = str.lastIndexOf('.')
  let cleanStr = str
  if (lastComma > lastDot) {
    cleanStr = str.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    cleanStr = str.replace(/,/g, '')
  } else if (lastComma !== -1) {
    cleanStr = str.replace(',', '.')
  }
  cleanStr = cleanStr.replace(/[^\d.-]/g, '')
  return Number(cleanStr)
}

export default function Importar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()

  const [tipoImportacao, setTipoImportacao] = useState<'entradas' | 'saidas'>('entradas')
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')
  const [file, setFile] = useState<File | null>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [rawJson, setRawJson] = useState<any[]>([])
  const [fileColumns, setFileColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [parsedRows, setParsedRows] = useState<any[]>([])

  const [jobs, setJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tipo = searchParams.get('tipo')
    if (tipo === 'entradas' || tipo === 'saidas') {
      setTipoImportacao(tipo)
    }
  }, [location])

  useEffect(() => {
    if (user) fetchJobs()
  }, [user])

  const fetchJobs = async () => {
    setLoadingJobs(true)
    const { data } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('user_id', user?.id)
      .in('type', ['despesas', 'entradas'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setJobs(data)
    setLoadingJobs(false)
  }

  const downloadTemplate = () => {
    const expected =
      tipoImportacao === 'saidas' ? EXPECTED_COLUMNS_SAIDAS : EXPECTED_COLUMNS_ENTRADAS
    const cols = expected.map((e) => e.label)
    const csvContent = cols.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `modelo_importacao_${tipoImportacao}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStep('upload')
    }
  }

  const processFile = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data: resData, error: parseError } = await supabase.functions.invoke('parse-excel', {
        body: formData,
      })

      if (parseError) throw parseError

      const rows = resData.data || []
      if (rows.length === 0) {
        throw new Error('A planilha está vazia.')
      }

      const cols = Object.keys(rows[0] || {})
      setFileColumns(cols)

      const expected =
        tipoImportacao === 'saidas' ? EXPECTED_COLUMNS_SAIDAS : EXPECTED_COLUMNS_ENTRADAS
      const mapping: Record<string, string> = {}
      cols.forEach((fc) => {
        const fcLower = fc.toLowerCase().trim()
        const match = expected.find(
          (e) => e.label.toLowerCase().trim() === fcLower || e.key.toLowerCase() === fcLower,
        )
        if (match && !mapping[match.key]) {
          mapping[match.key] = fc
        }
      })

      setColumnMapping(mapping)
      setRawJson(rows)
      setStep('mapping')
    } catch (error: any) {
      toast({ title: 'Erro ao ler arquivo', description: error.message, variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const processDataPreview = async () => {
    const expected =
      tipoImportacao === 'saidas' ? EXPECTED_COLUMNS_SAIDAS : EXPECTED_COLUMNS_ENTRADAS
    const missingRequired = expected.filter(
      (e) => e.required && (!columnMapping[e.key] || columnMapping[e.key] === 'ignorar'),
    )

    if (missingRequired.length > 0) {
      toast({
        title: 'Mapeamento Incompleto',
        description: `Mapeie as colunas obrigatórias: ${missingRequired.map((e) => e.label).join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      let existingSet = new Set<string>()
      if (tipoImportacao === 'saidas') {
        const { data: existing } = await supabase
          .from('despesas')
          .select('descricao, valor, data_vencimento')
          .eq('user_id', user?.id)

        existing?.forEach((e: any) => {
          if (e.data_vencimento && e.descricao) {
            const d = new Date(e.data_vencimento)
            existingSet.add(
              `${String(e.descricao).trim().toLowerCase()}_${Number(e.valor)}_${d.getFullYear()}_${d.getMonth()}`,
            )
          }
        })
      } else {
        const { data: existing } = await supabase
          .from('lancamentos_pacientes')
          .select('nome_paciente, valor, data_atendimento')
          .eq('user_id', user?.id)

        existing?.forEach((e: any) => {
          if (e.data_atendimento && e.nome_paciente) {
            const d = new Date(e.data_atendimento)
            existingSet.add(
              `${String(e.nome_paciente).trim().toLowerCase()}_${Number(e.valor)}_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`,
            )
          }
        })
      }

      const processed = rawJson.map((row: any, index: number) => {
        const rowNumber = index + 2
        const errors: string[] = []
        let isDuplicate = false

        const mappedData: any = {}
        expected.forEach((e) => {
          const fileCol = columnMapping[e.key]
          mappedData[e.key] = fileCol && fileCol !== 'ignorar' ? row[fileCol] : null
        })

        if (tipoImportacao === 'saidas') {
          const desc = mappedData['descricao']
          const val = mappedData['valor']
          const venc = mappedData['data_vencimento']

          if (!desc) errors.push('Coluna Descrição está vazia.')

          const valorNum = parseNumber(val)
          if (isNaN(valorNum)) {
            errors.push('Coluna Valor está vazia ou contém um formato numérico inválido.')
          }

          const vencDate = parseExcelDate(venc)
          if (!vencDate) {
            errors.push('Coluna Data de vencimento está vazia ou em formato inválido.')
          }

          if (errors.length === 0) {
            const rowMonth = vencDate!.getMonth()
            const rowYear = vencDate!.getFullYear()
            const dupKey = `${String(desc).trim().toLowerCase()}_${valorNum}_${rowYear}_${rowMonth}`
            if (existingSet.has(dupKey)) isDuplicate = true
          }

          return {
            rowNumber,
            data: mappedData,
            valorNum,
            vencDate,
            pagDate: parseExcelDate(mappedData['data_pagamento']),
            errors,
            isDuplicate,
            titulo: desc,
          }
        } else {
          const paciente = mappedData['paciente']
          const val = mappedData['valor']
          const dataAtend = mappedData['data_atendimento']

          if (!paciente) errors.push('Coluna Paciente está vazia.')

          const valorNum = parseNumber(val)
          if (isNaN(valorNum)) {
            errors.push('Coluna Valor está vazia ou contém um formato numérico inválido.')
          }

          const atendDate = parseExcelDate(dataAtend)
          if (!atendDate) {
            errors.push('Coluna Data de atendimento está vazia ou em formato inválido.')
          }

          if (errors.length === 0) {
            const rowMonth = atendDate!.getMonth()
            const rowYear = atendDate!.getFullYear()
            const rowDay = atendDate!.getDate()
            const dupKey = `${String(paciente).trim().toLowerCase()}_${valorNum}_${rowYear}_${rowMonth}_${rowDay}`
            if (existingSet.has(dupKey)) isDuplicate = true
          }

          return {
            rowNumber,
            data: mappedData,
            valorNum,
            atendDate,
            errors,
            isDuplicate,
            titulo: paciente,
          }
        }
      })

      setParsedRows(processed)
      setStep('preview')
    } catch (error: any) {
      toast({ title: 'Erro ao processar', description: error.message, variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate)
    if (validRows.length === 0) return

    setIsSaving(true)
    try {
      const chunkSize = 500

      if (tipoImportacao === 'saidas') {
        const toInsert = validRows.map((r) => {
          const d = r.data
          return {
            user_id: user?.id,
            descricao: d['descricao'] || null,
            departamento: d['departamento'] || null,
            fornecedor: d['fornecedor'] || null,
            plano_contas: d['plano_contas'] || null,
            conta_contabil: d['conta_contabil'] || null,
            conta_bancaria: d['conta_bancaria'] || null,
            categoria: d['categoria'] || null,
            valor: r.valorNum,
            referencia_competencia: d['referencia_competencia'] || null,
            forma_pagamento: d['forma_pagamento'] || null,
            parcelamento: d['parcelamento'] || null,
            mes_competencia: d['mes_competencia'] || null,
            data_vencimento: r.vencDate ? r.vencDate.toISOString().split('T')[0] : null,
            data_pagamento: r.pagDate ? r.pagDate.toISOString().split('T')[0] : null,
            status: r.pagDate ? 'Pago' : 'Pendente',
          }
        })

        for (let i = 0; i < toInsert.length; i += chunkSize) {
          const chunk = toInsert.slice(i, i + chunkSize)
          const { error } = await supabase.from('despesas').insert(chunk)
          if (error) throw error
        }

        await supabase.from('import_jobs').insert({
          user_id: user?.id,
          type: 'despesas',
          status: 'completed',
          total_items: rawJson.length,
          processed_items: validRows.length,
        })
      } else {
        const toInsert = validRows.map((r) => {
          const d = r.data
          const tipoRaw = String(d['tipo'] || '').trim()
          const tipoValid =
            tipoRaw.toLowerCase() === 'consulta' || tipoRaw.toLowerCase() === 'procedimento'
              ? tipoRaw.toLowerCase() === 'consulta'
                ? 'Consulta'
                : 'Procedimento'
              : null

          return {
            user_id: user?.id,
            nome_paciente: d['paciente'] || null,
            tipo: tipoValid,
            categoria: d['tipo'] || null,
            descricao: d['descricao'] || null,
            valor: r.valorNum,
            forma_pagamento: d['forma_pagamento'] || null,
            conta_recebimento: d['conta_recebimento'] || null,
            status_pagamento: d['status_pagamento'] || 'Confirmado',
            parcelas: d['parcelas']
              ? parseInt(String(d['parcelas']).replace(/\D/g, ''), 10) || null
              : null,
            numero_orcamento: d['numero_orcamento'] || null,
            profissional_orcamento: d['profissional'] || null,
            nota_fiscal: d['nota_fiscal'] || null,
            data_atendimento: r.atendDate ? r.atendDate.toISOString().split('T')[0] : null,
          }
        })

        for (let i = 0; i < toInsert.length; i += chunkSize) {
          const chunk = toInsert.slice(i, i + chunkSize)
          const { error } = await supabase.from('lancamentos_pacientes').insert(chunk)
          if (error) throw error
        }

        await supabase.from('import_jobs').insert({
          user_id: user?.id,
          type: 'entradas',
          status: 'completed',
          total_items: rawJson.length,
          processed_items: validRows.length,
        })
      }

      toast({
        title: 'Sucesso',
        description: `${validRows.length} registros importados com sucesso.`,
      })

      setStep('upload')
      setFile(null)
      setRawJson([])
      setFileColumns([])
      setColumnMapping({})
      setParsedRows([])
      fetchJobs()
    } catch (error: any) {
      toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const validCount = parsedRows.filter((r) => r.errors.length === 0 && !r.isDuplicate).length
  const errorCount = parsedRows.filter((r) => r.errors.length > 0).length
  const dupCount = parsedRows.filter((r) => r.errors.length === 0 && r.isDuplicate).length

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importação de Lançamentos</h1>
          <p className="text-muted-foreground mt-1">
            Importe suas planilhas de Entradas ou Saídas em lote
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Baixar Modelo de {tipoImportacao === 'entradas' ? 'Entradas' : 'Saídas'}
        </Button>
      </div>

      <Card className="bg-secondary/20 border-border/50">
        <CardContent className="pt-6">
          <RadioGroup
            value={tipoImportacao}
            onValueChange={(val) => {
              setTipoImportacao(val as 'entradas' | 'saidas')
              setStep('upload')
              setFile(null)
              setRawJson([])
              setFileColumns([])
              setColumnMapping({})
              setParsedRows([])
            }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="entradas" id="entradas" />
              <Label htmlFor="entradas" className="cursor-pointer font-medium text-base">
                Entradas (Faturamento / Pacientes)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="saidas" id="saidas" />
              <Label htmlFor="saidas" className="cursor-pointer font-medium text-base">
                Saídas (Despesas / Custos)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="import">Nova Importação</TabsTrigger>
          <TabsTrigger value="history">Histórico e Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {step === 'upload' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Enviar Arquivo</CardTitle>
                <CardDescription>
                  Selecione uma planilha XLSX ou CSV para processar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      key={tipoImportacao}
                    />
                  </div>
                  <Button
                    onClick={processFile}
                    disabled={!file || isProcessing}
                    className="gap-2 w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Ler Planilha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'mapping' && (
            <Card className="animate-fade-in-up border-primary/20">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Mapeamento Flexível de Colunas
                </CardTitle>
                <CardDescription>
                  Relacione as colunas da sua planilha com os campos nativos do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="rounded-md border bg-background overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-1/2">Campo do Sistema</TableHead>
                        <TableHead className="w-1/2">Coluna da Planilha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tipoImportacao === 'saidas'
                        ? EXPECTED_COLUMNS_SAIDAS
                        : EXPECTED_COLUMNS_ENTRADAS
                      ).map((col) => (
                        <TableRow key={col.key}>
                          <TableCell className="font-medium">
                            {col.label}
                            {col.required && (
                              <span className="text-red-500 ml-1" title="Obrigatório">
                                *
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={columnMapping[col.key] || 'ignorar'}
                              onValueChange={(val) =>
                                setColumnMapping((prev) => ({
                                  ...prev,
                                  [col.key]: val === 'ignorar' ? '' : val,
                                }))
                              }
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Selecione a coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="ignorar"
                                  className="text-muted-foreground italic"
                                >
                                  -- Ignorar (Não importar) --
                                </SelectItem>
                                {fileColumns.map((fc) => (
                                  <SelectItem key={fc} value={fc}>
                                    {fc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('upload')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Trocar Arquivo
                  </Button>
                  <Button onClick={processDataPreview} disabled={isProcessing} className="gap-2">
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Validar Dados e Pré-visualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'preview' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-muted-foreground" /> Resumo da Validação
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('mapping')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Ajustar Mapeamento
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {validCount}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-green-600/80 mt-1">
                      Prontos para importar
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <FileWarning className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {dupCount}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-amber-600/80 mt-1">
                      Duplicados (Ignorados)
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {errorCount}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-red-600/80 mt-1">Erros encontrados</p>
                  </CardContent>
                </Card>
              </div>

              {validCount > 0 && (
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader className="bg-green-50/30 dark:bg-green-950/10 pb-4">
                    <CardTitle className="text-base text-green-800 dark:text-green-400">
                      Pré-visualização (5 primeiros válidos)
                    </CardTitle>
                    <CardDescription>
                      Confirme as informações mapeadas antes de salvar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>
                            {tipoImportacao === 'saidas' ? 'Descrição' : 'Paciente'}
                          </TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Forma de Pgto.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedRows
                          .filter((r) => r.errors.length === 0 && !r.isDuplicate)
                          .slice(0, 5)
                          .map((r, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{r.titulo}</TableCell>
                              <TableCell>
                                {tipoImportacao === 'saidas'
                                  ? r.vencDate?.toLocaleDateString('pt-BR') || '-'
                                  : r.atendDate?.toLocaleDateString('pt-BR') || '-'}
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(r.valorNum)}
                              </TableCell>
                              <TableCell>{r.data['forma_pagamento'] || '-'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {errorCount > 0 && (
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader className="bg-red-50/50 dark:bg-red-950/20 pb-4">
                    <CardTitle className="text-red-700 dark:text-red-400 text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Relatório de Erros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-60 overflow-y-auto p-4 space-y-2">
                      {parsedRows
                        .filter((r) => r.errors.length > 0)
                        .map((r, i) => (
                          <Alert key={i} variant="destructive" className="bg-background">
                            <AlertTitle>Linha {r.rowNumber}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc list-inside pl-4">
                                {r.errors.map((e: string, j: number) => (
                                  <li key={j}>{e}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {dupCount > 0 && (
                <Card className="border-amber-200 dark:border-amber-900">
                  <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-4">
                    <CardTitle className="text-amber-700 dark:text-amber-400 text-lg flex items-center gap-2">
                      <FileWarning className="w-5 h-5" /> Duplicidades Identificadas
                    </CardTitle>
                    <CardDescription className="text-amber-600/80">
                      Lançamentos idênticos já existem no sistema e serão ignorados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-40 overflow-y-auto p-4 space-y-2">
                      {parsedRows
                        .filter((r) => r.errors.length === 0 && r.isDuplicate)
                        .map((r, i) => (
                          <div
                            key={i}
                            className="text-sm p-2 bg-background border border-border rounded-md"
                          >
                            Linha {r.rowNumber}: {r.titulo} - R$ {r.valorNum}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || isSaving}
                  size="lg"
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Confirmar Importação de {validCount} itens
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" /> Logs de Importação
              </CardTitle>
              <CardDescription>
                Acompanhe o histórico de processamento de planilhas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingJobs ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 border rounded-lg bg-card"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="space-y-2 flex flex-col items-end">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma importação registrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {job.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : job.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                          )}
                          Importação de {job.type === 'entradas' ? 'Entradas' : 'Saídas'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Realizada em: {new Date(job.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="font-semibold text-primary">
                          {job.processed_items} registros salvos
                        </div>
                        <div className="text-sm text-muted-foreground">
                          de {job.total_items} identificados na planilha
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
