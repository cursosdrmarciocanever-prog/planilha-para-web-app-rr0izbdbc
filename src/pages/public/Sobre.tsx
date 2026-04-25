import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Sobre = () => {
  const team = [
    {
      name: 'Dr. Marcio Canever',
      role: 'Médico Endocrinologista',
      specialties: 'Medicina Esportiva, Nutrologia Esportiva',
      avatar: '👨‍⚕️',
    },
    {
      name: 'Edineia Canever',
      role: 'Nutricionista',
      specialties: 'Nutrição Integrativa e Comportamental',
      avatar: '👩‍⚕️',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-xl text-slate-900">Clínica Canever</span>
          </Link>
          <Button className="bg-emerald-600 hover:bg-emerald-700">WhatsApp</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-50 to-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Sobre a Clínica Canever</h1>
          <p className="text-xl text-slate-600">
            Um centro de excelência em saúde integrativa dedicado a transformar vidas através de
            medicina personalizada e humanizada.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">Nossa História</h2>
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              A Clínica Canever foi fundada com a missão de oferecer uma abordagem diferenciada em
              saúde, combinando o rigor científico da medicina tradicional com as práticas
              integrativas que tratam o paciente como um todo.
            </p>
            <p>
              Nossos fundadores, Dr. Marcio Canever e sua esposa Edineia Canever, trazem décadas de
              experiência em endocrinologia, medicina esportiva, nutrologia e nutrição
              comportamental. Essa combinação única de conhecimentos permite uma visão holística de
              cada paciente.
            </p>
            <p>
              Localizada em Maringá-PR, a clínica atende um público selecionado de classe A e B+,
              focando em qualidade sobre quantidade. Nosso objetivo é proporcionar resultados reais
              e sustentáveis, com um ticket médio que reflete o padrão premium de nossos serviços.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Nossa Equipe</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardHeader>
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-2xl">{member.name}</CardTitle>
                  <p className="text-emerald-600 font-semibold">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    <strong>Especialidades:</strong> {member.specialties}
                  </p>
                  <p className="text-slate-600 text-sm">
                    Com formação contínua e dedicação ao bem-estar dos pacientes, nossos
                    profissionais garantem atendimento de excelência.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Nossos Valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Excelência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Compromisso com os melhores padrões de atendimento e resultados comprovados.
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Humanidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Cada paciente é único e merece um tratamento personalizado e compassivo.
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Integridade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Transparência e ética em todas as nossas práticas e relacionamentos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Conheça Nossos Serviços</h2>
          <p className="text-xl mb-8 opacity-90">
            Descubra como podemos ajudá-lo a alcançar seus objetivos de saúde e bem-estar.
          </p>
          <Link to="/servicos">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
              Explorar Serviços
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center text-slate-400 text-sm">
          <p>&copy; 2026 Clínica Canever. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Sobre
