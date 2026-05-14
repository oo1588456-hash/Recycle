"""Build Gemini prompt for resale evaluation (strict JSON output)."""
from __future__ import annotations

from typing import Any

from django.conf import settings

from apps.products.models import ProductListing


def build_analysis_prompt(product: ProductListing, dataset_baseline_summary: str) -> str:
    p = product
    cur = getattr(settings, "DEFAULT_CURRENCY", "GBP")
    return f"""You are an AI resale product evaluator for a second-hand e-commerce marketplace.

Analyze this used product and suggest a fair resale price range in {cur}.

Product details:
Title: {p.title}
Category: {p.category.name if p.category else ""}
Brand: {p.brand}
Model: {p.model_name}
Original Price: {p.original_price} {cur}
Age: {p.product_age_months or "unknown"} months
Usage Duration: {p.usage_duration_months or "unknown"} months
Seller Declared Condition: {p.user_declared_condition}
Description: {p.description}

Extra specs:
Storage: {p.storage}
RAM: {p.ram}
Battery Health: {p.battery_health}
Screen Condition: {p.screen_condition}
Body Condition: {p.body_condition}
Warranty Status: {p.warranty_status}
Accessories Included: {p.accessories_included}
Box Available: {p.box_available}

Dataset baseline:
{dataset_baseline_summary}

Return only valid JSON with this structure:

{{
  "condition_label": "excellent | good | fair | poor",
  "condition_score": 0,
  "suggested_price_min": 0,
  "suggested_price_avg": 0,
  "suggested_price_max": 0,
  "currency": "{cur}",
  "confidence_score": 0,
  "explanation": "clear explanation for seller and buyer",
  "price_factors": [
    "factor 1",
    "factor 2"
  ],
  "warnings": [
    "warning if any"
  ]
}}

Rules:
- Be realistic for a second-hand marketplace.
- Suggested min must be less than avg.
- Suggested max must be greater than avg.
- Do not overprice heavily damaged products.
- Consider age, usage, brand, original price, condition, accessories, and market baseline.
- If input data is incomplete, mention warnings in warnings array.
- Return JSON only. No markdown.
"""


def build_prompt_dict(product: ProductListing, dataset_baseline_summary: str) -> dict[str, Any]:
    return {"text": build_analysis_prompt(product, dataset_baseline_summary)}
