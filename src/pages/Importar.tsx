import { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Download,
  Info,
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

type EntityType = 'pacientes' | 'despesas' | 'produtos_servicos' | 'salas'

const TEMPLATES: Record<EntityType, string> = {
  pacientes:
    'nome,cpf,telefone,email,data_nascimento\nJoão Silva,12345678900,11999999999,joao@email.com,1990-01-01',
  despesas: 'categoria,valor,data_vencimento,status\nEnergia,150.50,2023-10-10,Pendente',
  produtos_servicos: 'nome,descricao,preco\nConsulta Geral,Consulta de rotina,250.00',
  salas: 'nome,status,taxa_hora,taxa_dia\nSala 01,Ativa,50.00,300.00',
}

const REQUIRED_FIELDS: Record<EntityType, string[]> = {
  pacientes: ['nome'],
  despesas: ['valor'],
  produtos_servicos: ['nome'],
  salas: ['nome'],
}

export default function Importar() {
  const [entity, setEntity] = useState<EntityType | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    success: number
    errors: number
    details: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    if (lines.length === 0) return []

    const parsedHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase())
    setHeaders(parsedHeaders)

    const data = lines.slice(1).map((line) => {
      const values = line.split(',')
      return parsedHeaders.reduce(
        (acc, header, index) => {
          let val: any = values[index]?.trim()
          if (val === '') val = null
          else if (val && !isNaN(Number(val)) && header !== 'cpf' && header !== 'telefone') {
            val = Number(val)
          }
          acc[header] = val
          return acc
        },
        {} as Record<string, any>,
      )
    })

    return data
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setResult(null)

    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo .CSV.',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        setPreviewData(parsed)
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleDownloadTemplate = () => {
    if (!entity) return
    const csvContent = TEMPLATES[entity as EntityType]
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `template_${entity}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const processImport = async () => {
    if (!entity || previewData.length === 0) return

    const required = REQUIRED_FIELDS[entity as EntityType]
    const missingFields = required.filter((req) => !headers.includes(req))

    if (missingFields.length > 0) {
      toast({
        title: 'Colunas obrigatórias ausentes',
        description: `O arquivo deve conter as seguintes colunas: ${missingFields.join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setProgress(0)
    setResult(null)

    let successCount = 0
    let errorCount = 0
    const errorDetails: string[] = []

    // Process in chunks of 50 to avoid hitting limits and allow progress updates
    const chunkSize = 50
    const chunks = []
    for (let i = 0; i < previewData.length; i += chunkSize) {
      chunks.push(previewData.slice(i, i + chunkSize))
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      try {
        const { error } = await supabase.from(entity).insert(chunk)

        if (error) {
          errorCount += chunk.length
          errorDetails.push(`Lote ${i + 1}: ${error.message}`)
        } else {
          successCount += chunk.length
        }
      } catch (err: any) {
        errorCount += chunk.length
        errorDetails.push(`Lote ${i + 1}: Erro inesperado.`)
      }

      setProgress(Math.round(((i + 1) / chunks.length) * 100))
    }

    setResult({ success: successCount, errors: errorCount, details: errorDetails })
    setLoading(false)
    setProgress(100)

    if (errorCount === 0) {
      toast({
        title: 'Importação concluída',
        description: `${successCount} registros importados com sucesso.`,
      })
      await logAction(
        `Importou ${successCount} registros na entidade ${entity}`,
        'importacao',
        entity,
      )
      setFile(null)
      setPreviewData([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      toast({
        title: 'Importação finalizada com erros',
        description: `Sucesso: ${successCount} | Erros: ${errorCount}. Verifique os detalhes.`,
        variant: 'destructive',
      })
      await logAction(
        `Importação com ${errorCount} erros na entidade ${entity}`,
        'importacao',
        entity,
      )
    }
  }

  const resetState = () => {
    setFile(null)
    setPreviewData([])
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Upload className="w-8 h-8 text-primary" />
          Importação de Dados
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Traga seus dados legados de planilhas CSV para dentro do sistema de forma rápida e segura.
        </p>
      </div>

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
                    <SelectValue placeholder="Selecione o tipo de dado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pacientes">Pacientes</SelectItem>
                    <SelectItem value="despesas">Despesas</SelectItem>
                    <SelectItem value="produtos_servicos">Produtos e Serviços</SelectItem>
                    <SelectItem value="salas">Salas</SelectItem>
                  </SelectContent>
                </Select>

                {entity && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs h-8"
                    onClick={handleDownloadTemplate}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Baixar Planilha Modelo
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">2. Arquivo CSV</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
                    ${file ? 'border-primary bg-primary/5' : 'border-border/80 hover:border-primary/50 hover:bg-secondary/50'}
                    ${!entity && 'opacity-50 pointer-events-none'}`}
                >
                  <FileText
                    className={`w-8 h-8 mb-3 ${file ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  {file ? (
                    <>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(2)} KB • {previewData.length} linhas
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetState}
                        className="mt-4 h-8 text-xs text-destructive hover:text-destructive"
                      >
                        Remover arquivo
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">Clique para selecionar</p>
                      <p className="text-xs text-muted-foreground mt-1">Apenas arquivos .CSV</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
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

          {entity && (
            <Alert className="bg-blue-50/50 border-blue-200/50 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-200">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-sm font-semibold mb-1">Dica de Mapeamento</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed opacity-90">
                Os nomes das colunas na primeira linha do seu CSV devem corresponder aos nomes dos
                campos no banco de dados. Campos obrigatórios para{' '}
                <strong className="font-bold">{entity}</strong>:{' '}
                {REQUIRED_FIELDS[entity as EntityType].join(', ')}.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card min-h-[400px] flex flex-col">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pré-visualização e Progresso</CardTitle>
                  <CardDescription>Confirme os dados antes de importar</CardDescription>
                </div>
                {previewData.length > 0 && !loading && !result && (
                  <Button
                    onClick={processImport}
                    className="gap-2 rounded-full h-10 px-6 shadow-sm"
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
                  <p className="text-base font-medium text-foreground">
                    Nenhum arquivo selecionado
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione a entidade e carregue um CSV para visualizar.
                  </p>
                </div>
              )}

              {previewData.length > 0 && !result && (
                <div className="p-6">
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
                          {headers.slice(0, 5).map((h, i) => (
                            <TableHead
                              key={i}
                              className="font-semibold text-xs uppercase tracking-wider"
                            >
                              {h}
                            </TableHead>
                          ))}
                          {headers.length > 5 && <TableHead className="w-12">...</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {headers.slice(0, 5).map((h, colIndex) => (
                              <TableCell
                                key={colIndex}
                                className="truncate max-w-[150px] text-sm text-muted-foreground"
                              >
                                {String(row[h] || '')}
                              </TableCell>
                            ))}
                            {headers.length > 5 && (
                              <TableCell className="text-muted-foreground">...</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {previewData.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Mostrando 5 de {previewData.length} registros encontrados.
                    </p>
                  )}
                </div>
              )}

              {result && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
                  {result.errors === 0 ? (
                    <>
                      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Importação Concluída!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Todos os {result.success} registros foram inseridos com sucesso no banco de
                        dados.
                      </p>
                      <Button variant="outline" onClick={resetState}>
                        Realizar nova importação
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Importação com Erros
                      </h3>
                      <div className="flex gap-4 mb-6 text-sm">
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                          {result.success} inseridos
                        </span>
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full font-medium">
                          {result.errors} falhas
                        </span>
                      </div>

                      <div className="w-full text-left bg-secondary/30 rounded-xl p-4 max-h-[150px] overflow-y-auto mb-6 border border-border/50">
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                          Detalhes do erro:
                        </p>
                        <ul className="space-y-1 text-sm text-destructive">
                          {result.details.map((d, i) => (
                            <li key={i}>• {d}</li>
                          ))}
                        </ul>
                      </div>

                      <Button variant="outline" onClick={resetState}>
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
    </div>
  )
}
