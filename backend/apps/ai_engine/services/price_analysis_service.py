"""Orchestrate cloud vision LLMs (OpenAI, then Gemini) + baseline + local fallback."""
from __future__ import annotations

import re
from decimal import Decimal
from pathlib import Path
from typing import Any

import pandas as pd
from django.conf import settings
from django.utils import timezone

from apps.ai_engine.models import AIAnalysisResult
from apps.ai_engine.services import gemini_service, openai_service, prompt_builder, response_parser
from apps.products.models import ProductListing


def _baseline_summary(product: ProductListing, max_rows: int = 8) -> str:
    path = Path(settings.BASE_DIR) / "data" / "price_baseline.csv"
    if not path.exists():
        return "No local baseline CSV available."
    try:
        df = pd.read_csv(path, nrows=5000)
    except Exception:  # noqa: BLE001
        return "Baseline file could not be read."
    if df.empty or "price" not in df.columns:
        return "Baseline has no price column."
    tokens = set(
        re.split(
            r"\W+",
            f"{product.title} {product.brand} {product.model_name} {(product.category.name if product.category else '')}".lower(),
        )
    )
    tokens = {t for t in tokens if len(t) > 2}

    def score_row(row: pd.Series) -> int:
        blob = " ".join(str(row.get(c, "") or "") for c in df.columns if c in ("title", "category", "brand", "description")).lower()
        rtoks = set(re.split(r"\W+", blob))
        return len(tokens & rtoks)

    try:
        df["_m"] = df.apply(score_row, axis=1)
        sub = df[df["_m"] > 0].sort_values("_m", ascending=False).head(max_rows)
    except Exception:  # noqa: BLE001
        return "Could not match baseline rows."
    if sub.empty:
        return "No close baseline matches for this product text."
    lines = []
    for _, r in sub.iterrows():
        lines.append(
            f"- {str(r.get('title', ''))[:80]} | {str(r.get('category', ''))[:40]} | "
            f"{str(r.get('brand', ''))[:30]} | price={r.get('price', '')} {r.get('currency', '')}"
        )
    return "\n".join(lines)


def _fallback(product: ProductListing) -> dict[str, Any]:
    op = Decimal(str(product.original_price))
    cond = (product.user_declared_condition or "good").lower()
    cf = {"excellent": Decimal("0.85"), "good": Decimal("0.70"), "fair": Decimal("0.50"), "poor": Decimal("0.30")}.get(
        cond, Decimal("0.70")
    )
    age = int(product.product_age_months or 0)
    if age <= 6:
        af = Decimal("0.95")
    elif age <= 12:
        af = Decimal("0.85")
    elif age <= 24:
        af = Decimal("0.70")
    elif age <= 36:
        af = Decimal("0.55")
    else:
        af = Decimal("0.40")
    usage = int(product.usage_duration_months or 0)
    usage_penalty = min(Decimal("0.15"), Decimal(usage) * Decimal("0.002"))
    avg = max(Decimal("1"), op * cf * af * (Decimal("1") - usage_penalty))
    mn = (avg * Decimal("0.85")).quantize(Decimal("0.01"))
    mx = (avg * Decimal("1.15")).quantize(Decimal("0.01"))
    avg = avg.quantize(Decimal("0.01"))
    return {
        "condition_label": cond if cond in ("excellent", "good", "fair", "poor") else "good",
        "condition_score": 65,
        "suggested_price_min": mn,
        "suggested_price_avg": avg,
        "suggested_price_max": mx,
        "currency": getattr(settings, "DEFAULT_CURRENCY", "GBP"),
        "confidence_score": 40,
        "explanation": "Cloud reasoning (OpenAI / Gemini) was unavailable, so the system used local depreciation-based pricing.",
        "price_factors": ["declared_condition", "age_bucket", "usage_penalty"],
        "warnings": ["Local fallback used."],
    }


def analyze_listing(*, product: ProductListing, seller, image_path: Path | None = None) -> dict[str, Any]:
    summary = _baseline_summary(product)
    prompt = prompt_builder.build_analysis_prompt(product, summary)
    gemini_model = getattr(settings, "GEMINI_MODEL", "gemini-2.0-flash")
    openai_model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    model_name = gemini_model

    parsed: dict[str, Any] | None = None
    raw: dict[str, Any] = {}
    latency = 0
    cloud_text: str | None = None
    success = True
    err_msg = ""
    used_openai = False

    img = image_path
    if img is None:
        prim = product.images.filter(is_primary=True).first() or product.images.first()
        if prim and prim.image:
            img = Path(prim.image.path)

    if getattr(settings, "USE_OPENAI_AI", False) and (getattr(settings, "OPENAI_API_KEY", "") or ""):
        cloud_text, raw, latency = openai_service.generate_content(prompt, img, model=openai_model)
        if cloud_text:
            parsed = response_parser.parse_gemini_json(cloud_text)
            if parsed is not None:
                used_openai = True
                model_name = f"openai:{openai_model}"

    if parsed is None and getattr(settings, "USE_GEMINI_AI", True) and (settings.GEMINI_API_KEY or ""):
        cloud_text, raw, latency = gemini_service.generate_content(prompt, img, model=gemini_model)
        if cloud_text:
            parsed = response_parser.parse_gemini_json(cloud_text)
            if parsed is not None:
                model_name = gemini_model

    if parsed is None:
        success = False
        err_msg = "Cloud AI failed or returned invalid JSON; using fallback."
        parsed = _fallback(product)

    rec = AIAnalysisResult.objects.create(
        seller=seller,
        product=product,
        input_title=product.title,
        input_description=product.description,
        input_category=product.category.name if product.category else "",
        input_brand=product.brand,
        input_model_name=product.model_name,
        input_original_price=product.original_price,
        input_age_months=product.product_age_months,
        input_usage_duration_months=product.usage_duration_months,
        input_user_condition=product.user_declared_condition,
        image_used=None,
        gemini_model_name=model_name if success else "",
        gemini_prompt=prompt[:50000],
        gemini_raw_response=raw if isinstance(raw, dict) else {"raw": str(raw)[:2000]},
        predicted_condition_label=parsed["condition_label"],
        predicted_condition_score=parsed["condition_score"],
        suggested_price_min=parsed["suggested_price_min"],
        suggested_price_avg=parsed["suggested_price_avg"],
        suggested_price_max=parsed["suggested_price_max"],
        explanation=parsed["explanation"],
        confidence_score=parsed["confidence_score"],
        warnings=parsed.get("warnings"),
        latency_ms=latency or None,
        success=success,
        error_message=err_msg or None,
    )

    lbl = str(parsed["condition_label"])
    allowed = {c.value for c in ProductListing.AICondition}
    product.ai_condition_label = lbl if lbl in allowed else ProductListing.AICondition.UNKNOWN
    product.ai_condition_score = parsed["condition_score"]
    product.ai_suggested_price_min = parsed["suggested_price_min"]
    product.ai_suggested_price_avg = parsed["suggested_price_avg"]
    product.ai_suggested_price_max = parsed["suggested_price_max"]
    product.ai_price_explanation = parsed["explanation"]
    product.ai_confidence_score = parsed["confidence_score"]
    product.ai_warnings = parsed.get("warnings")
    product.is_ai_evaluated = True
    product.ai_evaluated_at = timezone.now()
    product.save()

    return {
        "condition_label": parsed["condition_label"],
        "condition_score": parsed["condition_score"],
        "suggested_price_min": float(parsed["suggested_price_min"]),
        "suggested_price_avg": float(parsed["suggested_price_avg"]),
        "suggested_price_max": float(parsed["suggested_price_max"]),
        "confidence_score": parsed["confidence_score"],
        "explanation": parsed["explanation"],
        "warnings": parsed.get("warnings", []),
        "latency_ms": latency,
        "analysis_id": rec.id,
        "used_openai": used_openai,
        "used_gemini": success and bool(cloud_text) and not used_openai,
        "used_cloud_ai": success and bool(cloud_text),
    }
