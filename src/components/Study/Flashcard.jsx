import { useState } from 'react'
import { CheckCircle, XCircle, Frown, Meh, Smile } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

const DIFF_LABEL = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }
const DIFF_COLOR = {
  easy:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
  hard:   'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300',
}

export default function Flashcard({ card, onAnswer, index, total }) {
  const [flipped, setFlipped] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPerceived, setShowPerceived] = useState(false)
  const [result, setResult] = useState(null)

  const handleFlip = () => setFlipped(true)

  const handleMultipleSelect = (idx) => {
    if (flipped) return
    setSelectedOption(idx)
    setResult(idx === card.correctOption ? 'correct' : 'wrong')
    setFlipped(true)
    setTimeout(() => setShowPerceived(true), 420)
  }

  const handleOpenResult = (res) => {
    setResult(res)
    setShowPerceived(true)
  }

  const handlePerceived = (perceived) => {
    onAnswer(result, perceived)
    setFlipped(false)
    setSelectedOption(null)
    setShowPerceived(false)
    setResult(null)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">

      {/* ── HUD ── */}
      <div className="w-full mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Card <span className="text-teal-500 font-bold">{index + 1}</span> de {total}
          </span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${DIFF_COLOR[card.difficulty]}`}>
            {DIFF_LABEL[card.difficulty]}
          </span>
        </div>
        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Flip card ── */}
      <div className="w-full" style={{ perspective: '1200px' }}>
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front — position:relative sets the wrapper height */}
          <div
            className="relative w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg p-7 flex flex-col gap-5"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="text-xl font-medium text-stone-800 dark:text-stone-100 text-center leading-relaxed"
              style={{ fontFamily: 'Instrument Serif, serif' }}
            >
              {card.front}
            </p>

            {card.type === 'multiple' ? (
              <div className="flex flex-col gap-2.5">
                {(card.options || []).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMultipleSelect(i)}
                    disabled={flipped}
                    className={`w-full text-left px-5 py-3 rounded-xl border text-base font-medium transition-all ${
                      selectedOption === i
                        ? i === card.correctOption
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
                        : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    <span className="font-bold mr-2.5 text-stone-400">{LETTER[i]})</span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={handleFlip}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-base font-semibold transition-colors"
              >
                Ver resposta
              </button>
            )}
          </div>

          {/* Back — absolute overlay, same size as front */}
          <div
            className="absolute inset-0 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg p-7 flex flex-col gap-4"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {card.type === 'multiple' && (
              <div className={`flex items-center gap-2 text-base font-semibold px-4 py-2.5 rounded-xl ${
                result === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600'
              }`}>
                {result === 'correct'
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  : <XCircle className="w-5 h-5 flex-shrink-0" />}
                {result === 'correct'
                  ? 'Correto!'
                  : `Incorreto — Resposta: ${LETTER[card.correctOption]})`}
              </div>
            )}

            <p
              className="text-lg text-stone-800 dark:text-stone-100 leading-relaxed flex-1"
              style={{ fontFamily: 'Instrument Serif, serif' }}
            >
              {card.back}
            </p>

            {card.type === 'open' && !showPerceived && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleOpenResult('wrong')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-base font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Errei
                </button>
                <button
                  onClick={() => handleOpenResult('correct')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl text-base font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Acertei
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dificuldade percebida ── */}
      {showPerceived && (
        <div className="w-full mt-4 bg-stone-50 dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700">
          <p className="text-base font-medium text-stone-600 dark:text-stone-400 text-center mb-4">
            Como foi para você?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handlePerceived('hard')}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Frown className="w-6 h-6" />
              <span className="text-sm font-medium">Muito difícil</span>
            </button>
            <button
              onClick={() => handlePerceived('medium')}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <Meh className="w-6 h-6" />
              <span className="text-sm font-medium">Médio</span>
            </button>
            <button
              onClick={() => handlePerceived('easy')}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <Smile className="w-6 h-6" />
              <span className="text-sm font-medium">Fácil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
