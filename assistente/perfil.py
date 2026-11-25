"""Transforma os dados brutos do aluno (Firestore) em um relatório de progresso.

Decisão de projeto: TODOS os números (ICE médio, filas, sequência, trilhas indicadas...)
são calculados aqui, em Python, de forma determinística. O modelo de linguagem só lê
esses fatos e os explica. Assim o assistente não precisa fazer contas (onde LLMs erram)
e cada fato tem um identificador que pode ser citado e conferido.

Formato de entrada (enviado pelo frontend, ver src/services/assistenteService.js):
{
  "agora": "2026-11-25T15:00:00-03:00",
  "decks": [{"id", "name", "category", "cards": [{"id", "front", "difficulty", "type",
             "queue", "nextReview", "iceScore", "correctRate",
             "history": [{"result", "perceived", "points", "date"}]}]}],
  "sessions": [{"date", "deckIds", "duration", "totalPoints", "maxPoints", "ice",
                "cards": [{"cardId", "result", "perceived", "points"}]}],
  "simulations": [{"date", "score", "duration",
                   "scoreByDeck": {"<deckId>": {"deckName", "score"}},
                   "answers": [{"cardId", "correct", "blank"}]}]
}
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

# Brasil (horário de Brasília) não tem horário de verão desde 2019.
FUSO_BR = timezone(timedelta(hours=-3))
META_DIARIA = 20

FILA_NOME = {"urgent": "Urgente", "soon": "Em breve", "consolidated": "Consolidado"}

# Limiares das trilhas — os mesmos descritos em conhecimento/trilhas.md
LIM_URGENTES = 5
LIM_VENCIDOS = 10
LIM_SESSOES_7D = 3
LIM_ICE_DECK = 60
LIM_ESTUDADOS_DECK = 5
LIM_COBERTURA = 0.30
LIM_ALERTAS = 2
LIM_ICE_SIMULADO = 70
DIAS_SEM_SIMULADO = 14
LIM_ICE_MANUTENCAO = 80
LIM_URGENTES_MANUTENCAO = 2


@dataclass
class Trecho:
    """Um pedaço da base de conhecimento, com ID citável."""
    id: str
    titulo: str
    texto: str
    origem: str  # "perfil", "metodologia" ou "trilhas"

    def formatar(self) -> str:
        return f"[{self.id}] {self.titulo}\n{self.texto}"


# ---------------------------------------------------------------- utilidades

def _data(valor) -> datetime | None:
    if not valor:
        return None
    if isinstance(valor, datetime):
        d = valor
    else:
        try:
            d = datetime.fromisoformat(str(valor).replace("Z", "+00:00"))
        except ValueError:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=FUSO_BR)
    return d.astimezone(FUSO_BR)


def _faixa_ice(ice: float) -> str:
    if ice >= 80:
        return "Excelente"
    if ice >= 60:
        return "Bom"
    if ice >= 40:
        return "Regular"
    return "Precisa estudar mais"


def _pct(parte: int, total: int) -> int:
    return round(100 * parte / total) if total else 0


def _fmt_nota(x: float) -> str:
    return f"{x:.2f}".replace(".", ",")


def _plural(n: int, palavra: str) -> str:
    return f"{n} {palavra}" + ("" if n == 1 else "s")


def _resumir(texto: str, limite: int = 90) -> str:
    texto = " ".join(str(texto or "").split())
    return texto if len(texto) <= limite else texto[: limite - 1] + "…"


def alertas_do_card(card: dict) -> list[str]:
    hist = card.get("history") or []
    alertas = []
    acertos = [h for h in hist if h.get("result") == "correct"]
    if (
        len(hist) >= 3
        and _pct(len(acertos), len(hist)) >= 80
        and acertos
        and all(h.get("perceived") == "hard" for h in acertos)
    ):
        alertas.append("Possível chute")
    erros_faceis = [h for h in hist if h.get("result") == "wrong" and h.get("perceived") == "easy"]
    if len(erros_faceis) >= 2:
        alertas.append("Descuido recorrente")
    return alertas


# ---------------------------------------------------------------- métricas

def calcular_metricas(dados: dict) -> dict:
    agora = _data(dados.get("agora")) or datetime.now(FUSO_BR)
    hoje = agora.date()
    decks = dados.get("decks") or []
    sessoes = dados.get("sessions") or []
    simulados = dados.get("simulations") or []

    todos_cards = []
    por_deck = []
    for deck in decks:
        cards = deck.get("cards") or []
        estudados = [c for c in cards if c.get("history")]
        tentativas = sum(len(c["history"]) for c in estudados)
        acertos = sum(1 for c in estudados for h in c["history"] if h.get("result") == "correct")
        filas = {k: sum(1 for c in cards if c.get("queue", "soon") == k) for k in FILA_NOME}
        vencidos = sum(
            1 for c in cards
            if (_data(c.get("nextReview")) or agora) <= agora
        )
        ice_medio = (
            round(sum(c.get("iceScore", 50) for c in estudados) / len(estudados))
            if estudados else None
        )
        info = {
            "id": deck.get("id"),
            "nome": deck.get("name", "Sem nome"),
            "categoria": deck.get("category") or "sem categoria",
            "total": len(cards),
            "estudados": len(estudados),
            "cobertura": (len(estudados) / len(cards)) if cards else 0,
            "tentativas": tentativas,
            "acerto_pct": _pct(acertos, tentativas),
            "ice_medio": ice_medio,
            "filas": filas,
            "vencidos": vencidos,
            "alertas": sum(1 for c in cards if alertas_do_card(c)),
        }
        por_deck.append(info)
        for c in cards:
            todos_cards.append({**c, "_deck": info["nome"]})

    estudados = [c for c in todos_cards if c.get("history")]
    tentativas = sum(len(c["history"]) for c in estudados)
    acertos = sum(1 for c in estudados for h in c["history"] if h.get("result") == "correct")
    ice_geral = (
        round(sum(c.get("iceScore", 50) for c in estudados) / len(estudados)) if estudados else None
    )
    filas = {k: sum(1 for c in todos_cards if c.get("queue", "soon") == k) for k in FILA_NOME}
    vencidos = sum(1 for c in todos_cards if (_data(c.get("nextReview")) or agora) <= agora)

    # Sessões e constância
    datas_sessao = [d for d in (_data(s.get("date")) for s in sessoes) if d]
    dias_com_sessao = {d.date() for d in datas_sessao}
    limite_7d = hoje - timedelta(days=6)
    sessoes_7d = [s for s in sessoes if (_data(s.get("date")) or agora).date() >= limite_7d]
    cards_7d = sum(len(s.get("cards") or []) for s in sessoes_7d)
    cards_hoje = sum(
        len(s.get("cards") or []) for s in sessoes
        if (d := _data(s.get("date"))) and d.date() == hoje
    )
    sequencia = 0
    dia = hoje if hoje in dias_com_sessao else hoje - timedelta(days=1)
    while dia in dias_com_sessao:
        sequencia += 1
        dia -= timedelta(days=1)
    ultima_sessao = max(datas_sessao) if datas_sessao else None

    # Cards problemáticos e alertas
    problematicos = sorted(estudados, key=lambda c: (c.get("iceScore", 50), -len(c["history"])))[:5]
    com_alerta = [(c, alertas_do_card(c)) for c in todos_cards]
    com_alerta = [(c, a) for c, a in com_alerta if a]

    # Simulados (ordem cronológica)
    sims = sorted(
        (s for s in simulados if _data(s.get("date"))),
        key=lambda s: _data(s.get("date")),
    )
    sim_info = []
    for s in sims:
        respostas = s.get("answers") or []
        sim_info.append({
            "data": _data(s["date"]),
            "nota": float(s.get("score") or 0),
            "questoes": len(respostas),
            "acertos": sum(1 for r in respostas if r.get("correct")),
            "brancos": sum(1 for r in respostas if r.get("blank")),
            "por_materia": {
                v.get("deckName", k): float(v.get("score") or 0)
                for k, v in (s.get("scoreByDeck") or {}).items()
            },
        })
    dias_desde_simulado = (hoje - sim_info[-1]["data"].date()).days if sim_info else None

    return {
        "agora": agora,
        "decks": por_deck,
        "total_cards": len(todos_cards),
        "estudados": len(estudados),
        "nunca_estudados": len(todos_cards) - len(estudados),
        "tentativas": tentativas,
        "acerto_pct": _pct(acertos, tentativas),
        "ice_geral": ice_geral,
        "filas": filas,
        "vencidos": vencidos,
        "total_sessoes": len(sessoes),
        "sessoes_7d": len(sessoes_7d),
        "cards_7d": cards_7d,
        "cards_hoje": cards_hoje,
        "sequencia": sequencia,
        "ultima_sessao": ultima_sessao,
        "problematicos": problematicos,
        "com_alerta": com_alerta,
        "simulados": sim_info,
        "dias_desde_simulado": dias_desde_simulado,
    }


# ---------------------------------------------------------------- regras das trilhas

def trilhas_indicadas(m: dict) -> list[tuple[str, str, str]]:
    """Aplica as regras de conhecimento/trilhas.md. Retorna (id, nome, motivo) por prioridade."""
    t = []
    urg = m["filas"]["urgent"]
    if urg >= LIM_URGENTES or m["vencidos"] >= LIM_VENCIDOS:
        t.append(("TRI-1", "Resgate Urgente",
                  f"{urg} cards na fila Urgente e {m['vencidos']} cards vencidos"))
    if m["sessoes_7d"] < LIM_SESSOES_7D:
        t.append(("TRI-2", "Ritmo Diário", f"apenas {m['sessoes_7d']} sessões nos últimos 7 dias"))
    for d in m["decks"]:
        if d["estudados"] >= LIM_ESTUDADOS_DECK and d["ice_medio"] is not None and d["ice_medio"] < LIM_ICE_DECK:
            t.append(("TRI-3", f"Reforço por Matéria — {d['nome']}",
                      f"ICE médio de {d['ice_medio']} em {d['nome']} com {d['estudados']} cards estudados"))
    for d in m["decks"]:
        if d["total"] and d["cobertura"] < LIM_COBERTURA:
            t.append(("TRI-4", f"Primeiros Passos — {d['nome']}",
                      f"só {d['estudados']} de {d['total']} cards de {d['nome']} foram estudados"))
    if len(m["com_alerta"]) >= LIM_ALERTAS:
        t.append(("TRI-5", "Calibração da Autoavaliação",
                  f"{len(m['com_alerta'])} cards com alerta automático"))
    sem_sim = m["dias_desde_simulado"] is None or m["dias_desde_simulado"] > DIAS_SEM_SIMULADO
    if m["ice_geral"] is not None and m["ice_geral"] >= LIM_ICE_SIMULADO and sem_sim:
        quando = ("nenhum simulado feito" if m["dias_desde_simulado"] is None
                  else f"último simulado há {m['dias_desde_simulado']} dias")
        t.append(("TRI-6", "Simulado UFPR", f"ICE geral de {m['ice_geral']} e {quando}"))
    if m["ice_geral"] is not None and m["ice_geral"] >= LIM_ICE_MANUTENCAO and urg <= LIM_URGENTES_MANUTENCAO:
        t.append(("TRI-7", "Manutenção", f"ICE geral de {m['ice_geral']} e {urg} cards urgentes"))
    return t


# ---------------------------------------------------------------- relatório (trechos citáveis)

def montar_relatorio(dados: dict) -> list[Trecho]:
    m = calcular_metricas(dados)
    T: list[Trecho] = []
    fmt_data = lambda d: d.strftime("%d/%m/%Y") if d else "nunca"

    ice_txt = (f"{m['ice_geral']} ({_faixa_ice(m['ice_geral'])})" if m["ice_geral"] is not None
               else "ainda não calculado (nenhum card estudado)")
    T.append(Trecho("PG", "Visão geral do aluno", "\n".join([
        f"Data de referência: {m['agora'].strftime('%d/%m/%Y')}.",
        f"Baralhos: {len(m['decks'])}. Cards no total: {m['total_cards']}.",
        f"Cards já estudados pelo menos uma vez: {m['estudados']}. Nunca estudados: {m['nunca_estudados']}.",
        f"Respostas registradas: {m['tentativas']}. Taxa de acerto geral: {m['acerto_pct']}%.",
        f"ICE médio dos cards estudados: {ice_txt}.",
    ]), "perfil"))

    T.append(Trecho("PF", "Filas de revisão", "\n".join([
        f"Fila Urgente: {m['filas']['urgent']} cards.",
        f"Fila Em breve: {m['filas']['soon']} cards.",
        f"Fila Consolidado: {m['filas']['consolidated']} cards.",
        f"Cards vencidos (revisão para hoje ou atrasada): {m['vencidos']}.",
    ]), "perfil"))

    T.append(Trecho("PS", "Constância e sessões", "\n".join([
        f"Sessões de estudo registradas: {m['total_sessoes']}.",
        f"Sessões nos últimos 7 dias: {m['sessoes_7d']}, com {m['cards_7d']} cards revisados.",
        f"Cards revisados hoje: {m['cards_hoje']} de uma meta diária de {META_DIARIA}.",
        f"Sequência atual (dias seguidos estudando): {m['sequencia']}.",
        f"Última sessão: {fmt_data(m['ultima_sessao'])}.",
    ]), "perfil"))

    for i, d in enumerate(m["decks"], 1):
        ice = f"{d['ice_medio']} ({_faixa_ice(d['ice_medio'])})" if d["ice_medio"] is not None else "sem dados"
        T.append(Trecho(f"PD-{i}", f"Baralho {d['nome']}", "\n".join([
            f"Categoria: {d['categoria']}. Cards: {d['total']}. Estudados: {d['estudados']} "
            f"({round(d['cobertura'] * 100)}%).",
            f"ICE médio: {ice}. Taxa de acerto: {d['acerto_pct']}% em {d['tentativas']} respostas.",
            f"Filas: {d['filas']['urgent']} Urgente, {d['filas']['soon']} Em breve, "
            f"{d['filas']['consolidated']} Consolidado. Vencidos: {d['vencidos']}.",
            f"Cards com alerta automático: {d['alertas']}.",
        ]), "perfil"))

    if m["problematicos"]:
        linhas = []
        for j, c in enumerate(m["problematicos"], 1):
            hist = c["history"]
            ac = sum(1 for h in hist if h.get("result") == "correct")
            linhas.append(
                f"{j}. \"{_resumir(c.get('front'))}\" ({c['_deck']}) — ICE {c.get('iceScore', 50)}, "
                f"{_plural(ac, 'acerto')} em {_plural(len(hist), 'tentativa')}, "
                f"fila {FILA_NOME.get(c.get('queue'), 'Em breve')}."
            )
        T.append(Trecho("PC", "Cards mais problemáticos (menor ICE)", "\n".join(linhas), "perfil"))
    else:
        T.append(Trecho("PC", "Cards mais problemáticos (menor ICE)",
                        "Nenhum card estudado ainda, então não há cards problemáticos.", "perfil"))

    if m["com_alerta"]:
        linhas = [f"- \"{_resumir(c.get('front'))}\" ({c['_deck']}): {', '.join(a)}."
                  for c, a in m["com_alerta"]]
        T.append(Trecho("PA", "Cards com alertas automáticos",
                        f"Total: {len(m['com_alerta'])} cards.\n" + "\n".join(linhas), "perfil"))
    else:
        T.append(Trecho("PA", "Cards com alertas automáticos",
                        "Nenhum card com alerta de possível chute ou descuido recorrente.", "perfil"))

    if m["simulados"]:
        ult = m["simulados"][-1]
        linhas = [f"Simulados feitos: {len(m['simulados'])}."]
        for s in m["simulados"]:
            linhas.append(
                f"- {fmt_data(s['data'])}: nota {_fmt_nota(s['nota'])} em {s['questoes']} questões "
                f"({s['acertos']} acertos, {s['brancos']} em branco)."
            )
        if ult["por_materia"]:
            ordem = sorted(ult["por_materia"].items(), key=lambda kv: kv[1], reverse=True)
            linhas.append("Nota por matéria no último simulado: "
                          + "; ".join(f"{k} {_fmt_nota(v)}" for k, v in ordem) + ".")
            linhas.append(f"Melhor matéria no último simulado: {ordem[0][0]}. "
                          f"Pior matéria no último simulado: {ordem[-1][0]}.")
        if len(m["simulados"]) >= 2:
            dif = ult["nota"] - m["simulados"][-2]["nota"]
            sentido = "subiu" if dif > 0 else "caiu" if dif < 0 else "ficou igual"
            linhas.append(f"Em relação ao simulado anterior, a nota {sentido} "
                          f"({_fmt_nota(abs(dif))} ponto{'s' if abs(dif) != 1 else ''}).")
        linhas.append(f"Dias desde o último simulado: {m['dias_desde_simulado']}.")
        T.append(Trecho("PV", "Simulados UFPR", "\n".join(linhas), "perfil"))
    else:
        T.append(Trecho("PV", "Simulados UFPR", "Nenhum simulado feito ainda.", "perfil"))

    trilhas = trilhas_indicadas(m)
    if trilhas:
        linhas = [f"{k}. {tid} {nome} — motivo: {motivo}." for k, (tid, nome, motivo) in enumerate(trilhas, 1)]
        texto = "Trilhas disparadas pelas regras, em ordem de prioridade:\n" + "\n".join(linhas)
    else:
        texto = "Nenhuma regra de trilha foi disparada pelos dados (ver TRI-0)."
    T.append(Trecho("PT", "Trilhas indicadas pelas regras", texto, "perfil"))
    return T
