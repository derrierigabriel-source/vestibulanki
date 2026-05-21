import { useState, useEffect, useCallback } from 'react'
import { Flag, Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function VestibularExam({ config, onFinish }) {
  const { deckConfigs, timeLimit } = config

  // Flatten all questions
  const [questions] = useState(() => {
    const all = []
    deckConfigs.forEach(({ deck, cards }) => {
      cards.forEach((card) => all.push({ ...card, deckId: deck.id, deckName: deck.name, deckColor: deck.color }))
    })
    return all
  })

  const [answers, setAnswers] = useState({}) // idx -> option | 'blank'
  const [flagged, setFlagged] = useState(new Set())
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft])

  const handleAnswer = (idx, option) => {
    setAnswers((prev) => ({ ...prev, [idx]: option }))
  }

  const toggleFlag = (idx) => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleSubmit = useCallback(() => {
    const duration = timeLimit - timeLeft
    const results = questions.map((q, i) => {
      const ans = answers[i]
      const blank = ans === undefined
      const correct = !blank && ans === q.correctOption
      const wrong = !blank && !correct
      return { cardId: q.id, deckId: q.deckId, deckName: q.deckName, chosen: ans ?? null, correct, blank, wrong, question: q }
    })
    onFinish({ results, duration, deckConfigs })
  }, [questions, answers, timeLeft, timeLimit, onFinish, deckConfigs])

  const q = questions[current]
  const answered = Object.keys(answers).length
  const isLow = timeLeft < 300

  // Group by deck for progress bar
  const deckProgress = deckConfigs.map(({ deck, cards }) => {
    const deckQ = questions.filter((q) => q.deckId === deck.id)
    const answeredDeck = deckQ.filter((_, gi) => {
      const globalIdx = questions.findIndex((q2) => q2.id === deckQ[gi]?.id && q2.deckId === deck.id)
      return answers[globalIdx] !== undefined
    }).length
    return { deck, total: cards.length, answered: answeredDeck }
  })

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            {answered}/{questions.length}
          </span>
          <div className="hidden sm:flex gap-1 flex-wrap max-w-xs">
            {deckProgress.map(({ deck, total, answered: a }) => (
              <div key={deck.id} className="flex items-center gap-1 text-xs text-stone-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: deck.color }} />
                {a}/{total}
              </div>
            ))}
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
          isLow
            ? 'bg-red-100 dark:bg-red-900/20 text-red-600'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
        }`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Entregar
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question list sidebar (desktop) */}
        <div className="hidden lg:flex flex-col w-48 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-y-auto p-3 gap-1.5 flex-shrink-0">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                current === i
                  ? 'bg-teal-600 text-white'
                  : answers[i] !== undefined
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {flagged.has(i) && <Flag className="w-3 h-3 text-amber-500" />}
              {!flagged.has(i) && <span className="w-3" />}
              Q{i + 1}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col max-w-2xl mx-auto w-full">
          {/* Question header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: q.deckColor }} />
            <span className="text-sm text-stone-500 dark:text-stone-400">{q.deckName}</span>
            <span className="ml-auto text-sm text-stone-400">Questão {current + 1} de {questions.length}</span>
            <button
              onClick={() => toggleFlag(current)}
              className={`p-1.5 rounded-lg transition-colors ${
                flagged.has(current)
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 mb-4">
            <p
              className="text-base font-medium text-stone-800 dark:text-stone-100 leading-relaxed mb-5"
              style={{ fontFamily: 'Instrument Serif, serif' }}
            >
              {q.front}
            </p>
            <div className="space-y-2.5">
              {(q.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(current, i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    answers[current] === i
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
                  }`}
                >
                  <span className="font-bold text-stone-400 mr-2">{LETTER[i]})</span>
                  {opt}
                </button>
              ))}
            </div>
            {/* Leave blank */}
            <button
              onClick={() => {
                setAnswers((prev) => {
                  const next = { ...prev }
                  delete next[current]
                  return next
                })
              }}
              className="mt-3 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Deixar em branco
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Entregar simulado?</h3>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
              Você respondeu <strong className="text-stone-700 dark:text-stone-300">{answered}</strong> de{' '}
              <strong className="text-stone-700 dark:text-stone-300">{questions.length}</strong> questões.
              As questões em branco valem 0 pontos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
