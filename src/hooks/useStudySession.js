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
      const totalHistoryPoints = newHistory.reduce((s, h) => s + h.points, 0)
      const maxHistoryPoints = newHistory.length * 4
      const iceScore = Math.max(
        0,
        Math.round((totalHistoryPoints / maxHistoryPoints) * 100)
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
        const totalPoints = Math.max(
          0,
          newResults.reduce((s, r) => s + r.points, 0)
        )
        const maxPoints = newResults.length * 4
        const ice =
          maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

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
  const runningPoints = Math.max(
    0,
    results.reduce((s, r) => s + r.points, 0)
  )
  const runningMaxPoints = results.length * 4
  const runningIce =
    runningMaxPoints > 0
      ? Math.round((runningPoints / runningMaxPoints) * 100)
      : 0

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
