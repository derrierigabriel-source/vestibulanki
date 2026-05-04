import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDecks, createDeck, updateDeck, deleteDeck } from '../services/deckService'
import { getCards, createCard, updateCard, deleteCard } from '../services/cardService'

export function useDecks() {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDecks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const data = await getDecks(user.uid)
    setDecks(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchDecks()
  }, [fetchDecks])

  const addDeck = async (data) => {
    const ref = await createDeck(user.uid, data)
    await fetchDecks()
    return ref.id
  }

  const editDeck = async (deckId, data) => {
    await updateDeck(user.uid, deckId, data)
    await fetchDecks()
  }

  const removeDeck = async (deckId) => {
    await deleteDeck(user.uid, deckId)
    await fetchDecks()
  }

  const getDeckCards = useCallback(
    (deckId) => getCards(user.uid, deckId),
    [user]
  )

  const addCard = async (deckId, data) => {
    await createCard(user.uid, deckId, data)
  }

  const editCard = async (deckId, cardId, data) => {
    await updateCard(user.uid, deckId, cardId, data)
  }

  const removeCard = async (deckId, cardId) => {
    await deleteCard(user.uid, deckId, cardId)
  }

  return {
    decks,
    loading,
    addDeck,
    editDeck,
    removeDeck,
    getDeckCards,
    addCard,
    editCard,
    removeCard,
    refetch: fetchDecks,
  }
}
