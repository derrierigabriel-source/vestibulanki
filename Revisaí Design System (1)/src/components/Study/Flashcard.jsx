import { useState } from 'react'
import { CheckCircle, XCircle, Frown, Meh, Smile } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

export default function Flashcard({ card, onAnswer, index, total }) {
  const [flipped, setFlipped] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPerceived, setShowPerceived] = useState(false)
  const [result, setResult] = useState(null) // 'correct' | 'wrong'

  const handleFlip = () => setFlipped(true)

  const handleMultipleSelect = (idx) => {
    if (flipped) return
    setSelectedOption(idx)
    const correct = idx === card.correctOption ? 'correct' : 'wrong'
    setResult(correct)
    setFlipped(true)
    setTimeout(() => setShowPerceived(true), 400)
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
      {/* Progress */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
          <span>Card {index + 1} de {total}</span>
          <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
            {card.difficulty === 'easy' ? 'Fácil' : card.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </span>
        </div>
        <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card with 3D flip */}
      <div className="w-full" style={{ perspective: '1200px' }}>
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '240px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg p-6 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="text-lg font-medium text-stone-800 dark:text-stone-100 text-center leading-relaxed"
              style={{ fontFamily: 'Instrument Serif, serif' }}
            >
              {card.front}
            </p>

            {card.type === 'multiple' ? (
              <div className="space-y-2 mt-4">
                {(card.options || []).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMultipleSelect(i)}
                    disabled={flipped}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedOption === i
                        ? i === card.correctOption
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
                        : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    <span className="font-bold mr-2 text-stone-400">{LETTER[i]})</span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={handleFlip}
                className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
              >
                Ver resposta
              </button>
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg p-6 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              {card.type === 'multiple' && (
                <div className={`mb-3 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${
                  result === 'correct'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                }`}>
                  {result === 'correct' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {result === 'correct' ? 'Correto!' : `Incorreto — Resposta: ${LETTER[card.correctOption]})`}
                </div>
              )}
              <p
                className="text-base text-stone-800 dark:text-stone-100 leading-relaxed"
                style={{ fontFamily: 'Instrument Serif, serif' }}
              >
                {card.back}
              </p>
            </div>

            {card.type === 'open' && !showPerceived && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleOpenResult('wrong')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Errei
                </button>
                <button
                  onClick={() => handleOpenResult('correct')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Acertei
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Perceived difficulty */}
      {showPerceived && (
        <div className="w-full mt-4 bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 border border-stone-200 dark:border-stone-700">
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 text-center mb-3">
            Como foi para você?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePerceived('hard')}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Frown className="w-5 h-5" />
              <span className="text-xs font-medium">Muito difícil</span>
            </button>
            <button
              onClick={() => handlePerceived('medium')}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <Meh className="w-5 h-5" />
              <span className="text-xs font-medium">Médio</span>
            </button>
            <button
              onClick={() => handlePerceived('easy')}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <Smile className="w-5 h-5" />
              <span className="text-xs font-medium">Fácil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
