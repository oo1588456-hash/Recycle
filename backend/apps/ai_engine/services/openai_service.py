"""OpenAI Chat Completions with optional vision (JSON mode). Key via OPENAI_API_KEY."""
from __future__ import annotations

import base64
import os
import time
from pathlib import Path
from typing import Any

import requests
from django.conf import settings


def _mime_for_path(image_path: Path) -> str:
    suf = image_path.suffix.lower()
    if suf == ".png":
        return "image/png"
    if suf in (".webp",):
        return "image/webp"
    if suf in (".gif",):
        return "image/gif"
    return "image/jpeg"


def generate_content(
    prompt: str,
    image_path: Path | None = None,
    *,
    model: str | None = None,
) -> tuple[str | None, dict[str, Any], int]:
    """
    Returns (assistant_text, raw_json, latency_ms). text is None on failure.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "") or getattr(settings, "OPENAI_API_KEY", "")
    if not api_key or not getattr(settings, "USE_OPENAI_AI", False):
        return None, {"error": "missing_key_or_disabled"}, 0

    mdl = model or os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    url = "https://api.openai.com/v1/chat/completions"
    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    if image_path and image_path.exists():
        b64 = base64.standard_b64encode(image_path.read_bytes()).decode("ascii")
        mime = _mime_for_path(image_path)
        content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{b64}"},
            }
        )

    body: dict[str, Any] = {
        "model": mdl,
        "messages": [{"role": "user", "content": content}],
        "response_format": {"type": "json_object"},
    }
    t0 = time.perf_counter()
    try:
        r = requests.post(
            url,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
            timeout=120,
        )
        latency = int((time.perf_counter() - t0) * 1000)
        raw = r.json() if r.content else {}
        if r.status_code != 200:
            return None, raw if isinstance(raw, dict) else {"error": str(raw)[:2000]}, latency
        choices = raw.get("choices") or []
        if not choices:
            return None, raw, latency
        msg = choices[0].get("message") or {}
        text = (msg.get("content") or "").strip()
        return text or None, raw, latency
    except Exception as exc:  # noqa: BLE001
        latency = int((time.perf_counter() - t0) * 1000)
        return None, {"error": str(exc)}, latency
