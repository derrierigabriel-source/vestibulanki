import {
  collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export const saveSession = async (userId, sessionData) => {
  return addDoc(collection(db, 'users', userId, 'sessions'), {
    ...sessionData,
    date: serverTimestamp(),
  })
}

export const getSessions = async (userId, limitCount = 30) => {
  const q = query(
    collection(db, 'users', userId, 'sessions'),
    orderBy('date', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const saveSimulation = async (userId, simData) => {
  return addDoc(collection(db, 'users', userId, 'simulations'), {
    ...simData,
    date: serverTimestamp(),
  })
}

export const getSimulations = async (userId) => {
  const q = query(
    collection(db, 'users', userId, 'simulations'),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
