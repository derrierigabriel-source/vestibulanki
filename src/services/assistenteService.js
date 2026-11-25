import { auth } from './firebase'
import { getDecks } from './deckService'
import { getCards } from './cardService'
import { getSessions, getSimulations } from './statsService'

const URL_ASSISTENTE = import.meta.env.VITE_ASSISTENTE_URL || 'http://localhost:8000'

const iso = (v) => {
  if (!v) return null
  const d = v.toDate ? v.toDate() : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/**
 * Lê os dados de estudo do aluno no Firestore e monta o JSON que o assistente usa.
 * Minimização de dados (LGPD): não envia nome, e-mail, foto nem o verso dos cards.
 */
export async function montarDadosDoAluno(uid) {
  const [decks, sessions, simulations] = await Promise.all([
    getDecks(uid),
    getSessions(uid, 60),
    getSimulations(uid),
  ])
  const decksComCards = await Promise.all(
    decks.map(async (d) => {
      const cards = await getCards(uid, d.id)
      return {
        id: d.id,
        name: d.name,
        category: d.category,
        cards: cards.map((c) => ({
          id: c.id,
          front: c.front,
          difficulty: c.difficulty,
          type: c.type,
          queue: c.queue,
          nextReview: iso(c.nextReview),
          iceScore: c.iceScore,
          correctRate: c.correctRate,
          history: (c.history || []).map((h) => ({
            result: h.result, perceived: h.perceived, points: h.points, date: iso(h.date),
          })),
        })),
      }
    })
  )
  return {
    agora: new Date().toISOString(),
    decks: decksComCards,
    sessions: sessions.map((s) => ({
      date: iso(s.date),
      deckIds: s.deckIds,
      duration: s.duration,
      totalPoints: s.totalPoints,
      maxPoints: s.maxPoints,
      ice: s.ice,
      cards: (s.cards || []).map(({ cardId, result, perceived, points }) => ({ cardId, result, perceived, points })),
    })),
    simulations: simulations.map((s) => ({
      date: iso(s.date),
      score: s.score,
      duration: s.duration,
      scoreByDeck: s.scoreByDeck,
      answers: (s.answers || []).map(({ cardId, correct, blank }) => ({ cardId, correct, blank })),
    })),
  }
}

export async function perguntarAoAssistente({ pergunta, dados, historico }) {
  const token = await auth.currentUser?.getIdToken()
  let res
  try {
    res = await fetch(`${URL_ASSISTENTE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ pergunta, dados, historico }),
    })
  } catch {
    throw new Error('Não consegui falar com o servidor do assistente. Ele está rodando?')
  }
  const corpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(corpo.detail || `Erro ${res.status} no assistente`)
  return corpo // { resposta, fontes, ids_invalidos }
}
