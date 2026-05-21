import { useState } from 'react'
import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp, CheckCircle, XCircle, Minus } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']
const UFPR_REFERENCE = 42

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function VestibularResult({ examData, onRetry, onHome }) {
  const { results, duration, deckConfigs } = examData
  const [expandedDeck, setExpandedDeck] = useState(null)

  const rawScore = results.reduce((sum, r) => {
    if (r.correct) return sum + 1
    if (r.wrong) return sum - 0.25
    return sum
  }, 0)
  const finalScore = Math.max(0, rawScore)
  const passed = finalScore >= UFPR_REFERENCE

  const deckScores = deckConfigs.map(({ deck }) => {
    const dr = results.filter((r) => r.deckId === deck.id)
    const correct = dr.filter((r) => r.correct).length
    const wrong = dr.filter((r) => r.wrong).length
    const blank = dr.filter((r) => r.blank).length
    const score = Math.max(0, correct - wrong * 0.25)
    return { deck, correct, wrong, blank, total: dr.length, score, results: dr }
  })

  const correctCount = results.filter((r) => r.correct).length
  const wrongCount = results.filter((r) => r.wrong).length
  const blankCount = results.filter((r) => r.blank).length

  const trophyBg = passed ? 'var(--success-soft)' : 'var(--warning-soft)'
  const trophyColor = passed ? 'var(--success)' : 'var(--warning)'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: '50%',
          background: trophyBg, marginBottom: 14,
        }}>
          <Trophy style={{ width: 34, height: 34, color: trophyColor }} />
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'var(--font-serif)' }}>
          Resultado do Simulado
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-4)' }}>Tempo: {formatDuration(duration)}</p>
      </div>

      {/* Score */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-xl)', padding: '24px 20px', marginBottom: 12, textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--fg-4)' }}>Pontuação total (UFPR)</p>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--fg-1)', lineHeight: 1, marginBottom: 10, fontFamily: 'var(--font-display)' }}>
          {finalScore.toFixed(2)}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
          background: passed ? 'var(--success-soft)' : 'var(--warning-soft)',
          color: passed ? 'var(--success)' : 'var(--warning)',
        }}>
          {passed ? '✓ Acima da nota de corte' : '↓ Abaixo da nota de corte'}
        </span>
        <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--fg-4)' }}>
          Referência UFPR 2024: {UFPR_REFERENCE} pontos (fictício)
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { icon: <CheckCircle style={{ width: 18, height: 18, color: 'var(--success)' }} />, val: correctCount, label: 'Acertos', bg: 'var(--success-soft)', color: 'var(--success)' },
          { icon: <XCircle style={{ width: 18, height: 18, color: 'var(--danger)' }} />, val: wrongCount, label: 'Erros', bg: 'var(--danger-soft)', color: 'var(--danger)' },
          { icon: <Minus style={{ width: 18, height: 18, color: 'var(--fg-4)' }} />, val: blankCount, label: 'Em branco', bg: 'var(--surface-2)', color: 'var(--fg-3)' },
        ].map(({ icon, val, label, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: 'var(--r-xl)', padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--fg-4)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* By deck */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>Por matéria</span>
        </div>
        {deckScores.map(({ deck, correct, total, score, results: dr }, idx) => (
          <div key={deck.id} style={{ borderBottom: idx < deckScores.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <button
              onClick={() => setExpandedDeck(expandedDeck === deck.id ? null : deck.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 99, background: deck.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>{deck.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>{score.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: 'var(--fg-4)', minWidth: 40, textAlign: 'right' }}>{correct}/{total}</span>
              {expandedDeck === deck.id
                ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--fg-4)', flexShrink: 0 }} />
                : <ChevronDown style={{ width: 14, height: 14, color: 'var(--fg-4)', flexShrink: 0 }} />}
            </button>

            {expandedDeck === deck.id && (
              <div style={{ padding: '0 20px 12px' }}>
                {dr.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 0',
                    borderTop: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ flexShrink: 0, marginTop: 1, color: r.correct ? 'var(--success)' : r.wrong ? 'var(--danger)' : 'var(--fg-4)' }}>
                      {r.correct
                        ? <CheckCircle style={{ width: 14, height: 14 }} />
                        : r.wrong ? <XCircle style={{ width: 14, height: 14 }} />
                        : <Minus style={{ width: 14, height: 14 }} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>{r.question.front}</p>
                      {r.wrong && (
                        <>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--success)' }}>
                            ✓ {LETTER[r.question.correctOption]}) {r.question.options?.[r.question.correctOption]}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--fg-4)', fontStyle: 'italic' }}>{r.question.back}</p>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, color: r.correct ? 'var(--success)' : r.wrong ? 'var(--danger)' : 'var(--fg-4)' }}>
                      {r.correct ? '+1,00' : r.wrong ? '−0,25' : '0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onHome}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border-strong)',
            background: 'transparent', color: 'var(--fg-2)',
            fontWeight: 500, fontSize: 14, cursor: 'pointer',
          }}
        >
          <Home style={{ width: 15, height: 15 }} /> Início
        </button>
        <button
          onClick={onRetry}
          className="btn-primary"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px' }}
        >
          <RotateCcw style={{ width: 15, height: 15 }} /> Novo simulado
        </button>
      </div>
    </div>
  )
}
