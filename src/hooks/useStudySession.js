import { useState, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { updateCard } from '../services/cardService'
import { saveSession } from '../services/statsService'
import { useSpacedRepetition } from './useSpacedRepetition'

export function useStudySession() {
  const { user } = useAuth()
  const { processCardResult } = useSpacedRepetition()

  const [sessionCards, setSessionCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState([])
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [finalStats, setFinalStats] = useState(null)

  const startSession = useCallback((cards) => {
    setSessionCards(cards)
    setCurrentIndex(0)
    setResults([])
    setSessionStartTime(Date.now())
    setIsFinished(false)
    setFinalStats(null)
  }, [])

  const answerCard = useCallback(
    async (result, perceived) => {
      const card = sessionCards[currentIndex]
      const { points, nextReview, queue } = processCardResult(result, perceived)

      const historyEntry = {
        result,
        perceived,
        points,
        date: new Date().toISOString(),
      }

      const newHistory = [...(card.history || []), historyEntry]
      const correctCount = newHistory.filter((h) => h.result === 'correct').length
      const correctRate = Math.round((correctCount / newHistory.length) * 100)
      // ICE: começa em 100%, sobe com acertos, cai com erros
      // Fórmula: (maxPossível + deltaAcumulado) / maxPossível × 100, limitado a [0, 100]
      const maxHistoryPoints = newHistory.length * 4
      const deltaSum = newHistory.reduce((s, h) => s + h.points, 0)
      const iceScore = Math.min(
        100,
        Math.max(0, Math.round(((maxHistoryPoints + deltaSum) / maxHistoryPoints) * 100))
      )

      await updateCard(user.uid, card.deckId, card.id, {
        queue,
        nextReview: Timestamp.fromDate(nextReview),
        history: newHistory,
        correctRate,
        iceScore,
      })

      const cardResult = {
        cardId: card.id,
        deckId: card.deckId,
        front: card.front,
        result,
        perceived,
        points,
      }
      const newResults = [...results, cardResult]
      setResults(newResults)

      if (currentIndex + 1 >= sessionCards.length) {
        const duration = Math.round((Date.now() - sessionStartTime) / 1000)
        const maxPoints = newResults.length * 4
        const deltaSum = newResults.reduce((s, r) => s + r.points, 0)
        const totalPoints = Math.max(0, maxPoints + deltaSum)
        const ice =
          maxPoints > 0
            ? Math.min(100, Math.max(0, Math.round(((maxPoints + deltaSum) / maxPoints) * 100)))
            : 100

        const stats = { duration, totalPoints, maxPoints, ice, cards: newResults }
        setFinalStats(stats)

        await saveSession(user.uid, {
          deckIds: [...new Set(sessionCards.map((c) => c.deckId))],
          ...stats,
        })

        setIsFinished(true)
      } else {
        setCurrentIndex((i) => i + 1)
      }
    },
    [sessionCards, currentIndex, results, sessionStartTime, user, processCardResult]
  )

  const currentCard = sessionCards[currentIndex]
  const runningMaxPoints = results.length * 4
  const runningDeltaSum = results.reduce((s, r) => s + r.points, 0)
  const runningPoints = Math.max(0, runningMaxPoints + runningDeltaSum)
  const runningIce =
    runningMaxPoints > 0
      ? Math.min(100, Math.max(0, Math.round(((runningMaxPoints + runningDeltaSum) / runningMaxPoints) * 100)))
      : 100

  return {
    sessionCards,
    currentCard,
    currentIndex,
    results,
    isFinished,
    finalStats,
    runningPoints,
    runningIce,
    startSession,
    answerCard,
  }
}
