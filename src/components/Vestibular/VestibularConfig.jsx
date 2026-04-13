import { useState, useEffect } from 'react'
import { GraduationCap, Clock, Hash, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDecks } from '../../services/deckService'
import { getCards } from '../../services/cardService'

export default function VestibularConfig({ onStart }) {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [selected, setSelected] = useState({}) // deckId -> count
  const [timeLimit, setTimeLimit] = useState(300) // minutes
  const [loading, setLoading] = useState(true)
  const [deckInfo, setDeckInfo] = useState({}) // deckId -> { multipleCount }

  useEffect(() => {
    const load = async () => {
      const data = await getDecks(user.uid)
      setDecks(data)
      // Count multiple choice cards per deck
      const info = {}
      for (const d of data) {
        const cards = await getCards(user.uid, d.id)
        info[d.id] = { multipleCount: cards.filter((c) => c.type === 'multiple').length, cards }
      }
      setDeckInfo(info)
      setLoading(false)
    }
    load()
  }, [user.uid])

  const toggle = (deckId) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[deckId] !== undefined) {
        delete next[deckId]
      } else {
        const max = deckInfo[deckId]?.multipleCount || 0
        next[deckId] = Math.min(10, max)
      }
      return next
    })
  }

  const setCount = (deckId, val) => {
    const max = deckInfo[deckId]?.multipleCount || 0
    setSelected((prev) => ({ ...prev, [deckId]: Math.max(1, Math.min(max, Number(val))) }))
  }

  const totalQuestions = Object.values(selected).reduce((s, v) => s + v, 0)

  const handleStart = () => {
    if (totalQuestions === 0) return
    const deckConfigs = Object.entries(selected).map(([deckId, count]) => ({
      deck: decks.find((d) => d.id === deckId),
      count,
      cards: (deckInfo[deckId]?.cards || [])
        .filter((c) => c.type === 'multiple')
        .sort(() => Math.random() - 0.5)
        .slice(0, count),
    }))
    onStart({ deckConfigs, timeLimit: timeLimit * 60 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Modo Vestibular</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Configure seu simulado</p>
        </div>
      </div>

      {/* Time limit */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Tempo total</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[60, 120, 180, 240, 300].map((t) => (
            <button
              key={t}
              onClick={() => setTimeLimit(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeLimit === t
                  ? 'bg-teal-600 text-white'
                  : 'border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-teal-400'
              }`}
            >
              {t / 60}h
            </button>
          ))}
        </div>
      </div>

      {/* Decks */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Matérias e questões
          </span>
        </div>
        <div className="space-y-3">
          {decks.map((deck) => {
            const max = deckInfo[deck.id]?.multipleCount || 0
            const isSelected = selected[deck.id] !== undefined
            return (
              <div
                key={deck.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
                onClick={() => max > 0 && toggle(deck.id)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: deck.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                    {deck.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {max} questões disponíveis
                  </p>
                </div>
                {isSelected && max > 0 && (
                  <input
                    type="number"
                    value={selected[deck.id]}
                    onChange={(e) => setCount(deck.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    min={1}
                    max={max}
                    className="w-14 px-2 py-1 text-sm text-center border border-teal-300 dark:border-teal-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                )}
                {max === 0 && (
                  <span className="text-xs text-stone-400">Sem MC</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary + Start */}
      <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Total</p>
          <p className="text-xl font-bold text-stone-900 dark:text-white">
            {totalQuestions} questões · {timeLimit / 60}h
          </p>
        </div>
        <div className="text-right text-xs text-stone-400">
          <p>Acerto: +1,00</p>
          <p>Erro: −0,25</p>
          <p>Branco: 0,00</p>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={totalQuestions === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Iniciar simulado <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
