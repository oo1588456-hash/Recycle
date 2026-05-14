# ReCycle AI engine

## Overview

Listing evaluation is driven by **Google Gemini** (vision + text) from the Django backend only. The Flutter app never sees `GEMINI_API_KEY`. If Gemini is disabled, the key is missing, or the response is invalid, a **local depreciation fallback** produces GBP min/avg/max prices (using `DEFAULT_CURRENCY`) and a fixed explanation string.

## Gemini integration

- **Service:** `apps/ai_engine/services/gemini_service.py` — REST `generateContent` with optional primary/first listing image.
- **Prompt:** `prompt_builder.build_analysis_prompt` — strict JSON contract, marketplace currency from `DEFAULT_CURRENCY`, second-hand marketplace context.
- **Parsing:** `response_parser.parse_gemini_json` — strips markdown fences, validates fields, clamps scores, ensures positive prices.
- **Orchestration:** `price_analysis_service.analyze_listing` — loads `data/price_baseline.csv` snippet for similar rows, calls Gemini, persists `AIAnalysisResult`, updates `ProductListing` AI fields.

## JSON response format (model output)

Expected keys (aligned with parser):

- `condition_label`: `excellent` | `good` | `fair` | `poor`
- `condition_score`: 0–100
- `suggested_price_min` / `suggested_price_avg` / `suggested_price_max`: numbers in the listing currency with `min < avg < max`
- `currency`: typically `GBP` (see `DEFAULT_CURRENCY` in settings)
- `confidence_score`: 0–100
- `explanation`: human-readable rationale for buyers and sellers
- `price_factors`: string array (optional)
- `warnings`: string array (optional)

## Fallback price engine

When Gemini cannot be used:

- **Condition factor** from seller-declared condition: excellent 0.85, good 0.70, fair 0.50, poor 0.30.
- **Age factor** by bucket (0–6, 7–12, 13–24, 25–36, 36+ months).
- **Usage penalty** capped on `usage_duration_months`.
- **Average:** `original_price * condition_factor * age_factor * (1 - usage_penalty)` (floored to a small positive value).
- **Range:** `min = avg * 0.85`, `max = avg * 1.15`.
- **Explanation:** *"Gemini was unavailable, so the system used local depreciation-based pricing."*

## Dataset baseline usage

- `scripts/build_price_baseline.py` builds `backend/data/price_baseline.csv` from optional external datasets under `DATASETS_DIR`.
- `scripts/scan_datasets.py` writes `docs/DATASETS_REPORT.md` and `data/dataset_summary.json`.
- Baseline text is **non-blocking**: missing files yield a short prompt note; the app still runs.

## Limitations

- Gemini quality depends on prompt adherence and image quality.
- Baseline matching is token overlap on a CSV sample, not a full market engine.
- No on-device TFLite model in v1.

## Future work

- On-device **TFLite** classifiers for category/condition to combine with Gemini scores.
- Embedding index for “similar sold items” and richer comparables.
- Fine-tuned small models on marketplace data where licensing allows.
