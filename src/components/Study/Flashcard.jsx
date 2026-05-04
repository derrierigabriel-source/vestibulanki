import { useState } from 'react'
import { CheckCircle, XCircle, Frown, Meh, Smile } from 'lucide-react'

const LETTER = ['A', 'B', 'C', 'D']

export default function Flashcard({ card, onAnswer, index, total }) {
  const [flipped, setFlipped] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPerceived, setShowPerceived] = useState(false)
  const [result, setResult] = useState(null)

  const handleFlip = () => setFlipped(true)

  const handleMultipleSelect = (idx) => {
    if (flipped) return
    setSelectedOption(idx)
    const correct = idx === card.correctOption ? 'correct' : 'wrong'
    setResult(correct)
    setFlipped(true)
    setTimeout(() => setShowPerceived(true), 400)
  }

  const handleOpenResult = (res) => {
    setResult(res)
    setShowPerceived(true)
  }

  const handlePerceived = (perceived) => {
    onAnswer(result, perceived)
    setFlipped(false)
    setSelectedOption(null)
    setShowPerceived(false)
    setResult(null)
  }

  const diffLabel = card.difficulty === 'easy' ? 'Fácil' : card.difficulty === 'medium' ? 'Médio' : 'Difícil'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 580, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ width: '100%', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Card {index + 1} de {total}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
            background: 'var(--surface-2)', color: 'var(--fg-2)',
          }}>{diffLabel}</span>
        </div>
        <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
            borderRadius: 99, width: `${((index + 1) / total) * 100}%`,
            transition: 'width 500ms var(--ease-out)',
          }} />
        </div>
      </div>

      {/* Flip card */}
      <div className="flip-scene" style={{ marginBottom: 16 }}>
        <div className={`flip-inner${flipped ? ' is-flipped' : ''}`} style={{ minHeight: 240 }}>
          {/* Front */}
          <div className="flip-face" style={{ minHeight: 240 }}>
            <p className="flip-q">{card.front}</p>

            {card.type === 'multiple' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {(card.options || []).map((opt, i) => {
                  let bg = 'var(--surface-2)', border = 'var(--border-strong)', color = 'var(--fg-2)'
                  if (selectedOption === i) {
                    if (i === card.correctOption) { bg = 'var(--success-soft)'; border = 'var(--success)'; color = 'var(--fg-1)' }
                    else { bg = 'var(--danger-soft)'; border = 'var(--danger)'; color = 'var(--fg-1)' }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleMultipleSelect(i)}
                      disabled={flipped}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px', borderRadius: 12,
                        background: bg, border: `1px solid ${border}`, color,
                        textAlign: 'left', fontSize: 14, fontWeight: 500,
                        cursor: flipped ? 'default' : 'pointer',
                        transition: 'background 100ms, border-color 100ms',
                      }}
                    >
                      <span style={{ color: 'var(--fg-3)', fontWeight: 700, width: 22, flexShrink: 0 }}>{LETTER[i]}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            ) : (
              <button
                onClick={handleFlip}
                className="btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                Ver resposta
              </button>
            )}
          </div>

          {/* Back */}
          <div className="flip-face flip-face--back" style={{ minHeight: 240 }}>
            <div style={{ flex: 1 }}>
              {card.type === 'multiple' && (
                <div style={{
                  marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: result === 'correct' ? 'var(--success-soft)' : 'var(--danger-soft)',
                  color: result === 'correct' ? 'var(--success)' : 'var(--danger)',
                }}>
                  {result === 'correct'
                    ? <><CheckCircle style={{ width: 15, height: 15 }} /> Correto!</>
                    : <><XCircle style={{ width: 15, height: 15 }} /> Incorreto — Resposta: {LETTER[card.correctOption]}</>
                  }
                </div>
              )}
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.55,
                color: 'var(--fg-1)', margin: 0,
              }}>
                {card.back}
              </p>
            </div>

            {card.type === 'open' && !showPerceived && (
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => handleOpenResult('wrong')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 12,
                    border: '1px solid var(--danger)', color: 'var(--danger)',
                    background: 'transparent', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  <XCircle style={{ width: 15, height: 15 }} /> Errei
                </button>
                <button
                  onClick={() => handleOpenResult('correct')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 12,
                    border: '1px solid var(--success)', color: 'var(--success)',
                    background: 'transparent', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  <CheckCircle style={{ width: 15, height: 15 }} /> Acertei
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Perceived difficulty */}
      {showPerceived && (
        <div className="rate-box" style={{ width: '100%' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-3)', margin: '0 0 12px', fontWeight: 500 }}>
            Como foi para você?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { key: 'hard', icon: <Frown style={{ width: 20, height: 20 }} />, label: 'Muito difícil', color: 'var(--danger)' },
              { key: 'medium', icon: <Meh style={{ width: 20, height: 20 }} />, label: 'Médio', color: 'var(--warning)' },
              { key: 'easy', icon: <Smile style={{ width: 20, height: 20 }} />, label: 'Fácil', color: 'var(--success)' },
            ].map(({ key, icon, label, color }) => (
              <button
                key={key}
                onClick={() => handlePerceived(key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 6px', borderRadius: 12,
                  background: 'var(--surface)', border: `1px solid var(--border-strong)`,
                  color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 120ms, border-color 120ms',
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
