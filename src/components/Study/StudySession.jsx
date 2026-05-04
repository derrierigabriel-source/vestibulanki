import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDueCards } from '../../services/cardService'
import { useStudySession } from '../../hooks/useStudySession'
import Flashcard from './Flashcard'
import SessionResult from './SessionResult'

export default function StudySession({ deck, onClose }) {
  const { user } = useAuth()
  const { startSession, answerCard, currentCard, currentIndex, sessionCards, isFinished, finalStats } = useStudySession()
  const [loadingCards, setLoadingCards] = useState(true)
  const [noCards, setNoCards] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingCards(true)
      const cards = await getDueCards(user.uid, [deck.id])
      if (cards.length === 0) {
        setNoCards(true)
      } else {
        startSession(cards)
      }
      setLoadingCards(false)
    }
    load()
  }, [deck.id, user.uid, startSession])

  const handleRestart = async () => {
    setLoadingCards(true)
    const cards = await getDueCards(user.uid, [deck.id])
    if (cards.length === 0) {
      setNoCards(true)
    } else {
      startSession(cards)
    }
    setLoadingCards(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div>
          <h2 className="font-semibold text-stone-900 dark:text-white">{deck.name}</h2>
          {!loadingCards && !noCards && !isFinished && (
            <p className="text-xs text-stone-400">{sessionCards.length} cards para revisar</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {loadingCards ? (
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <p className="text-sm">Carregando cards...</p>
          </div>
        ) : noCards ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              Tudo em dia!
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              Não há cards para revisar agora. Volte mais tarde!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        ) : isFinished && finalStats ? (
          <SessionResult
            stats={finalStats}
            deckName={deck.name}
            onRestart={handleRestart}
            onHome={onClose}
          />
        ) : currentCard ? (
          <Flashcard
            key={currentIndex}
            card={currentCard}
            onAnswer={answerCard}
            index={currentIndex}
            total={sessionCards.length}
          />
        ) : null}
      </div>
    </div>
  )
}
