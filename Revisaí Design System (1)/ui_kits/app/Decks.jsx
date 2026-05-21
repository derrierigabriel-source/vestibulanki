// Decks.jsx
const DECKS = [
  { id: 1, name: "Matemática Básica", category: "Exatas",    color: "#3B82F6", count: 10, urgent: 3, soon: 2, ok: 5, icon: "𝛑" },
  { id: 2, name: "Física",            category: "Exatas",    color: "#D45C3A", count: 10, urgent: 5, soon: 3, ok: 2, icon: "⚛" },
  { id: 3, name: "Lógica",            category: "Raciocínio",color: "#8B5CF6", count: 10, urgent: 1, soon: 4, ok: 5, icon: "∴" },
  { id: 4, name: "História do Brasil",category: "Humanas",   color: "#F59E0B", count: 24, urgent: 0, soon: 6, ok: 18, icon: "✦" },
  { id: 5, name: "Biologia Celular",  category: "Biológicas",color: "#10B981", count: 18, urgent: 2, soon: 7, ok: 9, icon: "❀" },
  { id: 6, name: "Literatura",        category: "Humanas",   color: "#EC4899", count: 12, urgent: 1, soon: 3, ok: 8, icon: "✎" },
];

function DeckCard({ d, onStudy }) {
  return (
    <div className="deck" style={{ "--deck-c": d.color }}>
      <div className="deck__stripe" />
      <div className="deck__head">
        <div className="deck__icon" style={{ background: `${d.color}24`, color: d.color }}>{d.icon}</div>
        <div>
          <div className="deck__name">{d.name}</div>
          <div className="deck__cat">{d.category}</div>
        </div>
        <button className="deck__more">⋯</button>
      </div>
      <div className="deck__meta">
        <span><b>{d.count}</b> cards</span>
        {d.urgent > 0 && <span style={{ color: "#F87171" }}>● {d.urgent} urgentes</span>}
        {d.soon > 0 && <span style={{ color: "#FBBF24" }}>● {d.soon} em breve</span>}
      </div>
      <div className="deck__progress">
        <div style={{ width: `${(d.urgent / d.count) * 100}%`, background: "#EF4444" }} />
        <div style={{ width: `${(d.soon / d.count) * 100}%`, background: "#F59E0B" }} />
        <div style={{ width: `${(d.ok / d.count) * 100}%`, background: "#10B981" }} />
      </div>
      <button className="deck__cta" onClick={onStudy}>
        ▶ Estudar
      </button>
    </div>
  );
}

function Decks({ onStudy }) {
  return (
    <div className="page">
      <header className="page__head">
        <div>
          <span className="eyebrow">6 baralhos · 84 cards</span>
          <h1 className="page__title">Baralhos</h1>
        </div>
        <button className="btn btn--primary">+ Novo baralho</button>
      </header>
      <div className="grid grid--3">
        {DECKS.map((d) => <DeckCard key={d.id} d={d} onStudy={onStudy} />)}
      </div>
    </div>
  );
}

window.Decks = Decks;
