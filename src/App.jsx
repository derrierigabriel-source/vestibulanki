import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './components/Auth/Login'
import Home from './pages/Home'
import HomeApp from './pages/HomeApp'
import Decks from './pages/Decks'
import Study from './pages/Study'
import Vestibular from './pages/Vestibular'
import Stats from './pages/Stats'
import Dashboard from './components/Dashboard'
import {
  LayoutDashboard, Layers, BookOpen, GraduationCap, BarChart2,
  Sun, Moon, LogOut, Menu, X, House,
} from 'lucide-react'

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}

const NAV = [
  { to: '/home', label: 'Início', icon: House },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/decks', label: 'Baralhos', icon: Layers },
  { to: '/study', label: 'Estudar', icon: BookOpen },
  { to: '/vestibular', label: 'Vestibular', icon: GraduationCap },
  { to: '/stats', label: 'Estatísticas', icon: BarChart2 },
]

function Brand({ size = 28, fontSize = 15 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="side__mark" style={{ width: size, height: size }}>
        <BookOpen style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
      <span className="side__word" style={{ fontSize }}
        style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 700, fontSize, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>
        VestibulAnki
      </span>
    </div>
  )
}

function AppLayout({ children }) {
  const [dark, setDark] = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

  const avatar = (
    <div className="side__avatar">
      {user?.photoURL
        ? <img src={user.photoURL} alt="" />
        : (user?.displayName || user?.email || '?')[0].toUpperCase()
      }
    </div>
  )

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="side">
        <div className="side__brand">
          <div className="side__mark">
            <BookOpen style={{ width: 14, height: 14 }} />
          </div>
          <span className="side__word" style={{ fontFamily: 'Instrument Serif, serif' }}>
            VestibulAnki
          </span>
        </div>

        <nav className="side__nav">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              className={({ isActive }) => `side__item${isActive ? ' is-active' : ''}`}
            >
              <span className="side__ico"><Icon style={{ width: 15, height: 15 }} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="side__foot">
          <button className="side__btn" onClick={() => setDark(d => !d)}>
            {dark
              ? <Sun style={{ width: 14, height: 14 }} />
              : <Moon style={{ width: 14, height: 14 }} />}
            {dark ? 'Modo claro' : 'Modo escuro'}
          </button>
          {user && (
            <button className="side__btn side__btn--danger" onClick={signOut}>
              <LogOut style={{ width: 14, height: 14 }} /> Sair
            </button>
          )}
          {user && (
            <div className="side__user">
              {avatar}
              <span className="side__userName">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top header */}
      <div className="mob-header">
        <div className="mob-brand">
          <div className="mob-mark">
            <BookOpen style={{ width: 14, height: 14 }} />
          </div>
          <span className="mob-word" style={{ fontFamily: 'Instrument Serif, serif' }}>VestibulAnki</span>
        </div>
        <div className="mob-actions">
          <button className="mob-btn" onClick={() => setDark(d => !d)}>
            {dark ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
          </button>
          <button className="mob-btn" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mob-drawer" onClick={() => setMobileOpen(false)}>
          <div className="mob-drawer__panel" onClick={e => e.stopPropagation()}>
            <nav className="mob-drawer__nav">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/home'}
                  className={({ isActive }) => `side__item${isActive ? ' is-active' : ''}`}
                >
                  <span className="side__ico"><Icon style={{ width: 15, height: 15 }} /></span>
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mob-drawer__foot">
              {user && (
                <button className="side__btn side__btn--danger" onClick={signOut} style={{ width: '100%' }}>
                  <LogOut style={{ width: 14, height: 14 }} /> Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="app__main" style={{ paddingTop: 'clamp(72px, 8vw, 28px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="botnav safe-area-pb">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/home'}
            className={({ isActive }) => `botnav__item${isActive ? ' is-active' : ''}`}
          >
            <Icon style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 10 }}>{label.split(' ')[0]}</span>
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
                    <Route path="/home" element={<HomeApp />} />
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
