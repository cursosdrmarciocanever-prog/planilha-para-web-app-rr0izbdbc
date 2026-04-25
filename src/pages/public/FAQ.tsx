import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: 'Como agendar uma consulta?',
      answer:
        'Você pode agendar através do WhatsApp, por telefone ou preenchendo o formulário de contato no site. Nossa equipe entrará em contato para confirmar o horário disponível.',
    },
    {
      question: 'Qual é o valor de uma consulta?',
      answer:
        'O valor varia conforme o tipo de serviço e avaliação necessária. Recomendamos entrar em contato para uma avaliação inicial e orçamento personalizado.',
    },
    {
      question: 'Vocês aceitam convênios?',
      answer:
        'Não. A Clínica Canever trabalha com pacientes particulares, focando em qualidade e atendimento personalizado.',
    },
    {
      question: 'Quanto tempo dura uma consulta?',
      answer:
        'A primeira consulta geralmente dura entre 60 a 90 minutos, incluindo anamnese completa e avaliação. Consultas de acompanhamento têm duração de 30 a 45 minutos.',
    },
    {
      question: 'Quais exames vocês realizam?',
      answer:
        'Realizamos análises laboratoriais completas, avaliações hormonais, testes de performance e outros exames conforme necessário para cada paciente.',
    },
    {
      question: 'Qual é a localização da clínica?',
      answer:
        'Estamos localizados em Maringá, PR, na Av. Pedro Taques, 294 - Ed. Atrium. Funciona de segunda a sexta, das 8h às 18h.',
    },
    {
      question: 'Vocês oferecem atendimento online?',
      answer:
        'Sim, oferecemos consultas de acompanhamento por videoconferência. A primeira consulta deve ser presencial para avaliação completa.',
    },
    {
      question: 'Qual é o tempo para ver resultados?',
      answer:
        'Os resultados variam conforme o tratamento e o paciente. Geralmente, mudanças significativas são observadas entre 4 a 8 semanas de acompanhamento.',
    },
  ]

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Perguntas Frequentes</h1>
          <p className="text-xl text-slate-600">
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços.
          </p>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card
                key={idx}
                className="border-slate-200 cursor-pointer hover:border-emerald-200 transition"
                onClick={() => toggleItem(idx)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-900">{faq.question}</CardTitle>
                    <ChevronDown
                      className={`w-5 h-5 text-emerald-600 transition-transform ${
                        openItems.includes(idx) ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                {openItems.includes(idx) && (
                  <CardContent className="pt-0">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ainda tem dúvidas?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Entre em contato conosco. Estamos prontos para ajudar!
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Enviar Mensagem
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

export default FAQ
