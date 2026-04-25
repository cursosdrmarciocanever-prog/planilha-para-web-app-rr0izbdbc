import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Calendar, User, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Blog = () => {
  const articles = [
    {
      id: 1,
      title: 'A Importância do Equilíbrio Hormonal para a Saúde',
      excerpt: 'Entenda como os hormônios afetam sua saúde, energia e qualidade de vida.',
      author: 'Dr. Marcio Canever',
      date: '15 de Março, 2026',
      category: 'Saúde',
      image: '🔬',
    },
    {
      id: 2,
      title: 'Nutrição Integrativa: Além da Contagem de Calorias',
      excerpt: 'Descubra como a nutrição comportamental pode transformar sua relação com a comida.',
      author: 'Edineia Canever',
      date: '12 de Março, 2026',
      category: 'Nutrição',
      image: '🥗',
    },
    {
      id: 3,
      title: 'Performance Esportiva: Otimizando Seu Potencial',
      excerpt: 'Conheça os protocolos que atletas profissionais usam para melhorar desempenho.',
      author: 'Dr. Marcio Canever',
      date: '10 de Março, 2026',
      category: 'Esportes',
      image: '💪',
    },
    {
      id: 4,
      title: 'Longevidade: Vivendo Mais e Melhor',
      excerpt: 'Estratégias científicas para aumentar sua expectativa de vida com qualidade.',
      author: 'Dr. Marcio Canever',
      date: '8 de Março, 2026',
      category: 'Bem-estar',
      image: '🌟',
    },
    {
      id: 5,
      title: 'Soroterapia: Revitalizando Seu Corpo',
      excerpt: 'Entenda como os protocolos de soroterapia podem potencializar sua saúde.',
      author: 'Edineia Canever',
      date: '5 de Março, 2026',
      category: 'Tratamentos',
      image: '💉',
    },
    {
      id: 6,
      title: 'Sono e Recuperação: Pilares da Saúde',
      excerpt: 'Por que o sono de qualidade é essencial para sua saúde e performance.',
      author: 'Dr. Marcio Canever',
      date: '1 de Março, 2026',
      category: 'Bem-estar',
      image: '😴',
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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Blog da Clínica Canever</h1>
          <p className="text-xl text-slate-600">
            Artigos e insights sobre saúde integrativa, bem-estar e longevidade.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Artigo em Destaque</h2>
          <Card className="border-slate-200 overflow-hidden hover:shadow-lg transition">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-br from-emerald-100 to-slate-100 flex items-center justify-center p-8">
                <span className="text-8xl">{articles[0].image}</span>
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      {articles[0].category}
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {articles[0].date}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{articles[0].title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">{articles[0].excerpt}</p>
                  <div className="flex items-center gap-4">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 text-sm">{articles[0].author}</span>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Todos os Artigos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <Card
                key={article.id}
                className="border-slate-200 hover:border-emerald-200 hover:shadow-lg transition flex flex-col"
              >
                <div className="bg-gradient-to-br from-emerald-100 to-slate-100 h-40 flex items-center justify-center">
                  <span className="text-6xl">{article.image}</span>
                </div>
                <CardHeader className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date.split(' de ')[0]}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-600 text-sm mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      Ler <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Receba Novos Artigos</h2>
          <p className="text-xl mb-8 opacity-90">
            Inscreva-se para receber nossos artigos sobre saúde e bem-estar direto no seu email.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 rounded text-slate-900"
            />
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
              Inscrever
            </Button>
          </div>
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

export default Blog
