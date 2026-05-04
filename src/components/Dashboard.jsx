import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDecks } from '../services/deckService'
import { getCards } from '../services/cardService'
import { getSessions } from '../services/statsService'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Flame, Target, BookOpen, AlertCircle, TrendingUp, Calendar } from 'lucide-react'

const QUEUE_COLORS = {
  urgent: '#EF4444',
  soon: '#F59E0B',
  consolidated: '#10B981',
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    streak: 0,
    todayCards: 0,
    dailyGoal: 20,
    weekData: [],
    queueDist: [],
    worstCards: [],
    totalDecks: 0,
    totalCards: 0,
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [decks, sessions] = await Promise.all([
          getDecks(user.uid),
          getSessions(user.uid, 30),
        ])

        // Fetch all cards
        let allCards = []
        for (const deck of decks) {
          const cards = await getCards(user.uid, deck.id)
          allCards = allCards.concat(cards.map((c) => ({ ...c, deckId: deck.id, deckName: deck.name })))
        }

        // Queue distribution
        const queueCount = { urgent: 0, soon: 0, consolidated: 0 }
        allCards.forEach((c) => {
          if (queueCount[c.queue] !== undefined) queueCount[c.queue]++
        })
        const queueDist = Object.entries(queueCount).map(([name, value]) => ({
          name: name === 'urgent' ? 'Urgente' : name === 'soon' ? 'Em breve' : 'Consolidado',
          value,
          color: QUEUE_COLORS[name],
        }))

        // Worst cards (lowest iceScore)
        const worstCards = [...allCards]
          .filter((c) => c.history?.length > 0)
          .sort((a, b) => (a.iceScore ?? 50) - (b.iceScore ?? 50))
          .slice(0, 5)

        // Week data (last 7 days)
        const today = new Date()
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today)
          d.setDate(d.getDate() - (6 - i))
          const label = DAYS[d.getDay()]
          const dateStr = d.toDateString()
          const daySessions = sessions.filter((s) => {
            if (!s.date) return false
            const sd = s.date.toDate ? s.date.toDate() : new Date(s.date)
            return sd.toDateString() === dateStr
          })
          const cards = daySessions.reduce((sum, s) => sum + (s.cards?.length || 0), 0)
          const ice = daySessions.length
            ? Math.round(daySessions.reduce((s, sess) => s + (sess.ice || 0), 0) / daySessions.length)
            : 0
          return { label, cards, ice }
        })

        // Today's cards
        const todaySessions = sessions.filter((s) => {
          if (!s.date) return false
          const sd = s.date.toDate ? s.date.toDate() : new Date(s.date)
          return sd.toDateString() === today.toDateString()
        })
        const todayCards = todaySessions.reduce((sum, s) => sum + (s.cards?.length || 0), 0)

        // Streak (simplified: count consecutive days with sessions)
        let streak = 0
        const d = new Date()
        for (let i = 0; i < 365; i++) {
          const dateStr = d.toDateString()
          const hasSess = sessions.some((s) => {
            if (!s.date) return false
            const sd = s.date.toDate ? s.date.toDate() : new Date(s.date)
            return sd.toDateString() === dateStr
          })
          if (hasSess) {
            streak++
            d.setDate(d.getDate() - 1)
          } else if (i === 0) {
            d.setDate(d.getDate() - 1)
          } else {
            break
          }
        }

        setStats({
          streak,
          todayCards,
          dailyGoal: 20,
          weekData,
          queueDist,
          worstCards,
          totalDecks: decks.length,
          totalCards: allCards.length,
        })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [user.uid])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const goalPct = Math.min(100, Math.round((stats.todayCards / stats.dailyGoal) * 100))

  return (
    <div className="space-y-4">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-stone-500 dark:text-stone-400">Streak</span>
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-white">{stats.streak}</div>
          <p className="text-xs text-stone-400 mt-0.5">dias consecutivos</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-teal-500" />
            <span className="text-xs text-stone-500 dark:text-stone-400">Hoje</span>
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-white">{stats.todayCards}</div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Meta: {stats.dailyGoal}</span>
              <span>{goalPct}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-stone-500 dark:text-stone-400">Baralhos</span>
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-white">{stats.totalDecks}</div>
          <p className="text-xs text-stone-400 mt-0.5">{stats.totalCards} cards no total</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-stone-500 dark:text-stone-400">Urgentes</span>
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-white">
            {stats.queueDist.find((q) => q.name === 'Urgente')?.value || 0}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">para revisar agora</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Últimos 7 dias
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.weekData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#D6D3D1' }}
              />
              <Bar dataKey="cards" fill="#0D9488" radius={[4, 4, 0, 0]} name="Cards" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Filas</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.queueDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
              >
                {stats.queueDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Worst cards */}
      {stats.worstCards.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
            Top 5 cards mais problemáticos
          </h3>
          <div className="space-y-2">
            {stats.worstCards.map((card, i) => (
              <div key={card.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 dark:text-stone-300 truncate">{card.front}</p>
                  <p className="text-xs text-stone-400">{card.deckName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="h-1.5 w-16 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${card.iceScore ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-red-500 w-8">{card.iceScore ?? 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
