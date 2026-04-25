import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Users, Zap, Award, ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  const services = [
    {
      icon: Heart,
      title: 'Avaliação Hormonal Completa',
      description:
        'Análise minuciosa do perfil hormonal para identificar desequilíbrios que comprometem a saúde e qualidade de vida',
    },
    {
      icon: Zap,
      title: 'Medicina Esportiva Avançada',
      description:
        'Otimização de desempenho físico, recuperação muscular e composição corporal para atletas',
    },
    {
      icon: Award,
      title: 'Soroterapia Personalizada',
      description:
        'Protocolos exclusivos com vitaminas, minerais e aminoácidos para revitalização celular',
    },
  ]

  const testimonials = [
    {
      name: 'João Silva',
      role: 'Empresário',
      text: 'Transformou minha saúde e energia. Recomendo para todos que buscam qualidade de vida.',
      avatar: '👨‍💼',
    },
    {
      name: 'Maria Santos',
      role: 'Atleta',
      text: 'O melhor acompanhamento que já tive. Resultados visíveis em poucas semanas.',
      avatar: '👩‍🦰',
    },
    {
      name: 'Carlos Mendes',
      role: 'Executivo',
      text: 'Profissionalismo e dedicação em cada consulta. Muito satisfeito com o tratamento.',
      avatar: '👨‍💻',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-xl text-slate-900">Clínica Canever</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/sobre" className="text-slate-600 hover:text-emerald-600 transition">
              Sobre
            </Link>
            <Link to="/servicos" className="text-slate-600 hover:text-emerald-600 transition">
              Serviços
            </Link>
            <Link to="/blog" className="text-slate-600 hover:text-emerald-600 transition">
              Blog
            </Link>
            <Link to="/galeria" className="text-slate-600 hover:text-emerald-600 transition">
              Galeria
            </Link>
            <Link to="/contato" className="text-slate-600 hover:text-emerald-600 transition">
              Contato
            </Link>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Saúde Integrativa para uma Vida Plena
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Na Clínica Canever, combinamos medicina tradicional com práticas integrativas para
            tratar as origens dos problemas de saúde, não apenas os sintomas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Agendar Consulta
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Nossos Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon
              return (
                <Card
                  key={idx}
                  className="border-slate-200 hover:border-emerald-200 hover:shadow-lg transition"
                >
                  <CardHeader>
                    <Icon className="w-12 h-12 text-emerald-600 mb-4" />
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
            Depoimentos de Pacientes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Transformar Sua Saúde?</h2>
          <p className="text-xl mb-8 opacity-90">
            Agende sua consulta com os especialistas da Clínica Canever e comece sua jornada para o
            bem-estar.
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
            Agendar Agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Clínica Canever</h3>
              <p className="text-slate-400 text-sm">Centro de excelência em saúde integrativa</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/sobre" className="hover:text-white">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/servicos" className="hover:text-white">
                    Serviços
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="hover:text-white">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📍 Maringá, PR</li>
                <li>📞 +55 (44) 99167-1203</li>
                <li>✉️ contato@clinicacanever.com.br</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Horários</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Seg-Sex: 8h às 18h</li>
                <li>Sábado: Sob agendamento</li>
                <li>Domingo: Fechado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 Clínica Canever. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
