// Dashboard.jsx — KPI tiles, weekly bars, queue donut, top problematic

// React hooks accessed via React.* in this file

// Animated count-up
function useCountUp(target, duration = 800) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatTile({ label, value, sub, icon, accent, suffix, goal }) {
  const v = useCountUp(value);
  const display = Math.round(v);
  const pct = goal ? Math.round((value / goal) * 100) : null;
  return (
    <div className="stat">
      <div className="stat__top">
        <span className="stat__ico" style={{ color: accent }}>{icon}</span>
        <span className="stat__lbl">{label}</span>
      </div>
      <div className="stat__num">
        {display}{suffix}
        {goal && <span className="stat__goal">/{goal}</span>}
      </div>
      {goal != null ? (
        <div className="stat__bar"><div style={{ width: `${pct}%` }} /></div>
      ) : (
        <div className="stat__sub">{sub}</div>
      )}
    </div>
  );
}

function StreakFire({ days }) {
  return (
    <div className="stat stat--streak">
      <div className="stat__top">
        <span className="streak__flame" aria-hidden>
          <span className="streak__flame-inner">🔥</span>
        </span>
        <span className="stat__lbl">Streak</span>
      </div>
      <div className="stat__num">{days}<span className="stat__goal">dias</span></div>
      <div className="stat__sub">Sua melhor sequência: 18 dias</div>
    </div>
  );
}

const WEEK = [
  { d: "Seg", v: 12, ice: 78 },
  { d: "Ter", v: 18, ice: 82 },
  { d: "Qua", v: 8,  ice: 65 },
  { d: "Qui", v: 22, ice: 88 },
  { d: "Sex", v: 16, ice: 84 },
  { d: "Sáb", v: 25, ice: 91 },
  { d: "Dom", v: 14, ice: 80 },
];

function WeeklyChart() {
  const max = Math.max(...WEEK.map((w) => w.v));
  return (
    <div className="card chart">
      <div className="card__head">
        <h3>Últimos 7 dias</h3>
        <span className="card__meta">↑ 12% vs semana anterior</span>
      </div>
      <div className="bars">
        {WEEK.map((w, i) => (
          <div className="bars__col" key={i}>
            <div className="bars__bar" style={{ height: `${(w.v / max) * 100}%`, animationDelay: `${i * 60}ms` }}>
              <span className="bars__val">{w.v}</span>
            </div>
            <span className="bars__lbl">{w.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueDonut() {
  const data = [
    { lbl: "Urgente",      v: 8,  c: "#EF4444" },
    { lbl: "Em breve",     v: 14, c: "#F59E0B" },
    { lbl: "Consolidado",  v: 28, c: "#10B981" },
  ];
  const total = data.reduce((s, d) => s + d.v, 0);
  let acc = 0;
  const C = 2 * Math.PI * 38;
  return (
    <div className="card donut">
      <div className="card__head"><h3>Filas</h3></div>
      <div className="donut__wrap">
        <svg viewBox="0 0 100 100" className="donut__svg">
          {data.map((d, i) => {
            const len = (d.v / total) * C;
            const off = -((acc / total) * C);
            acc += d.v;
            return (
              <circle key={i} cx="50" cy="50" r="38" fill="none"
                stroke={d.c} strokeWidth="11"
                strokeDasharray={`${len - 2} ${C - len + 2}`}
                strokeDashoffset={off}
                strokeLinecap="butt"
                transform="rotate(-90 50 50)"
                style={{ animation: `donutDraw 600ms ${i * 80}ms backwards` }}
              />
            );
          })}
        </svg>
        <div className="donut__center">
          <div className="donut__num">{total}</div>
          <div className="donut__lbl">cards</div>
        </div>
      </div>
      <div className="donut__legend">
        {data.map((d) => (
          <div key={d.lbl} className="donut__leg">
            <span className="donut__dot" style={{ background: d.c }} />
            <span className="donut__legLbl">{d.lbl}</span>
            <span className="donut__legVal">{d.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProblematicCards() {
  const items = [
    { i: 1, q: "Qual é o valor de log₂(128)?",                 deck: "Matemática", ice: 22 },
    { i: 2, q: "Qual representa a Lei de Coulomb?",            deck: "Física",     ice: 31 },
    { i: 3, q: "Negação de \u201cTodos os alunos passaram\u201d?", deck: "Lógica",     ice: 38 },
    { i: 4, q: "Energia cinética de 4 kg a 10 m/s?",           deck: "Física",     ice: 44 },
    { i: 5, q: "Derivada de f(x) = x³ - 4x² + 7",              deck: "Matemática", ice: 47 },
  ];
  return (
    <div className="card">
      <div className="card__head"><h3>Top 5 cards problemáticos</h3></div>
      <div className="prob">
        {items.map((it) => (
          <div className="prob__row" key={it.i}>
            <div className="prob__rank">{it.i}</div>
            <div className="prob__copy">
              <div className="prob__q">{it.q}</div>
              <div className="prob__deck">{it.deck}</div>
            </div>
            <div className="prob__ice">
              <div className="prob__bar"><div style={{ width: `${it.ice}%` }} /></div>
              <span>{it.ice}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page">
      <header className="page__head">
        <div>
          <span className="eyebrow">Olá, Ana</span>
          <h1 className="page__title">Bom dia. Você tem 8 cards urgentes.</h1>
        </div>
        <button className="btn btn--primary">
          Iniciar revisão
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </header>

      <div className="grid grid--4">
        <StreakFire days={12} />
        <StatTile label="Hoje" value={14} goal={20} accent="#D45C3A" icon="●" />
        <StatTile label="Baralhos" value={6} sub="50 cards no total" accent="#3B82F6" icon="▤" />
        <StatTile label="ICE médio" value={87} suffix="%" sub="↑ 4% vs semana anterior" accent="#10B981" icon="●" />
      </div>

      <div className="grid grid--3-1">
        <WeeklyChart />
        <QueueDonut />
      </div>

      <ProblematicCards />
    </div>
  );
}

window.Dashboard = Dashboard;
