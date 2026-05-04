import { useState, useEffect, useCallback } from 'react'
import { Flag, Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function VestibularExam({ config, onFinish }) {
  const { deckConfigs, timeLimit } = config

  const [questions] = useState(() => {
    const all = []
    deckConfigs.forEach(({ deck, cards }) => {
      cards.forEach((card) => all.push({ ...card, deckId: deck.id, deckName: deck.name, deckColor: deck.color }))
    })
    return all
  })

  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = useCallback(() => {
    const duration = timeLimit - timeLeft
    const results = questions.map((q, i) => {
      const ans = answers[i]
      const blank = ans === undefined
      const correct = !blank && ans === q.correctOption
      const wrong = !blank && !correct
      return { cardId: q.id, deckId: q.deckId, deckName: q.deckName, chosen: ans ?? null, correct, blank, wrong, question: q }
    })
    onFinish({ results, duration, deckConfigs })
  }, [questions, answers, timeLeft, timeLimit, onFinish, deckConfigs])

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, handleSubmit])

  const handleAnswer = (idx, option) => setAnswers(prev => ({ ...prev, [idx]: option }))

  const toggleFlag = (idx) => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return next
    })
  }

  const q = questions[current]
  const answered = Object.keys(answers).length
  const isLow = timeLeft < 300

  return (
    <div className="vest">
      {/* Header */}
      <div className="vest__head">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>
          {answered}/{questions.length} respondidas
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {deckConfigs.map(({ deck, cards }) => (
            <div key={deck.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-3)' }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, background: deck.color }} />
              {deck.name.split(' ')[0]}
            </div>
          ))}
        </div>

        <div className={`vest__timer${isLow ? ' is-low' : ''}`}>
          <Clock style={{ width: 16, height: 16 }} />
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Send style={{ width: 13, height: 13 }} /> Entregar
        </button>
      </div>

      <div className="vest__body">
        {/* Sidebar list */}
        <div className="vest__list">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`vest__qbtn${current === i ? ' is-cur' : answers[i] !== undefined ? ' is-done' : ''}`}
            >
              {flagged.has(i) && <Flag style={{ width: 10, height: 10, color: 'var(--warning)' }} />}
              {!flagged.has(i) && <div style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--border-strong)', flexShrink: 0 }} />}
              Q{i + 1}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="vest__main">
          {/* Question header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: 99, background: q.deckColor, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{q.deckName}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg-4)' }}>
              Questão {current + 1} de {questions.length}
            </span>
            <button
              onClick={() => toggleFlag(current)}
              style={{
                padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-strong)',
                background: flagged.has(current) ? 'var(--warning-soft)' : 'transparent',
                color: flagged.has(current) ? 'var(--warning)' : 'var(--fg-3)',
                borderColor: flagged.has(current) ? 'rgba(245,158,11,0.4)' : 'var(--border-strong)',
                fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Flag style={{ width: 12, height: 12 }} />
              {flagged.has(current) ? 'Marcada' : 'Marcar'}
            </button>
          </div>

          {/* Question card */}
          <div className="vest__card">
            <p className="vest__qtext">{q.front}</p>
            <div className="vest__opts">
              {(q.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(current, i)}
                  className={`vest__opt${answers[current] === i ? ' is-sel' : ''}`}
                >
                  <span className="vest__letter">{LETTER[i]}</span>
                  {opt}
                </button>
              ))}
            </div>
            {answers[current] !== undefined && (
              <button
                onClick={() => setAnswers(prev => { const next = { ...prev }; delete next[current]; return next })}
                style={{ marginTop: 12, fontSize: 11, color: 'var(--fg-4)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Deixar em branco
              </button>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid var(--border-strong)',
                background: 'transparent', color: 'var(--fg-3)',
                fontSize: 13, cursor: current === 0 ? 'not-allowed' : 'pointer',
                opacity: current === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft style={{ width: 15, height: 15 }} /> Anterior
            </button>
            <button
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid var(--border-strong)',
                background: 'transparent', color: 'var(--fg-3)',
                fontSize: 13, cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer',
                opacity: current === questions.length - 1 ? 0.4 : 1,
              }}
            >
              Próxima <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 20, padding: 24, maxWidth: 360, width: '100%',
            boxShadow: 'var(--shadow-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <AlertTriangle style={{ width: 22, height: 22, color: 'var(--warning)' }} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--fg-1)' }}>Entregar simulado?</h3>
            </div>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.5 }}>
              Você respondeu <strong style={{ color: 'var(--fg-1)' }}>{answered}</strong> de{' '}
              <strong style={{ color: 'var(--fg-1)' }}>{questions.length}</strong> questões.
              As questões em branco valem 0 pontos.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 12,
                  border: '1px solid var(--border-strong)',
                  background: 'transparent', color: 'var(--fg-2)',
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
