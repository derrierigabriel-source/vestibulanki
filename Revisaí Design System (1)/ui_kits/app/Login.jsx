// Login.jsx — Revisaí Login screen
// Glassmorphism card over an animated mesh gradient.

// React hooks accessed via React.useState in this file

function MeshBackground() {
  return (
    <div className="mesh">
      <div className="mesh__blob mesh__blob--a" />
      <div className="mesh__blob mesh__blob--b" />
      <div className="mesh__blob mesh__blob--c" />
      <div className="mesh__grain" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5.04c1.85 0 3.51.64 4.81 1.88l3.6-3.6C18.27 1.4 15.36.21 12 .21 7.32.21 3.27 2.84 1.28 6.7l4.18 3.25c1-3 3.79-4.91 6.54-4.91z"/>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.29H12v4.51h6.45c-.28 1.45-1.13 2.68-2.4 3.5l3.86 2.99c2.27-2.09 3.58-5.18 3.58-8.71z"/>
      <path fill="#FBBC05" d="M5.46 14.1a7.18 7.18 0 0 1-.4-2.36c0-.82.14-1.61.4-2.36L1.28 6.13A11.79 11.79 0 0 0 0 11.74c0 1.93.46 3.74 1.28 5.36l4.18-3z"/>
      <path fill="#34A853" d="M12 23.79c3.24 0 5.97-1.07 7.96-2.9l-3.86-2.99c-1.07.72-2.45 1.15-4.1 1.15-3.16 0-5.84-2.13-6.79-5.01l-4.18 3C3.27 21.16 7.32 23.79 12 23.79z"/>
    </svg>
  );
}

function Login({ onSignIn }) {
  const [mode, setMode] = React.useState("login");
  const [email, setEmail] = React.useState("ana@revisai.com");
  const [password, setPassword] = React.useState("••••••••");

  return (
    <div className="login">
      <MeshBackground />
      <div className="login__shell">
        <div className="login__brand">
          <img src="../../assets/revisai-mark.svg" width="56" height="56" alt="" className="login__mark" />
          <h1 className="login__wordmark">Revisaí</h1>
          <p className="login__tagline">Estude com confiança.</p>
        </div>

        <div className="glass">
          <div className="seg">
            <button className={`seg__btn ${mode === "login" ? "is-active" : ""}`} onClick={() => setMode("login")}>Entrar</button>
            <button className={`seg__btn ${mode === "register" ? "is-active" : ""}`} onClick={() => setMode("register")}>Criar conta</button>
          </div>

          <button className="btn btn--google" onClick={onSignIn}>
            <GoogleIcon /> Continuar com Google
          </button>

          <div className="divider"><span>ou</span></div>

          <form className="form" onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
            <label className="field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m22 6-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit" className="btn btn--primary btn--lg">
              {mode === "login" ? "Entrar" : "Criar conta"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

        <p className="login__foot">Acesso seguro via Firebase · Esqueceu a senha?</p>
      </div>
    </div>
  );
}

window.Login = Login;
