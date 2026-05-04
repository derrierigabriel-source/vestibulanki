import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSessions, getSimulations } from '../services/statsService'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import { BarChart2, Loader2, Clock, Target, TrendingUp } from 'lucide-react'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDuration(s) {
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}min` : `${s}s`
}

export default function Stats() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [sess, sims] = await Promise.all([
        getSessions(user.uid, 30),
        getSimulations(user.uid),
      ])
      setSessions(sess.reverse())
      setSimulations(sims.reverse())
      setLoading(false)
    }
    load()
  }, [user.uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const sessionChartData = sessions.map((s, i) => ({
    label: formatDate(s.date) || `#${i + 1}`,
    ice: s.ice || 0,
    cards: s.cards?.length || 0,
    points: s.totalPoints || 0,
  }))

  const simChartData = simulations.map((s, i) => ({
    label: formatDate(s.date) || `#${i + 1}`,
    score: Number((s.score || 0).toFixed(2)),
  }))

  const avgIce = sessions.length
    ? Math.round(sessions.reduce((s, sess) => s + (sess.ice || 0), 0) / sessions.length)
    : 0
  const totalCards = sessions.reduce((s, sess) => s + (sess.cards?.length || 0), 0)
  const totalTime = sessions.reduce((s, sess) => s + (sess.duration || 0), 0)

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Estatísticas</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">Acompanhe sua evolução</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <Target className="w-5 h-5 text-teal-500 mx-auto mb-1.5" />
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{avgIce}%</div>
          <p className="text-xs text-stone-400">ICE médio</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{totalCards}</div>
          <p className="text-xs text-stone-400">Cards revisados</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{Math.round(totalTime / 60)}</div>
          <p className="text-xs text-stone-400">Minutos estudados</p>
        </div>
      </div>

      {/* Session ICE chart */}
      {sessionChartData.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
            ICE por sessão (últimas {sessionChartData.length})
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sessionChartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="ice" stroke="#0D9488" strokeWidth={2} dot={{ r: 3, fill: '#0D9488' }} name="ICE %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Simulation score chart */}
      {simChartData.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
            Evolução nos simulados UFPR
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={simChartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Pontuação" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Histórico de sessões
            </h3>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {[...sessions].reverse().slice(0, 20).map((s, i) => (
              <div key={s.id || i} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs text-stone-400 w-12 flex-shrink-0">
                  {formatDate(s.date)}
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300 flex-1">
                  {s.cards?.length || 0} cards · {formatDuration(s.duration || 0)}
                </span>
                <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                  (s.ice || 0) >= 80
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                    : (s.ice || 0) >= 60
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-600'
                    : (s.ice || 0) >= 40
                    ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-600'
                }`}>
                  ICE {s.ice || 0}%
                </div>
                <span className="text-xs font-medium text-stone-500 w-14 text-right">
                  {s.totalPoints || 0}/{s.maxPoints || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && simulations.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma sessão ainda. Comece a estudar!</p>
        </div>
      )}
    </>
  )
}
