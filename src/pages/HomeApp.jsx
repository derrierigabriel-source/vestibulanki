import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDecks } from '../services/deckService'
import { getCards } from '../services/cardService'
import { getSessions } from '../services/statsService'
import {
  Flame, BookOpen, Play, GraduationCap, BarChart2,
  Layers, AlertCircle, Clock, CheckCircle, ArrowRight, Zap,
} from 'lucide-react'

function greeting(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const first = name?.split(' ')[0] || ''
  return first ? `${part}, ${first}!` : `${part}!`
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function HomeApp() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [decks, setDecks] = useState([])
  const [deckStats, setDeckStats] = useState({}) // deckId -> { total, urgent, soon }
  const [streak, setStreak] = useState(0)
  const [todayCards, setTodayCards] = useState(0)
  const [lastSession, setLastSession] = useState(null)
  const DAILY_GOAL = 20

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [allDecks, sessions] = await Promise.all([
          getDecks(user.uid),
          getSessions(user.uid, 30),
        ])
        setDecks(allDecks)

        // Card stats per deck
        const stats = {}
        for (const deck of allDecks) {
          const cards = await getCards(user.uid, deck.id)
          const now = Date.now()
          const due = cards.filter(c => !c.nextReview || c.nextReview.toMillis() <= now)
          stats[deck.id] = {
            total: cards.length,
            urgent: due.filter(c => c.queue === 'urgent').length,
            soon: due.filter(c => c.queue === 'soon').length,
            due: due.length,
          }
        }
        setDeckStats(stats)

        // Streak
        let s = 0
        const d = new Date()
        for (let i = 0; i < 365; i++) {
          const ds = d.toDateString()
          const has = sessions.some(sess => {
            if (!sess.date) return false
            const sd = sess.date.toDate ? sess.date.toDate() : new Date(sess.date)
            return sd.toDateString() === ds
          })
          if (has) { s++; d.setDate(d.getDate() - 1) }
          else if (i === 0) { d.setDate(d.getDate() - 1) }
          else break
        }
        setStreak(s)

        // Today's cards
        const today = new Date().toDateString()
        const todaySess = sessions.filter(sess => {
          if (!sess.date) return false
          const sd = sess.date.toDate ? sess.date.toDate() : new Date(sess.date)
          return sd.toDateString() === today
        })
        setTodayCards(todaySess.reduce((sum, s) => sum + (s.cards?.length || 0), 0))
        setLastSession(sessions[0] || null)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [user.uid])

  const totalDue = Object.values(deckStats).reduce((s, d) => s + d.due, 0)
  const goalPct = Math.min(100, Math.round((todayCards / DAILY_GOAL) * 100))
  const decksSorted = [...decks].sort((a, b) => {
    const da = deckStats[a.id]?.due || 0
    const db2 = deckStats[b.id]?.due || 0
    return db2 - da
  })

  const displayName = user?.displayName || user?.email || ''

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            height: i === 0 ? 100 : 72,
            background: 'var(--surface)', borderRadius: 16,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Greeting + streak */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '20px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--fg-1)', fontFamily: 'Instrument Serif, serif', letterSpacing: '-0.02em' }}>
            {greeting(displayName)}
          </p>
          {totalDue > 0 ? (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--fg-3)' }}>
              Você tem <strong style={{ color: 'var(--accent)' }}>{totalDue} cards</strong> para revisar hoje.
            </p>
          ) : (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--success)' }}>
              Tudo em dia — nenhum card pendente agora!
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 12,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
            }}>
              <Flame style={{ width: 18, height: 18, color: '#F59E0B' }} />
              <span style={{ fontWeight: 700, fontSize: 18, color: '#F59E0B', fontVariantNumeric: 'tabular-nums' }}>
                {streak}
              </span>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>dias</span>
            </div>
          )}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
            padding: '8px 14px', borderRadius: 12,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            minWidth: 110,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Hoje</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-1)' }}>{todayCards}/{DAILY_GOAL}</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${goalPct}%`, borderRadius: 99,
                background: goalPct >= 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
                transition: 'width 600ms var(--ease-out)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Estudar', icon: <Play style={{ width: 20, height: 20 }} />, to: '/study', color: 'var(--accent)', soft: 'var(--accent-soft)' },
          { label: 'Baralhos', icon: <Layers style={{ width: 20, height: 20 }} />, to: '/decks', color: 'var(--info)', soft: 'rgba(59,130,246,0.12)' },
          { label: 'Vestibular', icon: <GraduationCap style={{ width: 20, height: 20 }} />, to: '/vestibular', color: 'var(--success)', soft: 'var(--success-soft)' },
        ].map(({ label, icon, to, color, soft }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '18px 12px', borderRadius: 16,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--fg-1)', textDecoration: 'none', fontWeight: 600, fontSize: 13,
              transition: 'background 150ms, border-color 150ms, transform 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = soft
              e.currentTarget.style.borderColor = color
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: soft, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {icon}
            </div>
            {label}
          </Link>
        ))}
      </div>

      {/* Decks para revisar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-2)' }}>Seus baralhos</h2>
          <Link to="/decks" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Ver todos <ArrowRight style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {decksSorted.length === 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '24px', textAlign: 'center',
            }}>
              <Layers style={{ width: 32, height: 32, color: 'var(--fg-4)', margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)' }}>Nenhum baralho ainda.</p>
              <Link to="/decks" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                Criar primeiro baralho →
              </Link>
            </div>
          )}
          {decksSorted.map(deck => {
            const s = deckStats[deck.id] || { total: 0, urgent: 0, soon: 0, due: 0 }
            return (
              <div
                key={deck.id}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Color dot */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: deck.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen style={{ width: 16, height: 16, color: deck.color }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {deck.name}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--fg-4)' }}>{s.total} cards</span>
                    {s.urgent > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--danger)' }}>
                        <AlertCircle style={{ width: 10, height: 10 }} /> {s.urgent} urgentes
                      </span>
                    )}
                    {s.soon > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--warning)' }}>
                        <Clock style={{ width: 10, height: 10 }} /> {s.soon} em breve
                      </span>
                    )}
                    {s.due === 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--success)' }}>
                        <CheckCircle style={{ width: 10, height: 10 }} /> Em dia
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress pill */}
                {s.total > 0 && (
                  <div style={{ flexShrink: 0, width: 48, height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: s.urgent > 0 ? 'var(--danger)' : s.soon > 0 ? 'var(--warning)' : 'var(--success)',
                      width: `${Math.min(100, (s.due / s.total) * 100)}%`,
                    }} />
                  </div>
                )}

                {/* Study button */}
                <Link
                  to="/study"
                  state={{ deckId: deck.id }}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 9,
                    background: s.due > 0 ? deck.color : 'var(--surface-2)',
                    color: s.due > 0 ? '#fff' : 'var(--fg-3)',
                    fontWeight: 600, fontSize: 12, textDecoration: 'none',
                    border: `1px solid ${s.due > 0 ? deck.color : 'var(--border)'}`,
                    opacity: s.total === 0 ? 0.4 : 1,
                    pointerEvents: s.total === 0 ? 'none' : 'auto',
                  }}
                >
                  <Play style={{ width: 11, height: 11 }} />
                  {s.due > 0 ? `${s.due}` : '—'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Last session */}
      {lastSession && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-2)' }}>Última sessão</h2>
            <Link to="/stats" style={{ fontSize: 12, color: 'var(--fg-4)', textDecoration: 'none' }}>
              Ver histórico →
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Cards', value: lastSession.cards?.length || 0 },
              { label: 'ICE', value: `${lastSession.ice || 0}%`, color: (lastSession.ice || 0) >= 80 ? 'var(--success)' : (lastSession.ice || 0) >= 60 ? 'var(--accent-2)' : 'var(--warning)' },
              { label: 'Pontos', value: `${lastSession.totalPoints || 0}` },
              { label: 'Data', value: formatDate(lastSession.date) },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: color || 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'var(--accent-soft)', border: '1px solid var(--accent-ring)',
        borderRadius: 14, padding: '14px 16px',
      }}>
        <Zap style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--fg-1)' }}>Dica:</strong> Estudar{' '}
          <strong style={{ color: 'var(--fg-1)' }}>todos os dias</strong>, mesmo que poucos cards,
          é mais eficaz do que sessões longas e irregulares.
        </p>
      </div>

    </div>
  )
}
