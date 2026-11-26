"""API HTTP do assistente (FastAPI). O app React chama POST /chat.

Segurança:
- Se FIREBASE_PROJECT_ID estiver definido, exige o token de login do Firebase
  (Authorization: Bearer <idToken>) e só aceita usuários autenticados.
- Limite de perguntas por usuário por hora (ASSISTENTE_LIMITE_HORA, padrão 30).
- Nenhum dado é gravado: os dados do aluno só existem durante a requisição.

Rodar:  uvicorn servidor:app --reload --port 8000
"""
from __future__ import annotations

import os
import time
from pathlib import Path
from collections import defaultdict, deque

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Local: .env.local (o deploy do Firebase ignora esse arquivo; na nuvem a chave vem do Secret Manager)
load_dotenv(Path(__file__).parent / ".env.local")

from assistente import responder  # noqa: E402  (depois do load_dotenv)

PROJETO_FIREBASE = os.getenv("FIREBASE_PROJECT_ID", "").strip()
LIMITE_HORA = int(os.getenv("ASSISTENTE_LIMITE_HORA", "30"))
ORIGENS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]

app = FastAPI(title="Assistente VestibulAnki")
app.add_middleware(CORSMiddleware, allow_origins=ORIGENS, allow_methods=["POST", "GET"],
                   allow_headers=["Authorization", "Content-Type"])

_uso: dict[str, deque] = defaultdict(deque)


class Mensagem(BaseModel):
    role: str
    content: str = Field(max_length=4000)


class Pedido(BaseModel):
    pergunta: str = Field(min_length=1, max_length=500)
    dados: dict
    historico: list[Mensagem] = []


def _usuario(authorization: str | None) -> str:
    if not PROJETO_FIREBASE:
        return "dev-local"  # modo de desenvolvimento, sem verificação
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Faça login para usar o assistente.")
    from google.auth.transport import requests as g_requests
    from google.oauth2 import id_token
    try:
        info = id_token.verify_firebase_token(
            authorization.removeprefix("Bearer "), g_requests.Request(), audience=PROJETO_FIREBASE)
    except Exception:
        raise HTTPException(401, "Sessão inválida ou expirada. Entre novamente.")
    return info["sub"]


def _checar_limite(uid: str) -> None:
    agora = time.time()
    fila = _uso[uid]
    while fila and agora - fila[0] > 3600:
        fila.popleft()
    if len(fila) >= LIMITE_HORA:
        raise HTTPException(429, "Você atingiu o limite de perguntas por hora. Tente mais tarde.")
    fila.append(agora)


@app.get("/saude")
def saude():
    return {"ok": True, "verifica_login": bool(PROJETO_FIREBASE)}


@app.post("/chat")
def chat(pedido: Pedido, authorization: str | None = Header(default=None)):
    return atender(pedido, authorization)


def atender(pedido: Pedido, authorization: str | None) -> dict:
    """Lógica do /chat, usada pelo FastAPI (local) e pela Cloud Function (main.py)."""
    uid = _usuario(authorization)
    _checar_limite(uid)
    try:
        r = responder(pedido.pergunta, pedido.dados,
                      [m.model_dump() for m in pedido.historico], versao="v3")
    except anthropic.AuthenticationError:
        raise HTTPException(500, "Chave da API Anthropic inválida no servidor do assistente.")
    except anthropic.RateLimitError:
        raise HTTPException(503, "Muitas perguntas ao mesmo tempo. Tente de novo em instantes.")
    except anthropic.APIConnectionError:
        raise HTTPException(503, "Sem conexão com o serviço de IA.")
    except anthropic.APIStatusError as e:
        raise HTTPException(502, f"Erro no serviço de IA ({e.status_code}).")
    return {"resposta": r.texto, "fontes": r.fontes, "ids_invalidos": r.ids_invalidos}
