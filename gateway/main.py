"""
Optional FastAPI gateway — thesis alignment (Ch.3–4: "FastAPI" + hidden OpenAI keys).

The main ReCycle API remains Django. Run this only if you want a separate OpenAI
proxy during experiments:

  cd gateway
  pip install -r requirements.txt
  set OPENAI_API_KEY=sk-...
  uvicorn main:app --host 127.0.0.1 --port 8090

Flutter / tools can POST JSON here; production should prefer Django + env keys.
"""
from __future__ import annotations

import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="ReCycle OpenAI Gateway (optional)", version="0.1.0")


class ChatJsonBody(BaseModel):
    """Minimal body compatible with OpenAI chat.completions + json_object."""

    model: str = Field(default_factory=lambda: os.environ.get("OPENAI_MODEL", "gpt-4o"))
    system: str = "You are a helpful assistant that replies with strict JSON only."
    user: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/chat-json")
async def chat_json(body: ChatJsonBody) -> dict[str, Any]:
    key = os.environ.get("OPENAI_API_KEY", "")
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set")

    payload = {
        "model": body.model,
        "messages": [
            {"role": "system", "content": body.system},
            {"role": "user", "content": body.user},
        ],
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json=payload,
        )
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text[:2000])
    return r.json()
