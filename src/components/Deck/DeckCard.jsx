import { useState, useEffect } from 'react'
import { BookOpen, MoreVertical, Play, Edit2, Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export default function DeckCard({ deck, onStudy, onEdit, onDelete, getCards, refreshKey }) {
  const [cardCount, setCardCount] = useState(0)
  const [queueStats, setQueueStats] = useState({ urgent: 0, soon: 0, consolidated: 0 })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    getCards(deck.id).then((cards) => {
      setCardCount(cards.length)
      const stats = { urgent: 0, soon: 0, consolidated: 0 }
      cards.forEach((c) => {
        if (stats[c.queue] !== undefined) stats[c.queue]++
      })
      setQueueStats(stats)
    })
  }, [deck.id, getCards, refreshKey])

  return (
    <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: deck.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: deck.color + '22' }}
            >
              <BookOpen className="w-5 h-5" style={{ color: deck.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-white leading-tight">
                {deck.name}
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{deck.category}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-1 w-36">
                <button
                  onClick={() => { onEdit(deck); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
<button
                  onClick={() => { onDelete(deck.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4 text-xs text-stone-500 dark:text-stone-400">
          <span>{cardCount} cards</span>
          {queueStats.urgent > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle className="w-3 h-3" /> {queueStats.urgent} urgentes
            </span>
          )}
          {queueStats.soon > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <Clock className="w-3 h-3" /> {queueStats.soon} em breve
            </span>
          )}
          {queueStats.consolidated > 0 && (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle className="w-3 h-3" /> {queueStats.consolidated}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {cardCount > 0 && (
          <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-4">
            {queueStats.urgent > 0 && (
              <div
                className="bg-red-400 rounded-full"
                style={{ width: `${(queueStats.urgent / cardCount) * 100}%` }}
              />
            )}
            {queueStats.soon > 0 && (
              <div
                className="bg-amber-400 rounded-full"
                style={{ width: `${(queueStats.soon / cardCount) * 100}%` }}
              />
            )}
            {queueStats.consolidated > 0 && (
              <div
                className="bg-emerald-400 rounded-full"
                style={{ width: `${(queueStats.consolidated / cardCount) * 100}%` }}
              />
            )}
          </div>
        )}

        <button
          onClick={() => onStudy(deck)}
          disabled={cardCount === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: deck.color }}
        >
          <Play className="w-4 h-4" /> Estudar
        </button>
      </div>
    </div>
  )
}
