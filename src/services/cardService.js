import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export const getCards = async (userId, deckId) => {
  const q = query(
    collection(db, 'users', userId, 'decks', deckId, 'cards'),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createCard = async (userId, deckId, data) => {
  return addDoc(collection(db, 'users', userId, 'decks', deckId, 'cards'), {
    ...data,
    queue: 'soon',
    nextReview: Timestamp.now(),
    history: [],
    iceScore: 50,
    correctRate: 0,
    createdAt: serverTimestamp(),
  })
}

export const updateCard = async (userId, deckId, cardId, data) => {
  return updateDoc(doc(db, 'users', userId, 'decks', deckId, 'cards', cardId), data)
}

export const deleteCard = async (userId, deckId, cardId) => {
  return deleteDoc(doc(db, 'users', userId, 'decks', deckId, 'cards', cardId))
}

export const getDueCards = async (userId, deckIds) => {
  const nowMs = Timestamp.now().toMillis()
  const allCards = []
  for (const deckId of deckIds) {
    const cards = await getCards(userId, deckId)
    const due = cards.filter(
      (c) => !c.nextReview || c.nextReview.toMillis() <= nowMs
    )
    allCards.push(...due.map((c) => ({ ...c, deckId })))
  }
  const priority = { urgent: 0, soon: 1, consolidated: 2 }
  return allCards.sort(
    (a, b) => (priority[a.queue] ?? 1) - (priority[b.queue] ?? 1)
  )
}
