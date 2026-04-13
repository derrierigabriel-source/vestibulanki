import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { saveSimulation } from '../services/statsService'
import VestibularConfig from '../components/Vestibular/VestibularConfig'
import VestibularExam from '../components/Vestibular/VestibularExam'
import VestibularResult from '../components/Vestibular/VestibularResult'
import { GraduationCap } from 'lucide-react'

export default function Vestibular() {
  const { user } = useAuth()
  const [phase, setPhase] = useState('config') // 'config' | 'exam' | 'result'
  const [examConfig, setExamConfig] = useState(null)
  const [examData, setExamData] = useState(null)

  const handleStart = (config) => {
    setExamConfig(config)
    setPhase('exam')
  }

  const handleFinish = async (data) => {
    setExamData(data)
    setPhase('result')

    // Save simulation
    const scoreByDeck = {}
    data.deckConfigs.forEach(({ deck }) => {
      const dr = data.results.filter((r) => r.deckId === deck.id)
      const score = Math.max(0, dr.reduce((s, r) => s + (r.correct ? 1 : r.wrong ? -0.25 : 0), 0))
      scoreByDeck[deck.id] = { deckName: deck.name, score }
    })

    await saveSimulation(user.uid, {
      config: {
        deckIds: data.deckConfigs.map(({ deck }) => deck.id),
        timeLimit: examConfig.timeLimit,
      },
      answers: data.results.map((r) => ({
        cardId: r.cardId,
        chosen: r.chosen,
        correct: r.correct,
        blank: r.blank,
      })),
      score: Math.max(0, data.results.reduce((s, r) => s + (r.correct ? 1 : r.wrong ? -0.25 : 0), 0)),
      scoreByDeck,
      duration: data.duration,
    })
  }

  return (
    <>
      {phase !== 'exam' && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Modo Vestibular</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Simulado no estilo UFPR com pontuação oficial
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === 'config' && <VestibularConfig onStart={handleStart} />}

      {phase === 'exam' && examConfig && (
        <VestibularExam config={examConfig} onFinish={handleFinish} />
      )}

      {phase === 'result' && examData && (
        <VestibularResult
          examData={examData}
          onRetry={() => setPhase('config')}
          onHome={() => setPhase('config')}
        />
      )}
    </>
  )
}
