import { useState, useEffect } from 'react'
import { BookOpen, Play, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDecks } from '../services/deckService'
import { getDueCards } from '../services/cardService'
import StudySession from '../components/Study/StudySession'

export default function Study() {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [dueCounts, setDueCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [studyingDeck, setStudyingDeck] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getDecks(user.uid)
      setDecks(data)
      const counts = {}
      for (const d of data) {
        const due = await getDueCards(user.uid, [d.id])
        counts[d.id] = due.length
      }
      setDueCounts(counts)
      setLoading(false)
    }
    load()
  }, [user.uid])

  const totalDue = Object.values(dueCounts).reduce((s, v) => s + v, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Estudar</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {totalDue > 0 ? `${totalDue} cards para revisar` : 'Tudo em dia!'}
            </p>
          </div>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum baralho encontrado. Crie um primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const due = dueCounts[deck.id] || 0
            return (
              <div
                key={deck.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="h-1.5" style={{ backgroundColor: deck.color }} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: deck.color + '22' }}
                    >
                      <BookOpen className="w-4 h-4" style={{ color: deck.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-white text-sm">{deck.name}</h3>
                      <p className="text-xs text-stone-400">{deck.category}</p>
                    </div>
                  </div>

                  {due > 0 ? (
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {due} cards para revisar
                    </div>
                  ) : (
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg">
                      ✓ Tudo em dia
                    </div>
                  )}

                  <button
                    onClick={() => setStudyingDeck(deck)}
                    disabled={due === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: deck.color }}
                  >
                    <Play className="w-3.5 h-3.5" /> Estudar agora
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {studyingDeck && (
        <StudySession
          deck={studyingDeck}
          onClose={() => {
            setStudyingDeck(null)
            // Reload due counts
            const reload = async () => {
              const counts = {}
              for (const d of decks) {
                const due = await getDueCards(user.uid, [d.id])
                counts[d.id] = due.length
              }
              setDueCounts(counts)
            }
            reload()
          }}
        />
      )}
    </>
  )
}
