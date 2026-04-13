import { useState } from 'react'
import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp, CheckCircle, XCircle, Minus } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function VestibularResult({ examData, onRetry, onHome }) {
  const { results, duration, deckConfigs } = examData
  const [expandedDeck, setExpandedDeck] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // UFPR scoring
  const totalScore = results.reduce((sum, r) => {
    if (r.correct) return sum + 1
    if (r.wrong) return sum - 0.25
    return sum
  }, 0)
  const finalScore = Math.max(0, totalScore)

  // By deck
  const deckScores = deckConfigs.map(({ deck }) => {
    const deckResults = results.filter((r) => r.deckId === deck.id)
    const correct = deckResults.filter((r) => r.correct).length
    const wrong = deckResults.filter((r) => r.wrong).length
    const blank = deckResults.filter((r) => r.blank).length
    const score = Math.max(0, correct - wrong * 0.25)
    return { deck, correct, wrong, blank, total: deckResults.length, score, results: deckResults }
  })

  const correctCount = results.filter((r) => r.correct).length
  const wrongCount = results.filter((r) => r.wrong).length
  const blankCount = results.filter((r) => r.blank).length

  const UFPR_REFERENCE = 42 // fictional reference score

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          finalScore >= UFPR_REFERENCE ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
        }`}>
          <Trophy className={`w-10 h-10 ${finalScore >= UFPR_REFERENCE ? 'text-emerald-500' : 'text-amber-500'}`} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Resultado do Simulado
        </h2>
        <p className="text-stone-400 text-sm">Tempo: {formatDuration(duration)}</p>
      </div>

      {/* Score */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 mb-4 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Pontuação total (UFPR)</p>
        <div className="text-5xl font-bold text-stone-900 dark:text-white mb-2">
          {finalScore.toFixed(2)}
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          finalScore >= UFPR_REFERENCE
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
        }`}>
          {finalScore >= UFPR_REFERENCE ? '✓ Acima da nota de corte' : '↓ Abaixo da nota de corte'}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          Referência UFPR 2024: {UFPR_REFERENCE} pontos (fictício)
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-600">{correctCount}</div>
          <p className="text-xs text-stone-500">Acertos</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
          <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
          <p className="text-xs text-stone-500">Erros</p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 text-center">
          <Minus className="w-5 h-5 text-stone-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-stone-500">{blankCount}</div>
          <p className="text-xs text-stone-500">Em branco</p>
        </div>
      </div>

      {/* By deck */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Por matéria</h3>
        </div>
        {deckScores.map(({ deck, correct, wrong, blank, total, score, results: dr }) => (
          <div key={deck.id} className="border-b border-stone-100 dark:border-stone-800 last:border-0">
            <button
              onClick={() => setExpandedDeck(expandedDeck === deck.id ? null : deck.id)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deck.color }} />
              <span className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-300">
                {deck.name}
              </span>
              <span className="text-sm font-bold text-stone-900 dark:text-white">{score.toFixed(2)}</span>
              <span className="text-xs text-stone-400">{correct}/{total}</span>
              {expandedDeck === deck.id ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {expandedDeck === deck.id && (
              <div className="px-5 pb-3 space-y-2">
                {dr.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-t border-stone-100 dark:border-stone-800">
                    <span className={`flex-shrink-0 mt-0.5 ${
                      r.correct ? 'text-emerald-500' : r.wrong ? 'text-red-500' : 'text-stone-400'
                    }`}>
                      {r.correct ? <CheckCircle className="w-4 h-4" /> : r.wrong ? <XCircle className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-1">
                        {r.question.front}
                      </p>
                      {r.wrong && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          ✓ {LETTER[r.question.correctOption]}) {r.question.options?.[r.question.correctOption]}
                        </p>
                      )}
                      {r.wrong && (
                        <p className="text-xs text-stone-400 mt-1 italic">{r.question.back}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      r.correct ? 'text-emerald-500' : r.wrong ? 'text-red-500' : 'text-stone-400'
                    }`}>
                      {r.correct ? '+1,00' : r.wrong ? '−0,25' : '0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Home className="w-4 h-4" /> Início
        </button>
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Novo simulado
        </button>
      </div>
    </div>
  )
}
