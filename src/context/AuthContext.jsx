import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../services/firebase'
import { seedUserData } from '../services/seedService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            streak: 0,
            lastStudyDate: null,
            dailyGoal: 20,
            createdAt: serverTimestamp(),
          })
          await seedUserData(firebaseUser.uid)
        } else {
          // Roda o seed se o usuário não tiver nenhum baralho
          const decksSnap = await getDocs(collection(db, 'users', firebaseUser.uid, 'decks'))
          if (decksSnap.empty) {
            await seedUserData(firebaseUser.uid)
          }
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signUpWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
