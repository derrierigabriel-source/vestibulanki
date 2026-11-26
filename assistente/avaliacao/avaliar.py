"""Roda as perguntas de teste nas 3 versões do prompt e conta:
  - acertos: resposta contém os fatos esperados (conferidos no relatório) e nada inventado
  - inventadas: cita ID que não existe, contém algo proibido, ou responde o que deveria recusar
  - sem fonte: pergunta sobre dados/app respondida sem citar nenhum trecho válido

A correção automática é uma triagem: a coluna "revisao_humana" do CSV deve ser
preenchida pela equipe, conferindo cada resposta com relatorio_aluno_ficticio.md
e conhecimento/*.md.

Uso:
  python avaliacao/avaliar.py                  # v1, v2 e v3
  python avaliacao/avaliar.py --versoes v3     # só uma versão
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(AQUI.parent / ".env.local")

from assistente import responder  # noqa: E402
from prompts import MUDANCAS  # noqa: E402

PRECISA_FONTE = {"progresso", "trilha", "metodologia"}


def norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", t.lower())
    return "".join(c for c in t if not unicodedata.combining(c))


def julgar(q: dict, texto: str, fontes: list[dict], invalidos: list[str]) -> dict:
    n = norm(texto)
    faltando = [g for g in q["deve_conter"] if not any(norm(alt) in n for alt in g)]
    proibidos = [p for p in q["nao_deve_conter"] if norm(p) in n]
    inventada = bool(proibidos or invalidos)
    sem_fonte = q["categoria"] in PRECISA_FONTE and not fontes
    acerto = not faltando and not inventada
    return {
        "acerto": acerto, "inventada": inventada, "sem_fonte": sem_fonte,
        "motivo": "; ".join(filter(None, [
            f"faltou {faltando}" if faltando else "",
            f"proibido {proibidos}" if proibidos else "",
            f"IDs inexistentes {invalidos}" if invalidos else "",
            "sem citação" if sem_fonte else "",
        ])),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--versoes", nargs="+", default=["v1", "v2", "v3"])
    ap.add_argument("--perguntas", default=str(AQUI / "perguntas.json"))
    ap.add_argument("--perfil", default=str(AQUI / "perfil_ficticio.json"))
    args = ap.parse_args()

    perguntas = json.loads(Path(args.perguntas).read_text(encoding="utf-8"))
    dados = json.loads(Path(args.perfil).read_text(encoding="utf-8"))
    saida = AQUI / "resultados"
    saida.mkdir(exist_ok=True)
    carimbo = datetime.now().strftime("%Y%m%d-%H%M")

    linhas, resumo = [], {}
    for v in args.versoes:
        cont = {"acertos": 0, "inventadas": 0, "sem_fonte": 0, "total": 0, "tokens": 0}
        for q in perguntas:
            t0 = time.time()
            r = responder(q["pergunta"], dados, versao=v)
            j = julgar(q, r.texto, r.fontes, r.ids_invalidos)
            cont["total"] += 1
            cont["acertos"] += j["acerto"]
            cont["inventadas"] += j["inventada"]
            cont["sem_fonte"] += j["sem_fonte"]
            cont["tokens"] += r.tokens_entrada + r.tokens_saida
            marca = "OK " if j["acerto"] else "ERR"
            print(f"[{v}] {q['id']} {marca} {j['motivo']}")
            linhas.append({
                "versao": v, "id": q["id"], "categoria": q["categoria"], "pergunta": q["pergunta"],
                "resposta_esperada": q["esperado"], "fonte_esperada": q["fonte"],
                "resposta": r.texto, "fontes_citadas": " ".join(f["id"] for f in r.fontes),
                "ids_inexistentes": " ".join(r.ids_invalidos),
                "acerto_auto": "sim" if j["acerto"] else "não",
                "inventada_auto": "sim" if j["inventada"] else "não",
                "sem_fonte_auto": "sim" if j["sem_fonte"] else "não",
                "motivo_auto": j["motivo"], "revisao_humana": "",
                "segundos": round(time.time() - t0, 1), "modelo": r.modelo,
            })
        resumo[v] = cont

    csv_path = saida / f"resultados-{carimbo}.csv"
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig abre certo no Excel
        w = csv.DictWriter(f, fieldnames=list(linhas[0]), delimiter=";")
        w.writeheader()
        w.writerows(linhas)

    md = [f"# Resultados da avaliação — {carimbo}", "",
          f"Perguntas: {len(perguntas)} · Perfil: aluno fictício", "",
          "| Versão | O que mudou | Acertos | Inventadas | Sem fonte | Tokens |",
          "|---|---|---|---|---|---|"]
    for v, c in resumo.items():
        md.append(f"| {v} | {MUDANCAS[v]} | {c['acertos']}/{c['total']} | {c['inventadas']} | "
                  f"{c['sem_fonte']} | {c['tokens']} |")
    md += ["", "Detalhes por pergunta em " + csv_path.name + "."]
    md_path = saida / f"resumo-{carimbo}.md"
    md_path.write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md))
    print(f"\nArquivos: {csv_path}\n          {md_path}")


if __name__ == "__main__":
    main()
