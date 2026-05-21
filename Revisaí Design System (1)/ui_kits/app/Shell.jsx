// Shell.jsx — App layout with sidebar + bottom nav

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "decks",     label: "Baralhos",  icon: "▤" },
  { id: "study",     label: "Estudar",   icon: "▣" },
  { id: "vestibular",label: "Vestibular",icon: "★" },
  { id: "stats",     label: "Estatísticas", icon: "↗" },
];

function Sidebar({ route, setRoute, onSignOut }) {
  return (
    <aside className="side">
      <div className="side__brand">
        <img src="../../assets/revisai-mark.svg" width="32" height="32" alt="" />
        <span className="side__word">Revisaí</span>
      </div>
      <nav className="side__nav">
        {NAV.map((it) => (
          <button
            key={it.id}
            className={`side__item ${route === it.id ? "is-active" : ""}`}
            onClick={() => setRoute(it.id)}
          >
            <span className="side__ico">{it.icon}</span>
            {it.label}
          </button>
        ))}
      </nav>
      <div className="side__foot">
        <div className="side__user">
          <div className="avatar">A</div>
          <div className="side__userMeta">
            <span className="side__userName">Ana Cardoso</span>
            <span className="side__userMail">ana@revisai.com</span>
          </div>
        </div>
        <button className="side__sign" onClick={onSignOut}>Sair</button>
      </div>
    </aside>
  );
}

function BottomNav({ route, setRoute }) {
  return (
    <nav className="botnav">
      {NAV.map((it) => (
        <button
          key={it.id}
          className={`botnav__item ${route === it.id ? "is-active" : ""}`}
          onClick={() => setRoute(it.id)}
        >
          <span className="botnav__ico">{it.icon}</span>
          <span className="botnav__lbl">{it.label.split(" ")[0]}</span>
        </button>
      ))}
    </nav>
  );
}

window.Sidebar = Sidebar;
window.BottomNav = BottomNav;
