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
      cards.forEach((c) => { if (stats[c.queue] !== undefined) stats[c.queue]++ })
      setQueueStats(stats)
    })
  }, [deck.id, getCards, refreshKey])

  return (
    <div className="deck" style={{ '--deck-c': deck.color }}>
      <div className="deck__stripe" />

      <div style={{ paddingTop: 4 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: deck.color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BookOpen style={{ width: 18, height: 18, color: deck.color }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', margin: 0, lineHeight: 1.3 }}>
                {deck.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--fg-4)', margin: '2px 0 0' }}>{deck.category}</p>
            </div>
          </div>

          {/* Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                padding: '4px 6px', borderRadius: 8, border: 'none',
                background: 'transparent', color: 'var(--fg-3)', cursor: 'pointer',
              }}
            >
              <MoreVertical style={{ width: 15, height: 15 }} />
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 32, zIndex: 10,
                background: 'var(--surface)', border: '1px solid var(--border-strong)',
                borderRadius: 12, boxShadow: 'var(--shadow-2)',
                padding: 4, minWidth: 140,
              }}>
                <button
                  onClick={() => { onEdit(deck); setMenuOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', border: 'none', borderRadius: 8,
                    background: 'transparent', color: 'var(--fg-2)', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <Edit2 style={{ width: 13, height: 13 }} /> Editar
                </button>
                <button
                  onClick={() => { onDelete(deck.id); setMenuOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', border: 'none', borderRadius: 8,
                    background: 'transparent', color: 'var(--danger)', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Queue stats */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, fontSize: 11, color: 'var(--fg-3)' }}>
          <span>{cardCount} cards</span>
          {queueStats.urgent > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
              <AlertCircle style={{ width: 11, height: 11 }} /> {queueStats.urgent} urgentes
            </span>
          )}
          {queueStats.soon > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)' }}>
              <Clock style={{ width: 11, height: 11 }} /> {queueStats.soon} em breve
            </span>
          )}
          {queueStats.consolidated > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
              <CheckCircle style={{ width: 11, height: 11 }} /> {queueStats.consolidated}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {cardCount > 0 && (
          <div style={{
            display: 'flex', gap: 2, height: 4, borderRadius: 99,
            overflow: 'hidden', background: 'var(--border-subtle)', marginBottom: 14,
          }}>
            {queueStats.urgent > 0 && (
              <div style={{ background: 'var(--danger)', height: '100%', width: `${(queueStats.urgent / cardCount) * 100}%` }} />
            )}
            {queueStats.soon > 0 && (
              <div style={{ background: 'var(--warning)', height: '100%', width: `${(queueStats.soon / cardCount) * 100}%` }} />
            )}
            {queueStats.consolidated > 0 && (
              <div style={{ background: 'var(--success)', height: '100%', width: `${(queueStats.consolidated / cardCount) * 100}%` }} />
            )}
          </div>
        )}

        {/* Study button */}
        <StudyButton deck={deck} cardCount={cardCount} onStudy={onStudy} />
      </div>
    </div>
  )
}

function StudyButton({ deck, cardCount, onStudy }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => onStudy(deck)}
      disabled={cardCount === 0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 10,
        background: hovered && cardCount > 0 ? deck.color : 'var(--surface-2)',
        color: hovered && cardCount > 0 ? '#fff' : 'var(--fg-1)',
        border: `1px solid ${hovered && cardCount > 0 ? deck.color : 'var(--border-strong)'}`,
        fontWeight: 600, fontSize: 13,
        cursor: cardCount === 0 ? 'not-allowed' : 'pointer',
        opacity: cardCount === 0 ? 0.4 : 1,
        transition: 'background 120ms, border-color 120ms, color 120ms',
      }}
    >
      <Play style={{ width: 14, height: 14 }} /> Estudar
    </button>
  )
}
