import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export const getDecks = async (userId) => {
  const q = query(
    collection(db, 'users', userId, 'decks'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const createDeck = async (userId, data) => {
  return addDoc(collection(db, 'users', userId, 'decks'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateDeck = async (userId, deckId, data) => {
  return updateDoc(doc(db, 'users', userId, 'decks', deckId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteDeck = async (userId, deckId) => {
  return deleteDoc(doc(db, 'users', userId, 'decks', deckId))
}
