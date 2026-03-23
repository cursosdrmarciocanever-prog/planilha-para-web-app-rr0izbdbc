import { DespesasFixasTable } from './DespesasFixasTable'
import { SalasTable } from './SalasTable'
import { VisaoCustos } from './VisaoCustos'
import { EvolucaoCustoHora } from './EvolucaoCustoHora'
import { AlertasEficiencia } from './AlertasEficiencia'
import { Loader2 } from 'lucide-react'

export default function RegistroTaxaSala({
  valores,
  setValores,
  salas,
  selectedSalaId,
  setSelectedSalaId,
  turnos,
  setTurnos,
  semanas,
  setSemanas,
  loadData,
  loading,
}: any) {
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  const sala = salas.find((s: any) => s.id === selectedSalaId) || salas[0] || {}
  const horasMes = Number(sala.horas_mes || 220)

  const totalDespesas = valores.reduce((acc: number, v: any) => acc + (Number(v.valor) || 0), 0)
  const custoHora100 = horasMes > 0 ? totalDespesas / horasMes : 0
  const totalSalas = Math.max(1, salas.length)

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <AlertasEficiencia
        totalDespesas={totalDespesas}
        custoHora100={custoHora100}
        totalSalas={totalSalas}
        horasMesBase={horasMes}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 flex flex-col gap-8">
          <div className="flex-1">
            <DespesasFixasTable valores={valores} setValores={setValores} />
          </div>
          <div className="shrink-0">
            <SalasTable salas={salas} reload={loadData} />
          </div>
        </div>
        <div className="xl:col-span-8 flex flex-col">
          <VisaoCustos
            valores={valores}
            salas={salas}
            selectedSalaId={selectedSalaId}
            setSelectedSalaId={setSelectedSalaId}
            turnos={turnos}
            setTurnos={setTurnos}
            semanas={semanas}
            setSemanas={setSemanas}
          />
        </div>
      </div>

      <EvolucaoCustoHora horasMes={horasMes} />
    </div>
  )
}
