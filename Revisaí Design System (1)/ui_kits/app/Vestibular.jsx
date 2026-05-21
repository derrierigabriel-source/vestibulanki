// Vestibular.jsx — UFPR-style exam mode
const useV = React.useState;
const useEv = React.useEffect;

const QS = [
  { id: 1, deck: "Matemática", deckColor: "#3B82F6", q: "Qual é o resultado de 2³ × 2²?", opts: ["2⁵", "2⁶", "4⁵", "2¹"], correct: 0 },
  { id: 2, deck: "Matemática", deckColor: "#3B82F6", q: "Se x² - 5x + 6 = 0, quais são os valores de x?", opts: ["x = 1 e x = 6", "x = -2 e x = -3", "x = 2 e x = 3", "x = -1 e x = 6"], correct: 2 },
  { id: 3, deck: "Física", deckColor: "#D45C3A", q: "Um carro percorre 150 km em 2h. Qual é sua velocidade média?", opts: ["60 km/h", "100 km/h", "75 km/h", "300 km/h"], correct: 2 },
  { id: 4, deck: "Física", deckColor: "#D45C3A", q: "Qual é a unidade de força no SI?", opts: ["Joule", "Watt", "Newton", "Pascal"], correct: 2 },
  { id: 5, deck: "Lógica", deckColor: "#8B5CF6", q: "Negação de \"Todos os alunos passaram\"?", opts: ["Nenhum passou", "Pelo menos um não passou", "A maioria não passou", "Todos reprovaram"], correct: 1 },
];

function fmt(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(Math.floor(m / 60)).padStart(2,"0")}:${String(m % 60).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function Vestibular({ onDone, lowTime = false }) {
  const [time, setTime] = useV(lowTime ? 487 : 9 * 60 + 47 + 4 * 3600);
  const [cur, setCur] = useV(2);
  const [answers, setAnswers] = useV({ 0: 0, 1: 2, 3: 2 });
  const [flagged, setFlagged] = useV(new Set([1]));

  useEv(() => {
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const q = QS[cur];
  const isLow = time < 600;
  const answered = Object.keys(answers).length;

  return (
    <div className="vest">
      <header className="vest__head">
        <div className="vest__brand">
          <img src="../../assets/revisai-mark.svg" width="22" height="22" alt="" />
          <span className="vest__title">Simulado UFPR</span>
        </div>
        <div className={`vest__timer ${isLow ? "is-low" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>
          {fmt(time)}
        </div>
        <div className="vest__answered">{answered}/{QS.length} respondidas</div>
        <button className="btn btn--primary" onClick={onDone}>Entregar</button>
      </header>

      <div className="vest__body">
        <aside className="vest__list">
          {QS.map((qq, i) => {
            const has = answers[i] !== undefined;
            const fl = flagged.has(i);
            return (
              <button key={i} className={`vest__qbtn ${cur === i ? "is-cur" : has ? "is-done" : ""}`} onClick={() => setCur(i)}>
                <span className="vest__qdot" style={{ background: qq.deckColor }} />
                Q{i + 1}
                {fl && <span className="vest__flag">🚩</span>}
              </button>
            );
          })}
        </aside>

        <main className="vest__main">
          <div className="vest__qhead">
            <span className="vest__chip" style={{ background: `${q.deckColor}26`, color: q.deckColor }}>● {q.deck}</span>
            <span className="vest__num">Questão {cur + 1} de {QS.length}</span>
            <button
              className={`vest__flagBtn ${flagged.has(cur) ? "is-on" : ""}`}
              onClick={() => {
                const n = new Set(flagged);
                n.has(cur) ? n.delete(cur) : n.add(cur);
                setFlagged(n);
              }}
            >🚩 {flagged.has(cur) ? "Marcada" : "Marcar"}</button>
          </div>

          <div className="vest__card">
            <p className="vest__qtext">{q.q}</p>
            <div className="vest__opts">
              {q.opts.map((o, i) => (
                <button key={i}
                  className={`vest__opt ${answers[cur] === i ? "is-sel" : ""}`}
                  onClick={() => setAnswers({ ...answers, [cur]: i })}
                >
                  <span className="vest__letter">{"ABCD"[i]})</span>
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="vest__nav">
            <button className="btn btn--secondary" onClick={() => setCur((c) => Math.max(0, c - 1))}>← Anterior</button>
            <span className="vest__progress">
              <span className="vest__progressBar">
                <span style={{ width: `${(answered / QS.length) * 100}%` }} />
              </span>
            </span>
            <button className="btn btn--secondary" onClick={() => setCur((c) => Math.min(QS.length - 1, c + 1))}>Próxima →</button>
          </div>
        </main>
      </div>
    </div>
  );
}

window.Vestibular = Vestibular;
