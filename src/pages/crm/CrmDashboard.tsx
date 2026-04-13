import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Flame,
  ThermometerSun,
  Snowflake,
  MessageSquare,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import { fetchDashboardStats } from '@/services/crm'
import type { CrmDashboardStats } from '@/types/crm'
import { PIPELINE_STAGES, LEAD_SOURCES } from '@/types/crm'

const COLORS = ['#3b82f6', '#06b6d4', '#eab308', '#f97316', '#a855f7', '#22c55e', '#ef4444']
const PIE_COLORS = ['#ef4444', '#eab308', '#3b82f6']

export function CrmDashboard() {
  const [stats, setStats] = useState<CrmDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Erro ao carregar stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const classificationData = [
    { name: 'Quente', value: stats.hotLeads, color: '#ef4444' },
    { name: 'Morno', value: stats.warmLeads, color: '#eab308' },
    { name: 'Frio', value: stats.coldLeads, color: '#3b82f6' },
  ].filter((d) => d.value > 0)

  const stageData = PIPELINE_STAGES.map((stage) => ({
    name: stage.label,
    value: stats.leadsByStage.find((s) => s.stage === stage.key)?.count || 0,
  }))

  const sourceData = stats.leadsBySource.map((s) => ({
    name: LEAD_SOURCES.find((ls) => ls.key === s.source)?.label || s.source,
    value: s.count,
  }))

  return (
    <div className="space-y-6">
      {/* KPIs Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total de Leads"
          value={stats.totalLeads}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KpiCard
          title="Novos Hoje"
          value={stats.newLeadsToday}
          subtitle={`${stats.newLeadsWeek} esta semana`}
          icon={<UserPlus className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          title="Qualificados"
          value={stats.qualifiedLeads}
          icon={<UserCheck className="w-5 h-5" />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <KpiCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate.toFixed(1)}%`}
          subtitle={`${stats.convertedLeads} convertidos`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={stats.conversionRate > 0 ? 'up' : undefined}
        />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Leads Quentes"
          value={stats.hotLeads}
          icon={<Flame className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <KpiCard
          title="Leads Mornos"
          value={stats.warmLeads}
          icon={<ThermometerSun className="w-5 h-5" />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <KpiCard
          title="Aguardando WhatsApp"
          value={stats.pendingWhatsApp}
          icon={<MessageSquare className="w-5 h-5" />}
          color="text-cyan-600"
          bgColor="bg-cyan-50"
        />
        <KpiCard
          title="Ticket Médio"
          value={`R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subtitle={`Receita: R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Leads nos Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.leadsTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    const date = new Date(d + 'T00:00:00')
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={(d) => {
                    const date = new Date(d + 'T00:00:00')
                    return date.toLocaleDateString('pt-BR')
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Leads"
                  stroke="#3b82f6"
                  fill="#3b82f680"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Distribuição por Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={90} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                  {stageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classification Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Classificação dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={classificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {classificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Leads por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" name="Leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns */}
      {stats.topCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Top Campanhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Campanha</th>
                    <th className="text-center py-2 font-medium">Leads</th>
                    <th className="text-center py-2 font-medium">Qualificados</th>
                    <th className="text-center py-2 font-medium">Convertidos</th>
                    <th className="text-center py-2 font-medium">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCampaigns.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="text-center py-2">{c.leads}</td>
                      <td className="text-center py-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-600">
                          {c.qualified}
                        </Badge>
                      </td>
                      <td className="text-center py-2">
                        <Badge variant="outline" className="bg-green-50 text-green-600">
                          {c.converted}
                        </Badge>
                      </td>
                      <td className="text-center py-2">
                        {c.leads > 0 ? ((c.converted / c.leads) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bgColor,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  bgColor: string
  trend?: 'up' | 'down'
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

