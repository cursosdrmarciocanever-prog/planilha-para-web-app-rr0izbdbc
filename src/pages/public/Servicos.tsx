import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Servicos = () => {
  const services = [
    {
      title: 'Avaliação Hormonal Completa',
      description: 'Análise minuciosa do perfil hormonal',
      details: [
        'Identificação de desequilíbrios hormonais',
        'Protocolos de reposição hormonal personalizados',
        'Implantes hormonais biodisponíveis',
        'Monitoramento contínuo'
      ]
    },
    {
      title: 'Medicina Esportiva Avançada',
      description: 'Otimização de desempenho físico',
      details: [
        'Avaliação de performance para atletas',
        'Protocolos de recuperação muscular',
        'Otimização de composição corporal',
        'Acompanhamento de atletas profissionais'
      ]
    },
    {
      title: 'Soroterapia Personalizada',
      description: 'Protocolos exclusivos de revitalização',
      details: [
        'Vitaminas e minerais de alta biodisponibilidade',
        'Aminoácidos essenciais',
        'Desintoxicação celular',
        'Fortalecimento do sistema imunológico'
      ]
    },
    {
      title: 'Análise Detalhada de Exames',
      description: 'Interpretação minuciosa de marcadores',
      details: [
        'Análise além dos parâmetros convencionais',
        'Identificação de padrões subclínicos',
        'Prevenção de doenças futuras',
        'Relatório personalizado'
      ]
    },
    {
      title: 'Tratamentos Injetáveis',
      description: 'Aplicação segura e eficaz',
      details: [
        'Sala especializada e equipada',
        'Procedimentos seguros e confortáveis',
        'Profissionais treinados',
        'Acompanhamento pós-procedimento'
      ]
    },
    {
      title: 'Medicina do Estilo de Vida',
      description: 'Hábitos saudáveis para longevidade',
      details: [
        'Orientação nutricional personalizada',
        'Programa de exercícios adaptado',
        'Gestão do estresse',
        'Sono e recuperação'
      ]
    }
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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Nossos Serviços</h1>
          <p className="text-xl text-slate-600">
            Soluções completas de saúde integrativa para cada etapa da sua vida.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <Card key={idx} className="border-slate-200 hover:border-emerald-200 hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <p className="text-emerald-600 font-semibold mt-2">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">Investimento em Sua Saúde</h2>
          <p className="text-xl text-slate-600 mb-8">
            Cada tratamento é personalizado conforme suas necessidades. Entre em contato para uma avaliação e orçamento específico.
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            Solicitar Orçamento
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Como Funciona</h2>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Avaliação Inicial',
                description: 'Conhecemos sua história, objetivos e desafios de saúde'
              },
              {
                step: '2',
                title: 'Exames Detalhados',
                description: 'Realizamos análises completas para entender seu corpo profundamente'
              },
              {
                step: '3',
                title: 'Plano Personalizado',
                description: 'Desenvolvemos um protocolo específico para seus objetivos'
              },
              {
                step: '4',
                title: 'Acompanhamento',
                description: 'Monitoramos seu progresso e ajustamos conforme necessário'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Agende sua consulta inicial e descubra como podemos transformar sua saúde.
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
            Agendar Consulta
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
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

export default Servicos
