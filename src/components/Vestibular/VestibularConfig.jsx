import { useState, useEffect } from 'react'
import { GraduationCap, Clock, Hash, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDecks } from '../../services/deckService'
import { getCards } from '../../services/cardService'

export default function VestibularConfig({ onStart }) {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [selected, setSelected] = useState({})
  const [timeLimit, setTimeLimit] = useState(300)
  const [loading, setLoading] = useState(true)
  const [deckInfo, setDeckInfo] = useState({})

  useEffect(() => {
    const load = async () => {
      const data = await getDecks(user.uid)
      setDecks(data)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border-strong)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--r-xl)',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <GraduationCap style={{ width: 22, height: 22, color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg-1)' }}>Modo Vestibular</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>Configure seu simulado</p>
        </div>
      </div>

      {/* Time limit */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-xl)', padding: 16, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Clock style={{ width: 14, height: 14, color: 'var(--fg-4)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>Tempo total</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[60, 120, 180, 240, 300].map((t) => (
            <button
              key={t}
              onClick={() => setTimeLimit(t)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500,
                border: `1px solid ${timeLimit === t ? 'var(--accent)' : 'var(--border-strong)'}`,
                background: timeLimit === t ? 'var(--accent-soft)' : 'transparent',
                color: timeLimit === t ? 'var(--accent)' : 'var(--fg-3)',
                cursor: 'pointer', transition: 'all 120ms',
              }}
            >
              {t / 60}h
            </button>
          ))}
        </div>
      </div>

      {/* Decks */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-xl)', padding: 16, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Hash style={{ width: 14, height: 14, color: 'var(--fg-4)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>Matérias e questões</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {decks.map((deck) => {
            const max = deckInfo[deck.id]?.multipleCount || 0
            const isSel = selected[deck.id] !== undefined
            return (
              <div
                key={deck.id}
                onClick={() => max > 0 && toggle(deck.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 'var(--r-lg)',
                  border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border-strong)'}`,
                  background: isSel ? 'var(--accent-soft)' : 'transparent',
                  cursor: max > 0 ? 'pointer' : 'default',
                  opacity: max === 0 ? 0.45 : 1,
                  transition: 'border-color 120ms, background 120ms',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 99, background: deck.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {deck.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-4)' }}>{max} questões disponíveis</p>
                </div>
                {isSel && max > 0 ? (
                  <input
                    type="number"
                    value={selected[deck.id]}
                    onChange={(e) => setCount(deck.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    min={1} max={max}
                    style={{
                      width: 56, padding: '4px 8px', textAlign: 'center',
                      fontSize: 13, fontWeight: 600,
                      border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-2)', color: 'var(--fg-1)', outline: 'none',
                    }}
                  />
                ) : max === 0 ? (
                  <span style={{ fontSize: 11, color: 'var(--fg-4)' }}>Sem MC</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        background: 'var(--surface-2)', borderRadius: 'var(--r-xl)', padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-4)' }}>Total</p>
          <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--fg-1)' }}>
            {totalQuestions} questões · {timeLimit / 60}h
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, lineHeight: 1.8 }}>
          <p style={{ margin: 0, color: 'var(--success)' }}>Acerto: +1,00</p>
          <p style={{ margin: 0, color: 'var(--danger)' }}>Erro: −0,25</p>
          <p style={{ margin: 0, color: 'var(--fg-4)' }}>Branco: 0,00</p>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={totalQuestions === 0}
        className="btn-primary"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 24px',
          opacity: totalQuestions === 0 ? 0.4 : 1,
          cursor: totalQuestions === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        Iniciar simulado <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}
