import { Trophy, Target, Clock, RotateCcw, Home, TrendingUp } from 'lucide-react'

function IceBadge({ ice }) {
  if (ice >= 80) return { label: 'Excelente', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
  if (ice >= 60) return { label: 'Bom', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' }
  if (ice >= 40) return { label: 'Regular', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
  return { label: 'Precisa estudar mais', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function SessionResult({ stats, deckName, onRestart, onHome }) {
  const { duration, totalPoints, maxPoints, ice, cards } = stats
  const badge = IceBadge({ ice })

  const correctCount = cards.filter((c) => c.result === 'correct').length
  const wrongCount = cards.filter((c) => c.result === 'wrong').length

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Trophy */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${badge.bg}`}>
          <Trophy className={`w-10 h-10 ${badge.color}`} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Sessão concluída!
        </h2>
        <p className="text-stone-500 dark:text-stone-400">{deckName}</p>
      </div>

      {/* ICE */}
      <div className={`rounded-2xl p-5 mb-4 text-center ${badge.bg}`}>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">
          ICE — Índice de Confiabilidade
        </p>
        <div className={`text-5xl font-bold ${badge.color} mb-1`}>{ice}%</div>
        <p className={`text-sm font-semibold ${badge.color}`}>{badge.label}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <Target className="w-5 h-5 text-teal-500 mx-auto mb-1.5" />
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            {totalPoints}/{maxPoints}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">Pontos</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            {correctCount}/{cards.length}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">Acertos</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            {formatDuration(duration)}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">Tempo</p>
        </div>
      </div>

      {/* Card breakdown */}
      {cards.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
            Resumo dos cards
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cards.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  c.result === 'correct' ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span className="flex-1 text-stone-600 dark:text-stone-400 truncate">{c.front}</span>
                <span className={`text-xs font-bold ${c.points >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {c.points >= 0 ? '+' : ''}{c.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Home className="w-4 h-4" /> Início
        </button>
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Estudar novamente
        </button>
      </div>
    </div>
  )
}
