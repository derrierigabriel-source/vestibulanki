import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Zap, BarChart2, GraduationCap, Brain, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Repetição Espaçada',
    desc: 'Algoritmo inteligente que agenda cada card no momento certo para fixação máxima.',
  },
  {
    icon: Zap,
    title: 'Pontuação ICE',
    desc: 'Índice de Confiabilidade do Estudo que detecta chutes e descuidos automaticamente.',
  },
  {
    icon: GraduationCap,
    title: 'Modo Vestibular',
    desc: 'Simulados com pontuação oficial UFPR, timer e gabarito completo ao final.',
  },
  {
    icon: BarChart2,
    title: 'Dashboard de Progresso',
    desc: 'Gráficos, streak diário e análise dos cards mais problemáticos.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/decks', { replace: true })
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-stone-900 dark:text-white text-lg"
              style={{ fontFamily: 'Instrument Serif, serif' }}
            >
              FlashCard Pro
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-6 border border-teal-200 dark:border-teal-800">
          <Zap className="w-3.5 h-3.5" /> Estudo inteligente para o vestibular
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-white max-w-3xl leading-tight mb-6"
          style={{ fontFamily: 'Instrument Serif, serif' }}
        >
          Flashcards que{' '}
          <span className="text-teal-600 dark:text-teal-400">aprendem com você</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-xl mb-10 leading-relaxed">
          Crie baralhos, estude com repetição espaçada e acompanhe seu progresso com um
          sistema de pontuação que evita chutes e reforça o conhecimento real.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            to="/login"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            Começar gratuitamente
          </Link>
          <a
            href="#features"
            className="px-6 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Ver funcionalidades
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <h2
          className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white text-center mb-10"
          style={{ fontFamily: 'Instrument Serif, serif' }}
        >
          Tudo que você precisa para estudar melhor
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-white mb-1.5">{title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="mt-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8">
          <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-5">
            O que está incluído
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Baralhos com múltipla escolha e questões abertas',
              '2 baralhos de exemplo prontos para estudar',
              'Algoritmo de repetição espaçada com filas Urgente / Em breve / Consolidado',
              'Pontuação ICE anti-chute e anti-descuido',
              'Modo Vestibular UFPR com timer e gabarito',
              'Animação flip 3D nos flashcards',
              'Dark mode e interface mobile-first',
              'Gráficos de desempenho e streak de estudos',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-600 dark:text-stone-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-12 text-center">
          <Link
            to="/login"
            className="inline-flex px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Criar conta e começar →
          </Link>
          <p className="text-xs text-stone-400 mt-3">Gratuito. Sem cartão de crédito.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-400 dark:text-stone-600">
        FlashCard Pro — Estudo inteligente para o vestibular
      </footer>
    </div>
  )
}
