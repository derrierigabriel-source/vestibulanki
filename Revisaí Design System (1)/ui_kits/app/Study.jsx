// Study.jsx — Flashcard with 3D flip
const useS = React.useState;

const CARDS = [
  {
    id: 1,
    deck: "Matemática Básica",
    deckColor: "#3B82F6",
    difficulty: "Médio",
    front: "Qual é o resultado de 2³ × 2²?",
    options: ["2⁵", "2⁶", "4⁵", "2¹"],
    correct: 0,
    back: "Quando a base é igual, somamos os expoentes: 2³ × 2² = 2^(3+2) = 2⁵ = 32.",
  },
];

function Study({ onDone }) {
  const [flipped, setFlipped] = useS(false);
  const [picked, setPicked] = useS(null);
  const [phase, setPhase] = useS("question"); // question | answered | rated
  const card = CARDS[0];
  const correct = picked === card.correct;

  const pick = (i) => {
    if (flipped) return;
    setPicked(i);
    setFlipped(true);
    setTimeout(() => setPhase("answered"), 500);
  };

  return (
    <div className="page page--study">
      <header className="study__head">
        <button className="study__close" onClick={onDone}>✕</button>
        <div className="study__progress">
          <div className="study__row">
            <span className="study__chip" style={{ background: `${card.deckColor}24`, color: card.deckColor }}>● {card.deck}</span>
            <span className="study__count">Card 4 / 10</span>
            <span className="study__chip">{card.difficulty}</span>
          </div>
          <div className="study__bar"><div style={{ width: "42%" }} /></div>
        </div>
      </header>

      <div className="flip" style={{ perspective: "1400px" }}>
        <div className={`flip__inner ${flipped ? "is-flipped" : ""}`}>
          <div className="flip__face flip__front">
            <div className="flip__q">{card.front}</div>
            <div className="flip__opts">
              {card.options.map((o, i) => {
                const isPicked = picked === i;
                const isRight = i === card.correct;
                let cls = "flip__opt";
                if (flipped && isPicked && isRight) cls += " is-correct";
                else if (flipped && isPicked && !isRight) cls += " is-wrong";
                else if (flipped && isRight) cls += " is-correct-faint";
                return (
                  <button key={i} className={cls} onClick={() => pick(i)} disabled={flipped}>
                    <span className="flip__letter">{"ABCD"[i]})</span>
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flip__face flip__back">
            <div className={`flip__verdict ${correct ? "is-ok" : "is-bad"}`}>
              {correct ? "✓ Correto" : `✕ Resposta correta: ${"ABCD"[card.correct]}) ${card.options[card.correct]}`}
            </div>
            <div className="flip__a">{card.back}</div>
            {phase === "answered" ? (
              <div className="rate">
                <p className="rate__lbl">Como foi para você?</p>
                <div className="rate__opts">
                  <button className="rate__btn rate__btn--hard"   onClick={() => setPhase("rated")}><span>😰</span>Muito difícil</button>
                  <button className="rate__btn rate__btn--medium" onClick={() => setPhase("rated")}><span>😐</span>Médio</button>
                  <button className="rate__btn rate__btn--easy"   onClick={() => setPhase("rated")}><span>😊</span>Fácil</button>
                </div>
              </div>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={onDone}>Próximo card →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Study = Study;
