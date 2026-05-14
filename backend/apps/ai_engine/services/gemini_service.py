"""Call Gemini REST API (no API key in repo — use GEMINI_API_KEY env)."""
from __future__ import annotations

import base64
import os
import time
from pathlib import Path
from typing import Any

import requests
from django.conf import settings


def _image_part(image_path: Path, mime: str = "image/jpeg") -> dict[str, Any]:
    data = base64.standard_b64encode(image_path.read_bytes()).decode("ascii")
    return {"inline_data": {"mime_type": mime, "data": data}}


def generate_content(
    prompt: str,
    image_path: Path | None = None,
    *,
    model: str | None = None,
) -> tuple[str | None, dict[str, Any], int]:
    """
    Returns (text, raw_json, latency_ms). text is None on failure.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "") or getattr(settings, "GEMINI_API_KEY", "")
    if not api_key or not getattr(settings, "USE_GEMINI_AI", True):
        return None, {"error": "missing_key_or_disabled"}, 0

    mdl = model or os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{mdl}:generateContent"
    parts: list[dict[str, Any]] = [{"text": prompt}]
    if image_path and image_path.exists():
        suf = image_path.suffix.lower()
        mime = "image/png" if suf == ".png" else "image/jpeg"
        parts.append(_image_part(image_path, mime=mime))

    body = {"contents": [{"role": "user", "parts": parts}]}
    t0 = time.perf_counter()
    try:
        r = requests.post(
            url,
            params={"key": api_key},
            json=body,
            timeout=120,
        )
        latency = int((time.perf_counter() - t0) * 1000)
        raw = r.json()
        if r.status_code != 200:
            return None, raw, latency
        candidates = raw.get("candidates") or []
        if not candidates:
            return None, raw, latency
        content = candidates[0].get("content") or {}
        plist = content.get("parts") or []
        texts = [p.get("text", "") for p in plist if isinstance(p, dict) and "text" in p]
        return "".join(texts).strip(), raw, latency
    except Exception as exc:  # noqa: BLE001
        latency = int((time.perf_counter() - t0) * 1000)
        return None, {"error": str(exc)}, latency
