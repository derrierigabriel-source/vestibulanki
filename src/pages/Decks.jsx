import { useState } from 'react'
import { Layers } from 'lucide-react'
import DeckList from '../components/Deck/DeckList'
import StudySession from '../components/Study/StudySession'

export default function Decks() {
  const [studyingDeck, setStudyingDeck] = useState(null)

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Baralhos</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">Gerencie e estude seus baralhos</p>
          </div>
        </div>
      </div>

      <DeckList onStudy={(deck) => setStudyingDeck(deck)} />

      {studyingDeck && (
        <StudySession deck={studyingDeck} onClose={() => setStudyingDeck(null)} />
      )}
    </>
  )
}
