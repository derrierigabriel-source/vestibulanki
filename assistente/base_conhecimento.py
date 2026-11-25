"""Base de conhecimento: guias escritos pela equipe + busca BM25.

Os guias (conhecimento/*.md) são divididos em trechos pelos títulos "## [ID] ...".
Para cada pergunta, buscamos os trechos mais relevantes com BM25 (o mesmo princípio
de buscadores clássicos: palavras raras e repetidas pesam mais). O relatório de
progresso do aluno é pequeno e entra sempre inteiro.
"""
from __future__ import annotations

import math
import re
import unicodedata
from collections import Counter
from pathlib import Path

from perfil import Trecho

PASTA = Path(__file__).parent / "conhecimento"
_TITULO = re.compile(r"^## \[(?P<id>[A-Z]+-\d+)\] (?P<titulo>.+)$", re.M)

STOPWORDS = set("""
a o as os um uma uns umas de do da dos das em no na nos nas por para pra com sem e ou que
se eu meu minha meus minhas me voce você é e ser foi sao são esta está estou tem ter tenho
qual quais quanto quantos quantas como quando onde porque por que isso esse essa este esta
ao aos à às mais menos muito muita já ja ainda sobre entre seu sua seus suas lhe ele ela
""".split())

# Sinônimos simples para aproximar a linguagem do aluno da linguagem dos guias.
SINONIMOS = {
    "trilha": "trilha plano recomendar",
    "focar": "trilha recomendar",
    "devo": "recomendar plano",
    "chute": "chute alerta",
    "chutando": "chute alerta",
    "descuido": "descuido alerta",
    "simulado": "simulado vestibular ufpr",
    "prova": "simulado vestibular ufpr",
    "nota": "pontuacao simulado",
    "pontos": "pontos pontuacao matriz",
    "fila": "fila urgente revisao",
    "atrasado": "vencidos revisao",
    "atrasados": "vencidos revisao",
    "sequencia": "sequencia streak constancia",
    "streak": "sequencia streak constancia",
    "meta": "meta diaria",
}


def normalizar(texto: str) -> list[str]:
    texto = unicodedata.normalize("NFKD", texto.lower())
    texto = "".join(ch for ch in texto if not unicodedata.combining(ch))
    tokens = [t for t in re.findall(r"[a-z0-9]+", texto) if t not in STOPWORDS and len(t) > 1]
    extra = []
    for t in tokens:
        extra.extend(SINONIMOS.get(t, "").split())
    return [t[:6] for t in tokens + extra]  # "stemming" grosseiro: prefixo de 6 letras


def carregar_guias(pasta: Path = PASTA) -> list[Trecho]:
    trechos = []
    for arquivo in sorted(pasta.glob("*.md")):
        texto = arquivo.read_text(encoding="utf-8")
        marcas = list(_TITULO.finditer(texto))
        for i, mt in enumerate(marcas):
            fim = marcas[i + 1].start() if i + 1 < len(marcas) else len(texto)
            corpo = texto[mt.end():fim].strip()
            trechos.append(Trecho(mt["id"], mt["titulo"].strip(), corpo, arquivo.stem))
    return trechos


class BuscaBM25:
    def __init__(self, trechos: list[Trecho], k1: float = 1.5, b: float = 0.75):
        self.trechos = trechos
        self.docs = [normalizar(t.titulo + " " + t.texto) for t in trechos]
        self.k1, self.b = k1, b
        self.media = sum(map(len, self.docs)) / max(1, len(self.docs))
        df = Counter(tok for d in self.docs for tok in set(d))
        n = len(self.docs)
        self.idf = {tok: math.log(1 + (n - f + 0.5) / (f + 0.5)) for tok, f in df.items()}

    def buscar(self, pergunta: str, k: int = 4) -> list[tuple[Trecho, float]]:
        consulta = normalizar(pergunta)
        pontuados = []
        for trecho, doc in zip(self.trechos, self.docs):
            freq = Counter(doc)
            s = 0.0
            for tok in consulta:
                if tok not in freq:
                    continue
                f = freq[tok]
                s += self.idf[tok] * f * (self.k1 + 1) / (
                    f + self.k1 * (1 - self.b + self.b * len(doc) / self.media)
                )
            if s > 0:
                pontuados.append((trecho, s))
        pontuados.sort(key=lambda x: x[1], reverse=True)
        return pontuados[:k]


_GUIAS = carregar_guias()
_BUSCA = BuscaBM25(_GUIAS)


def guias() -> list[Trecho]:
    return list(_GUIAS)


def buscar_guias(pergunta: str, k: int = 4) -> list[Trecho]:
    return [t for t, _ in _BUSCA.buscar(pergunta, k)]
