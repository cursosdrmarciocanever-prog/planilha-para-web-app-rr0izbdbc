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
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  History,
  FileWarning,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const EXPECTED_COLUMNS_SAIDAS = [
  'Descrição',
  'Departamento',
  'Fornecedor',
  'Plano de contas',
  'Conta contábil',
  'Conta bancária',
  'Categoria',
  'Valor',
  'Referência/Competência',
  'Forma de pagamento',
  'Parcelamento',
  'Mês de competência',
  'Data de vencimento',
  'Data de pagamento',
]

const EXPECTED_COLUMNS_ENTRADAS = [
  'Data de atendimento',
  'Paciente',
  'Tipo',
  'Descrição',
  'Valor',
  'Forma de pagamento',
  'Conta de recebimento',
  'Status de pagamento',
  'Parcelas',
  'Nº Orçamento',
  'Profissional',
  'Nota Fiscal',
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
      if (parts[0].length <= 2 && parts[2].length === 4) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
  }
  const d = new Date(str)
  if (!isNaN(d.getTime())) return d
  return null
}

export default function Importar() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()

  const [tipoImportacao, setTipoImportacao] = useState<'entradas' | 'saidas'>('entradas')
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    const cols = tipoImportacao === 'saidas' ? EXPECTED_COLUMNS_SAIDAS : EXPECTED_COLUMNS_ENTRADAS
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
      setParsedRows([])
    }
  }

  const processFile = async () => {
    if (!file) return
    setIsProcessing(true)
    setParsedRows([])

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

      let existingData: any[] = []
      if (tipoImportacao === 'saidas') {
        const { data: existing } = await supabase
          .from('despesas')
          .select('descricao, valor, data_vencimento')
          .eq('user_id', user?.id)
        existingData = existing || []
      } else {
        const { data: existing } = await supabase
          .from('lancamentos_pacientes')
          .select('nome_paciente, valor, data_atendimento')
          .eq('user_id', user?.id)
        existingData = existing || []
      }

      const processed = rows.map((row: any, index: number) => {
        const rowNumber = index + 2
        const errors: string[] = []
        let isDuplicate = false

        if (tipoImportacao === 'saidas') {
          const desc = row['Descrição']
          const val = row['Valor']
          const venc = row['Data de vencimento']

          if (!desc) errors.push('Coluna Descrição está vazia.')

          let valorNum = 0
          if (val === undefined || val === null || val === '') {
            errors.push('Coluna Valor está vazia.')
          } else {
            valorNum = typeof val === 'string' ? Number(val.replace(',', '.')) : Number(val)
            if (isNaN(valorNum)) {
              errors.push('Coluna Valor contém um formato numérico inválido.')
            }
          }

          const vencDate = parseExcelDate(venc)
          if (!vencDate) {
            errors.push('Coluna Data de vencimento está vazia ou em formato inválido.')
          }

          if (errors.length === 0) {
            const rowMonth = vencDate!.getMonth()
            const rowYear = vencDate!.getFullYear()

            const dup = existingData.find((e: any) => {
              if (e.descricao !== desc) return false
              if (Number(e.valor) !== valorNum) return false
              if (!e.data_vencimento) return false
              const eDate = new Date(e.data_vencimento)
              return eDate.getMonth() === rowMonth && eDate.getFullYear() === rowYear
            })

            if (dup) isDuplicate = true
          }

          return {
            rowNumber,
            data: row,
            valorNum,
            vencDate,
            pagDate: parseExcelDate(row['Data de pagamento']),
            errors,
            isDuplicate,
            titulo: desc,
          }
        } else {
          const paciente = row['Paciente']
          const val = row['Valor']
          const dataAtend = row['Data de atendimento']

          if (!paciente) errors.push('Coluna Paciente está vazia.')

          let valorNum = 0
          if (val === undefined || val === null || val === '') {
            errors.push('Coluna Valor está vazia.')
          } else {
            valorNum = typeof val === 'string' ? Number(val.replace(',', '.')) : Number(val)
            if (isNaN(valorNum)) {
              errors.push('Coluna Valor contém um formato numérico inválido.')
            }
          }

          const atendDate = parseExcelDate(dataAtend)
          if (!atendDate) {
            errors.push('Coluna Data de atendimento está vazia ou em formato inválido.')
          }

          if (errors.length === 0) {
            const rowMonth = atendDate!.getMonth()
            const rowYear = atendDate!.getFullYear()
            const rowDay = atendDate!.getDate()

            const dup = existingData.find((e: any) => {
              if (e.nome_paciente !== paciente) return false
              if (Number(e.valor) !== valorNum) return false
              if (!e.data_atendimento) return false
              const eDate = new Date(e.data_atendimento)
              return (
                eDate.getDate() === rowDay &&
                eDate.getMonth() === rowMonth &&
                eDate.getFullYear() === rowYear
              )
            })

            if (dup) isDuplicate = true
          }

          return {
            rowNumber,
            data: row,
            valorNum,
            atendDate,
            errors,
            isDuplicate,
            titulo: paciente,
          }
        }
      })

      setParsedRows(processed)
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
      if (tipoImportacao === 'saidas') {
        const toInsert = validRows.map((r) => {
          const d = r.data
          return {
            user_id: user?.id,
            descricao: d['Descrição'] || null,
            departamento: d['Departamento'] || null,
            fornecedor: d['Fornecedor'] || null,
            plano_contas: d['Plano de contas'] || null,
            conta_contabil: d['Conta contábil'] || null,
            conta_bancaria: d['Conta bancária'] || null,
            categoria: d['Categoria'] || null,
            valor: r.valorNum,
            referencia_competencia: d['Referência/Competência'] || null,
            forma_pagamento: d['Forma de pagamento'] || null,
            parcelamento: d['Parcelamento'] || null,
            mes_competencia: d['Mês de competência'] || null,
            data_vencimento: r.vencDate ? r.vencDate.toISOString().split('T')[0] : null,
            data_pagamento: r.pagDate ? r.pagDate.toISOString().split('T')[0] : null,
            status: r.pagDate ? 'Pago' : 'Pendente',
          }
        })

        const { error } = await supabase.from('despesas').insert(toInsert)
        if (error) throw error

        await supabase.from('import_jobs').insert({
          user_id: user?.id,
          type: 'despesas',
          status: 'completed',
          total_items: parsedRows.length,
          processed_items: validRows.length,
        })
      } else {
        const toInsert = validRows.map((r) => {
          const d = r.data
          return {
            user_id: user?.id,
            nome_paciente: d['Paciente'] || null,
            tipo: d['Tipo'] || null,
            categoria: d['Tipo'] || null,
            descricao: d['Descrição'] || null,
            valor: r.valorNum,
            forma_pagamento: d['Forma de pagamento'] || null,
            conta_recebimento: d['Conta de recebimento'] || null,
            status_pagamento: d['Status de pagamento'] || 'Confirmado',
            parcelas: d['Parcelas'] ? parseInt(d['Parcelas'], 10) : null,
            numero_orcamento: d['Nº Orçamento'] || null,
            profissional_orcamento: d['Profissional'] || null,
            nota_fiscal: d['Nota Fiscal'] || null,
            data_atendimento: r.atendDate ? r.atendDate.toISOString().split('T')[0] : null,
          }
        })

        const { error } = await supabase.from('lancamentos_pacientes').insert(toInsert)
        if (error) throw error

        await supabase.from('import_jobs').insert({
          user_id: user?.id,
          type: 'entradas',
          status: 'completed',
          total_items: parsedRows.length,
          processed_items: validRows.length,
        })
      }

      toast({
        title: 'Sucesso',
        description: `${validRows.length} registros importados com sucesso.`,
      })
      setParsedRows([])
      setFile(null)
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
              setParsedRows([])
              setFile(null)
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
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Arquivo</CardTitle>
              <CardDescription>
                Selecione uma planilha XLSX ou CSV no formato do modelo para processar.
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
                  Processar Planilha
                </Button>
              </div>
            </CardContent>
          </Card>

          {parsedRows.length > 0 && (
            <div className="space-y-6 animate-fade-in-up">
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

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || isSaving}
                  size="lg"
                  className="gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
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
                <History className="w-5 h-5" /> Histórico de Operações
              </CardTitle>
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
                      className="flex justify-between items-center p-4 border rounded-lg bg-card"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          Importação de {job.type === 'entradas' ? 'Entradas' : 'Saídas'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {job.processed_items} inseridos
                        </div>
                        <div className="text-sm text-muted-foreground">
                          de {job.total_items} totais
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
