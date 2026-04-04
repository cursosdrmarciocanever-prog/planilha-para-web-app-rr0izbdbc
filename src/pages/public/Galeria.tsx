import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Galeria = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const galleryItems = [
    {
      id: 1,
      title: 'Consultório Principal',
      category: 'Espaço',
      emoji: '🏥'
    },
    {
      id: 2,
      title: 'Sala de Procedimentos',
      category: 'Instalações',
      emoji: '🔬'
    },
    {
      id: 3,
      title: 'Área de Espera',
      category: 'Espaço',
      emoji: '🛋️'
    },
    {
      id: 4,
      title: 'Laboratório',
      category: 'Instalações',
      emoji: '🧪'
    },
    {
      id: 5,
      title: 'Sala de Soroterapia',
      category: 'Tratamentos',
      emoji: '💉'
    },
    {
      id: 6,
      title: 'Equipamentos Modernos',
      category: 'Tecnologia',
      emoji: '⚙️'
    },
    {
      id: 7,
      title: 'Recepção',
      category: 'Espaço',
      emoji: '🎯'
    },
    {
      id: 8,
      title: 'Consultório Secundário',
      category: 'Espaço',
      emoji: '🏢'
    },
    {
      id: 9,
      title: 'Área de Descanso',
      category: 'Espaço',
      emoji: '🌿'
    }
  ]

  const categories = ['Todos', 'Espaço', 'Instalações', 'Tratamentos', 'Tecnologia']
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const filteredItems = selectedCategory === 'Todos'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory)

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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Galeria</h1>
          <p className="text-xl text-slate-600">
            Conheça os espaços e instalações da Clínica Canever.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item.id)}
                className="group cursor-pointer relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-100 to-slate-100 aspect-square hover:shadow-lg transition"
              >
                <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-8xl">{item.emoji}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-6">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-200">{item.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-emerald-100 to-slate-100 rounded-lg flex items-center justify-center aspect-video mb-6">
              <span className="text-9xl">
                {galleryItems.find(item => item.id === selectedImage)?.emoji}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {galleryItems.find(item => item.id === selectedImage)?.title}
              </h2>
              <p className="text-emerald-600 font-semibold mb-6">
                {galleryItems.find(item => item.id === selectedImage)?.category}
              </p>
              <p className="text-slate-600 mb-6">
                Conheça de perto os espaços e instalações modernas da Clínica Canever, equipados com tecnologia de ponta para seu conforto e segurança.
              </p>
              <Button
                onClick={() => setSelectedImage(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Visite Nossa Clínica</h2>
          <p className="text-xl text-slate-600 mb-8">
            Agende uma visita e conheça pessoalmente nossos espaços e equipe.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Agendar Visita
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

export default Galeria
