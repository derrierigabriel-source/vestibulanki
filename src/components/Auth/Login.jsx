import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Mail, Lock, LogIn, UserPlus } from 'lucide-react'

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/')
    } catch {
      setError('Erro ao entrar com Google. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
      navigate('/')
    } catch (e) {
      const msgs = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'E-mail já cadastrado.',
        'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/invalid-credential': 'Credenciais inválidas.',
      }
      setError(msgs[e.code] || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Mesh background */}
      <div className="mesh">
        <div className="mesh__blob mesh__blob--a" />
        <div className="mesh__blob mesh__blob--b" />
        <div className="mesh__blob mesh__blob--c" />
      </div>

      <div className="login-shell">
        {/* Brand */}
        <div className="login-brand">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 32px rgba(212,92,58,0.45)',
          }}>
            <BookOpen style={{ width: 26, height: 26, color: '#fff' }} />
          </div>
          <p className="login-wordmark" style={{ fontFamily: 'Instrument Serif, serif' }}>VestibulAnki</p>
          <p className="login-tagline">Estude menos. Aprenda de verdade.</p>
        </div>

        {/* Glass card */}
        <div className="glass">
          {/* Tab switcher */}
          <div className="seg">
            <button
              className={`seg__btn${mode === 'login' ? ' is-active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >
              Entrar
            </button>
            <button
              className={`seg__btn${mode === 'register' ? ' is-active' : ''}`}
              onClick={() => { setMode('register'); setError('') }}
            >
              Criar conta
            </button>
          </div>

          {/* Google */}
          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          <div className="divider"><span>ou</span></div>

          {/* Email form */}
          <form className="form" onSubmit={handleEmail}>
            <label className="field">
              <Mail />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="field">
              <Lock />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--danger-soft)', color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
              ) : mode === 'login' ? (
                <><LogIn style={{ width: 15, height: 15 }} /> Entrar</>
              ) : (
                <><UserPlus style={{ width: 15, height: 15 }} /> Criar conta</>
              )}
            </button>
          </form>
        </div>

        <p className="login-foot">
          Ao continuar você concorda com os termos de uso.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
