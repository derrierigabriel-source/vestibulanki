export function useSpacedRepetition() {
  const POINTS_MATRIX = {
    correct: { hard: 4, medium: 3, easy: 2 },
    wrong: { hard: -1, medium: -2, easy: -4 },
  }

  const INTERVALS_DAYS = {
    wrong: { easy: 1, medium: 2, hard: 3 },
    correct: { hard: 5, medium: 7, easy: 14 },
  }

  const QUEUES = {
    wrong: { easy: 'urgent', medium: 'urgent', hard: 'soon' },
    correct: { hard: 'soon', medium: 'soon', easy: 'consolidated' },
  }

  const calculatePoints = (result, perceived) =>
    POINTS_MATRIX[result][perceived]

  const getNextReview = (result, perceived) => {
    const days = INTERVALS_DAYS[result][perceived]
    const next = new Date()
    next.setDate(next.getDate() + days)
    return next
  }

  const getQueue = (result, perceived) => QUEUES[result][perceived]

  const processCardResult = (result, perceived) => ({
    points: calculatePoints(result, perceived),
    nextReview: getNextReview(result, perceived),
    queue: getQueue(result, perceived),
  })

  return { processCardResult, calculatePoints, getNextReview, getQueue, POINTS_MATRIX }
}
