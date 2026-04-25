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
import { Input } from '@/components/ui/input'

type EntityType = 'pacientes' | 'despesas' | 'produtos_servicos' | 'salas' | 'transacoes'

const TEMPLATES: Record<EntityType, string> = {
  pacientes:
    'nome,cpf,telefone,email,data_nascimento\nJoão Silva,12345678900,11999999999,joao@email.com,1990-01-01',
  despesas:
    'descricao,categoria,valor,data_vencimento,status,conta_pagamento\nConta de Luz Energisa,,150.50,2023-10-10,Pendente,Conta Jurídica / Sicoob\nAbastecimento Posto Ipiranga,,200.00,2023-10-12,Pago,Carnê Leão / Unicred',
  produtos_servicos: 'nome,descricao,preco\nConsulta Geral,Consulta de rotina,250.00',
  salas: 'nome,status,taxa_hora,taxa_dia\nSala 01,Ativa,50.00,300.00',
  transacoes:
    'tipo,valor,data,descricao,status\nreceita,1500.00,2023-10-10,Atendimento,confirmado\ndespesa,150.50,2023-10-10,Luz,pago',
}

const REQUIRED_FIELDS: Record<EntityType, string[]> = {
  pacientes: ['nome'],
  despesas: ['descricao', 'valor'],
  produtos_servicos: ['nome'],
  salas: ['nome'],
  transacoes: ['tipo', 'valor', 'data'],
}

export default function Importar() {
  const { user } = useAuth()
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

  const [rules, setRules] = useState<{ keyword: string; category: string }[]>(() => {
    const saved = localStorage.getItem('import_category_rules')
    return saved
      ? JSON.parse(saved)
      : [
          { keyword: 'posto', category: 'Variáveis' },
          { keyword: 'combustivel', category: 'Variáveis' },
          { keyword: 'aluguel', category: 'Fixas' },
          { keyword: 'salario', category: 'Pessoal' },
          { keyword: 'imposto', category: 'Impostos' },
          { keyword: 'marketing', category: 'Marketing' },
          { keyword: 'facebook', category: 'Marketing' },
          { keyword: 'luz', category: 'Fixas' },
          { keyword: 'agua', category: 'Fixas' },
          { keyword: 'internet', category: 'Fixas' },
        ]
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('import_category_rules', JSON.stringify(rules))
  }, [rules])

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    if (lines.length === 0) return []

    const parsedHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase())
    setHeaders(parsedHeaders)

    const data = lines.slice(1).map((line) => {
      const values = line.split(',')
      const row = parsedHeaders.reduce(
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

      if (entity === 'despesas' && row.descricao && !row.categoria) {
        const lowerDesc = String(row.descricao).toLowerCase()
        const matchedRule = rules.find(
          (r) => r.keyword && lowerDesc.includes(r.keyword.toLowerCase()),
        )
        if (matchedRule) {
          row.categoria = matchedRule.category
        }
      }

      return row
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

  const reapplyRules = () => {
    if (entity !== 'despesas' || !previewData.length) return
    const newData = previewData.map((row) => {
      if (row.descricao) {
        const lowerDesc = String(row.descricao).toLowerCase()
        const matchedRule = rules.find(
          (r) => r.keyword && lowerDesc.includes(r.keyword.toLowerCase()),
        )
        if (matchedRule) {
          return { ...row, categoria: matchedRule.category }
        }
      }
      return row
    })
    setPreviewData(newData)
    toast({
      title: 'Regras Aplicadas',
      description: 'A pré-visualização foi atualizada com as novas categorias.',
    })
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

    const chunkSize = 50
    const chunks = []
    for (let i = 0; i < previewData.length; i += chunkSize) {
      chunks.push(previewData.slice(i, i + chunkSize))
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].map((row) => {
        if (entity === 'despesas' && user) {
          return { ...row, user_id: user.id }
        }
        return row
      })

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
                    <SelectItem value="transacoes">Transações (Entradas/Saídas)</SelectItem>
                  </SelectContent>
                </Select>

                {entity && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={handleDownloadTemplate}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Planilha Modelo
                    </Button>

                    {entity === 'despesas' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                          >
                            <Settings className="w-3 h-3 mr-2" />
                            Regras Inteligentes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px]">
                          <DialogHeader>
                            <DialogTitle>Categorização Inteligente</DialogTitle>
                            <DialogDescription>
                              Defina palavras-chave para classificar automaticamente suas despesas
                              durante a importação.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4 max-h-[300px] overflow-y-auto pr-2">
                            {rules.map((rule, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  placeholder="Palavra-chave (ex: posto)"
                                  value={rule.keyword}
                                  onChange={(e) => {
                                    const newRules = [...rules]
                                    newRules[index].keyword = e.target.value
                                    setRules(newRules)
                                  }}
                                />
                                <Select
                                  value={rule.category}
                                  onValueChange={(val) => {
                                    const newRules = [...rules]
                                    newRules[index].category = val
                                    setRules(newRules)
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Categoria" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Fixas">Fixas</SelectItem>
                                    <SelectItem value="Variáveis">Variáveis</SelectItem>
                                    <SelectItem value="Pessoal">Pessoal</SelectItem>
                                    <SelectItem value="Impostos">Impostos</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setRules(rules.filter((_, i) => i !== index))
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              className="w-full border-dashed"
                              onClick={() =>
                                setRules([...rules, { keyword: '', category: 'Fixas' }])
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Nova Regra
                            </Button>
                          </div>
                          {previewData.length > 0 && (
                            <Button onClick={reapplyRules} className="w-full mt-4">
                              Aplicar Regras nos Dados Carregados
                            </Button>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
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
                        Todos os {result.success} registros foram inseridos com sucesso.
                      </p>

                      <div className="w-full text-left bg-secondary/30 rounded-xl p-5 mb-6 border border-border/50">
                        <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                          Log da Operação
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Entidade Destino:</span>
                            <span className="font-semibold text-foreground capitalize">
                              {entity}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Linhas Processadas:</span>
                            <span className="font-semibold text-foreground">{result.success}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Linhas c/ Erro:</span>
                            <span className="font-semibold text-foreground">0</span>
                          </div>
                          <div className="flex justify-between text-sm items-center pt-1">
                            <span className="text-muted-foreground">Status Final:</span>
                            <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">
                              100% Sucesso
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" onClick={resetState} className="rounded-full px-8">
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

                      <div className="w-full text-left bg-secondary/30 rounded-xl p-5 mb-6 border border-border/50">
                        <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                          Log da Operação
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Entidade Destino:</span>
                            <span className="font-semibold text-foreground capitalize">
                              {entity}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">
                              Linhas Importadas (Sucesso):
                            </span>
                            <span className="font-semibold text-green-600">{result.success}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Linhas c/ Erro (Falha):</span>
                            <span className="font-semibold text-red-600">{result.errors}</span>
                          </div>
                          <div className="pt-1">
                            <span className="text-muted-foreground text-xs font-semibold block mb-2">
                              Detalhes dos Erros:
                            </span>
                            <ul className="space-y-1 text-xs text-destructive max-h-[100px] overflow-y-auto pr-2">
                              {result.details.map((d, i) => (
                                <li key={i}>• {d}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" onClick={resetState} className="rounded-full px-8">
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
