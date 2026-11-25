"""Núcleo do assistente: monta o contexto, chama o Claude e confere as citações.

Fluxo (do dado de entrada até a resposta):
  1. dados do aluno (JSON do Firestore) -> perfil.montar_relatorio() -> trechos P*
  2. pergunta -> base_conhecimento.buscar_guias() (BM25) -> trechos MET-*/TRI-*
  3. trechos + versão do prompt -> Claude
  4. resposta -> verificar_citacoes(): separa fontes válidas e IDs inventados
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

import anthropic

from base_conhecimento import buscar_guias, guias
from perfil import Trecho, montar_relatorio
from prompts import VERSOES

MODELO = os.getenv("ASSISTENTE_MODELO", "claude-opus-5-5")
ESFORCO = os.getenv("ASSISTENTE_ESFORCO", "medium")
MAX_HISTORICO = 6  # últimas mensagens da conversa enviadas ao modelo

_CITACAO = re.compile(r"\[([A-Z]{2,3}(?:-\d+)?(?:\s*[,;]\s*[A-Z]{2,3}(?:-\d+)?)*)\]")
_ID_TRILHA = re.compile(r"\bTRI-\d+\b")

_cliente: anthropic.Anthropic | None = None


def cliente() -> anthropic.Anthropic:
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic()  # lê ANTHROPIC_API_KEY do ambiente
    return _cliente


@dataclass
class Resposta:
    texto: str
    fontes: list[dict] = field(default_factory=list)      # trechos citados que existem
    ids_invalidos: list[str] = field(default_factory=list)  # IDs citados que não existem
    contexto_ids: list[str] = field(default_factory=list)
    versao: str = "v3"
    modelo: str = MODELO
    tokens_entrada: int = 0
    tokens_saida: int = 0


def montar_contexto(dados: dict, pergunta: str) -> list[Trecho]:
    relatorio = montar_relatorio(dados)
    trechos_guia = buscar_guias(pergunta, k=4)

    # Garante que as trilhas indicadas em [PT] estejam no contexto, mesmo que a busca
    # não as traga — senão o modelo não teria o plano da trilha para explicar.
    pt = next(t for t in relatorio if t.id == "PT")
    # MET-9 (limites do assistente) entra sempre: ajuda a recusar perguntas fora do escopo.
    precisa = (set(_ID_TRILHA.findall(pt.texto)) or {"TRI-0"}) | {"MET-9"}
    por_id = {t.id: t for t in guias()}
    ja = {t.id for t in trechos_guia}
    for tid in sorted(precisa - ja):
        if tid in por_id:
            trechos_guia.append(por_id[tid])
    return relatorio + trechos_guia


def verificar_citacoes(texto: str, contexto: list[Trecho]) -> tuple[list[dict], list[str]]:
    por_id = {t.id: t for t in contexto}
    citados = []
    for grupo in _CITACAO.findall(texto):
        for cid in re.split(r"\s*[,;]\s*", grupo):
            if cid not in citados:
                citados.append(cid)
    validos = [{"id": c, "titulo": por_id[c].titulo, "origem": por_id[c].origem}
               for c in citados if c in por_id]
    invalidos = [c for c in citados if c not in por_id]
    return validos, invalidos


def responder(pergunta: str, dados: dict, historico: list[dict] | None = None,
              versao: str = "v3") -> Resposta:
    contexto = montar_contexto(dados, pergunta)
    system = VERSOES[versao].format(contexto="\n\n".join(t.formatar() for t in contexto))

    mensagens = []
    for msg in (historico or [])[-MAX_HISTORICO:]:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            mensagens.append({"role": msg["role"], "content": str(msg["content"])})
    while mensagens and mensagens[0]["role"] != "user":
        mensagens.pop(0)
    mensagens.append({"role": "user", "content": pergunta})

    resp = cliente().beta.messages.create(
        model=MODELO,
        max_tokens=16000,
        system=system,
        messages=mensagens,
        output_config={"effort": ESFORCO},
        # Se o filtro de segurança recusar, o próprio servidor tenta outro modelo.
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )

    if resp.stop_reason == "refusal":
        texto = "Não consegui responder a essa pergunta. Tente reformular falando do seu estudo no app."
    else:
        texto = "".join(b.text for b in resp.content if b.type == "text").strip()

    fontes, invalidos = verificar_citacoes(texto, contexto)
    return Resposta(
        texto=texto,
        fontes=fontes,
        ids_invalidos=invalidos,
        contexto_ids=[t.id for t in contexto],
        versao=versao,
        modelo=resp.model,
        tokens_entrada=resp.usage.input_tokens,
        tokens_saida=resp.usage.output_tokens,
    )
