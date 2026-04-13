import { useState } from 'react'
import { Plus, Search, Layers } from 'lucide-react'
import DeckCard from './DeckCard'
import DeckForm from './DeckForm'
import { useDecks } from '../../hooks/useDecks'

export default function DeckList({ onStudy }) {
  const { decks, loading, addDeck, editDeck, removeDeck, getDeckCards, addCard, editCard, removeCard } = useDecks()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDeck, setEditingDeck] = useState(null)
  const [editingCards, setEditingCards] = useState([])

  const filtered = decks.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (deckData, cards) => {
    const deckRef = await addDeck(deckData)
    // addDeck returns void after refetch, need to get new deck id
    // We'll handle card creation through a different flow
    setShowForm(false)
  }

  const handleEdit = async (deck) => {
    const cards = await getDeckCards(deck.id)
    setEditingCards(cards)
    setEditingDeck(deck)
  }

  const handleEditSubmit = async (deckData, cards) => {
    await editDeck(editingDeck.id, deckData)

    // Delete removed cards and update/add new ones
    const existingIds = new Set(editingCards.map((c) => c.id))
    const submittedIds = new Set(cards.filter((c) => c.id).map((c) => c.id))

    // Remove deleted cards
    for (const card of editingCards) {
      if (!submittedIds.has(card.id)) {
        await removeCard(editingDeck.id, card.id)
      }
    }

    // Update or add cards
    for (const card of cards) {
      const { _key, id, ...cardData } = card
      if (id && existingIds.has(id)) {
        await editCard(editingDeck.id, id, cardData)
      } else {
        await addCard(editingDeck.id, cardData)
      }
    }

    setEditingDeck(null)
    setEditingCards([])
  }

  const handleDelete = async (deckId) => {
    if (confirm('Excluir este baralho? Esta ação não pode ser desfeita.')) {
      await removeDeck(deckId)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar baralhos..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Novo baralho
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            {search ? 'Nenhum baralho encontrado' : 'Nenhum baralho ainda'}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              Criar primeiro baralho →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={onStudy}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getCards={getDeckCards}
            />
          ))}
        </div>
      )}

      {showForm && (
        <DeckForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingDeck && (
        <DeckForm
          deck={editingDeck}
          existingCards={editingCards}
          onSubmit={handleEditSubmit}
          onClose={() => { setEditingDeck(null); setEditingCards([]) }}
        />
      )}
    </>
  )
}
