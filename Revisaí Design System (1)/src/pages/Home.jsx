import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, Zap, Brain, GraduationCap, BarChart2,
  CheckCircle, ArrowRight, Repeat2, Target, Clock,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Estude do jeito certo',
    desc: 'O app decide quais cards você precisa rever hoje — você só precisa estudar. Nada de perder tempo com o que você já sabe.',
  },
  {
    icon: Target,
    title: 'Saiba se você realmente aprendeu',
    desc: 'A pontuação ICE detecta quando você acertou por chute ou errou por descuido, mostrando seu real nível de domínio.',
  },
  {
    icon: GraduationCap,
    title: 'Simulado do Vestibular',
    desc: 'Faça simulados no estilo UFPR com timer, placar oficial e gabarito completo. Treine exatamente como na prova.',
  },
  {
    icon: BarChart2,
    title: 'Acompanhe sua evolução',
    desc: 'Veja gráficos do seu desempenho, quantos dias seguidos você estudou e quais assuntos ainda precisam de atenção.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Crie seus baralhos',
    desc: 'Adicione os assuntos que você está estudando — ou deixe a IA criar os cards pra você em segundos.',
  },
  {
    step: '02',
    title: 'Estude todo dia',
    desc: 'O app mostra os cards certos na hora certa. Você responde, avalia sua confiança e o sistema aprende com você.',
  },
  {
    step: '03',
    title: 'Veja o resultado',
    desc: 'Seu ICE sobe, sua sequência de dias cresce, e na hora da prova você já sabe o que está consolidado.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()

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
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 dark:text-white text-lg" style={{ fontFamily: 'Instrument Serif, serif' }}>
              VestibulAnki
            </span>
          </div>
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Continuar estudando <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-6 border border-teal-200 dark:border-teal-800">
          <Zap className="w-3.5 h-3.5" /> Feito para quem quer passar no vestibular
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-white max-w-3xl leading-tight mb-6"
          style={{ fontFamily: 'Instrument Serif, serif' }}
        >
          Estude menos.<br />
          <span className="text-teal-600 dark:text-teal-400">Aprenda de verdade.</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-xl mb-10 leading-relaxed">
          O VestibulAnki usa repetição espaçada para você revisar cada assunto no momento
          certo — nem antes de precisar, nem depois de esquecer. É a forma mais eficiente
          de estudar para o vestibular.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {user ? (
            <Link
              to="/decks"
              className="flex items-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              Ir para meus baralhos <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                Criar conta grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="px-6 py-3.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Como funciona?
              </a>
            </>
          )}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white text-center mb-12" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Como funciona
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4"
                style={{ fontFamily: 'Instrument Serif, serif' }}>
                {step}
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Funcionalidades */}
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white text-center mb-10" style={{ fontFamily: 'Instrument Serif, serif' }}>
          O que você vai encontrar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex gap-4">
              <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 mb-16">
          <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-5">
            Tudo incluído, sem custo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Baralhos com questões de múltipla escolha e abertas',
              'Geração automática de cards com Inteligência Artificial',
              'Repetição espaçada que prioriza o que você está esquecendo',
              'Pontuação ICE que mede o domínio real do conteúdo',
              'Simulado no formato oficial do vestibular UFPR',
              'Histórico completo de desempenho com gráficos',
              'Funciona no celular e no computador',
              'Modo escuro para estudar à noite',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-600 dark:text-stone-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center bg-teal-600 rounded-2xl px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Pronto para estudar de forma inteligente?
          </h2>
          <p className="text-teal-100 text-sm mb-8 max-w-sm mx-auto">
            Crie sua conta em menos de 1 minuto e comece hoje mesmo com os baralhos de exemplo já prontos.
          </p>
          {user ? (
            <Link
              to="/decks"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
            >
              Ir para meus baralhos <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
            >
              Começar agora — é grátis <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-400 dark:text-stone-600">
        VestibulAnki — Estudo inteligente para o vestibular
      </footer>

    </div>
  )
}
