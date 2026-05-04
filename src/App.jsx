import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './components/Auth/Login'
import Home from './pages/Home'
import Decks from './pages/Decks'
import Study from './pages/Study'
import Vestibular from './pages/Vestibular'
import Stats from './pages/Stats'
import Dashboard from './components/Dashboard'
import {
  LayoutDashboard, Layers, BookOpen, GraduationCap, BarChart2,
  Sun, Moon, LogOut, Menu, X,
} from 'lucide-react'

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/decks', label: 'Baralhos', icon: Layers },
  { to: '/study', label: 'Estudar', icon: BookOpen },
  { to: '/vestibular', label: 'Vestibular', icon: GraduationCap },
  { to: '/stats', label: 'Estatísticas', icon: BarChart2 },
]

function AppLayout({ children }) {
  const [dark, setDark] = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 h-screen sticky top-0 flex-shrink-0">
        <div className="px-5 py-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 dark:text-white" style={{ fontFamily: 'Instrument Serif, serif' }}>
              FlashCard Pro
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
          <button
            onClick={() => setDark((d) => !d)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Modo claro' : 'Modo escuro'}
          </button>
          {user && (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          )}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-teal-200 dark:bg-teal-800 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {user.displayName || user.email}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-stone-900 dark:text-white text-sm" style={{ fontFamily: 'Instrument Serif, serif' }}>
            FlashCard Pro
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark((d) => !d)} className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen((o) => !o)} className="p-2 text-stone-500">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm pt-14" onClick={() => setMobileOpen(false)}>
          <div className="bg-white dark:bg-stone-900 w-56 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-stone-100 dark:border-stone-800">
              {user && (
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pt-20 md:pt-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex safe-area-pb">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/study" element={<Study />} />
                    <Route path="/vestibular" element={<Vestibular />} />
                    <Route path="/stats" element={<Stats />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
