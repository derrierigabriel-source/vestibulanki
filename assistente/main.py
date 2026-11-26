"""Versão em nuvem do assistente: Cloud Function (Firebase, Python).

O site publicado chama /api/chat; o firebase.json redireciona essa rota para esta função.
A chave da Anthropic fica no Secret Manager (firebase functions:secrets:set ANTHROPIC_API_KEY),
nunca no código nem no site.

Na nuvem o login Firebase é SEMPRE verificado (usa o ID do projeto onde a função roda).
"""
import json
import os

from firebase_functions import https_fn, options
from pydantic import ValidationError

# Liga a verificação de login com o projeto atual antes de carregar o servidor.
os.environ.setdefault("FIREBASE_PROJECT_ID", os.getenv("GCLOUD_PROJECT", "vestibulanki"))

from fastapi import HTTPException  # noqa: E402
from servidor import Pedido, atender  # noqa: E402

# Teto de custo: no máximo 3 instâncias ao mesmo tempo.
options.set_global_options(max_instances=3)


def _json(corpo: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(json.dumps(corpo, ensure_ascii=False), status=status,
                             content_type="application/json; charset=utf-8")


@https_fn.on_request(
    region="us-central1",
    memory=options.MemoryOption.MB_512,
    timeout_sec=60,
    secrets=["ANTHROPIC_API_KEY"],
)
def chat(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return _json({"detail": "Use POST."}, 405)
    try:
        pedido = Pedido.model_validate(req.get_json(silent=True) or {})
    except ValidationError:
        return _json({"detail": "Pergunta inválida (vazia ou com mais de 500 caracteres)."}, 422)
    try:
        return _json(atender(pedido, req.headers.get("Authorization")))
    except HTTPException as e:
        return _json({"detail": e.detail}, e.status_code)
