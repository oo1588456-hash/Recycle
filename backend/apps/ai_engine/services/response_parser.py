"""Parse and validate Gemini JSON output."""
from __future__ import annotations

import json
import re
from decimal import Decimal
from typing import Any

from django.conf import settings


def _strip_code_fence(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE)
        t = re.sub(r"\s*```$", "", t)
    return t.strip()


def parse_gemini_json(text: str) -> dict[str, Any] | None:
    if not text:
        return None
    raw = _strip_code_fence(text)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return None
        try:
            data = json.loads(m.group(0))
        except json.JSONDecodeError:
            return None
    return validate_parsed(data)


def validate_parsed(data: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(data, dict):
        return None
    label = str(data.get("condition_label", "unknown")).lower()
    if label not in ("excellent", "good", "fair", "poor"):
        label = "unknown"
    try:
        score = int(data.get("condition_score", 0))
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(100, score))
    try:
        mn = Decimal(str(data.get("suggested_price_min", 0)))
        avg = Decimal(str(data.get("suggested_price_avg", 0)))
        mx = Decimal(str(data.get("suggested_price_max", 0)))
    except Exception:  # noqa: BLE001
        return None
    if mn <= 0 or avg <= 0 or mx <= 0:
        return None
    if not (mn < avg < mx):
        return None
    try:
        conf = int(data.get("confidence_score", 70))
    except (TypeError, ValueError):
        conf = 70
    conf = max(0, min(100, conf))
    explanation = str(data.get("explanation", "")).strip()
    factors = data.get("price_factors") or []
    warnings = data.get("warnings") or []
    if not isinstance(factors, list):
        factors = []
    if not isinstance(warnings, list):
        warnings = []
    return {
        "condition_label": label,
        "condition_score": score,
        "suggested_price_min": mn,
        "suggested_price_avg": avg,
        "suggested_price_max": mx,
        "currency": str(data.get("currency", getattr(settings, "DEFAULT_CURRENCY", "GBP"))),
        "confidence_score": conf,
        "explanation": explanation,
        "price_factors": [str(x) for x in factors][:20],
        "warnings": [str(x) for x in warnings][:20],
    }
