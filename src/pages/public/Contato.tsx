import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Contato = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você pode integrar com a API de contato
    console.log('Form submitted:', formData)
    alert('Mensagem enviada! Entraremos em contato em breve.')
    setFormData({ name: '', email: '', phone: '', message: '' })
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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Entre em Contato</h1>
          <p className="text-xl text-slate-600">
            Estamos aqui para responder suas dúvidas e agendar sua consulta.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-slate-200 text-center">
              <CardHeader>
                <Phone className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle>Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-semibold">+55 (44) 99167-1203</p>
                <p className="text-slate-500 text-sm mt-2">Seg-Sex: 8h às 18h</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 text-center">
              <CardHeader>
                <Mail className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-semibold">contato@clinicacanever.com.br</p>
                <p className="text-slate-500 text-sm mt-2">Resposta em até 24h</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 text-center">
              <CardHeader>
                <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-semibold">Maringá, PR</p>
                <p className="text-slate-500 text-sm mt-2">Av. Pedro Taques, 294</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Envie uma Mensagem</h2>
          <Card className="border-slate-200">
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+55 (44) 9999-9999"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mensagem</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Conte-nos como podemos ajudá-lo..."
                    required
                    rows={6}
                    className="w-full"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Prefere Conversar pelo WhatsApp?</h2>
          <p className="text-xl mb-8 opacity-90">
            Clique no botão abaixo para entrar em contato direto conosco.
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
            <MessageCircle className="w-4 h-4 mr-2" />
            Abrir WhatsApp
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

export default Contato
