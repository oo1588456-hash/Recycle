# ReCycle AI engine

## Overview

Listing evaluation uses **cloud multimodal JSON** from the Django backend only (keys never ship to Flutter or the browser). The stack matches the dissertation’s “GPT-style cloud reasoning” path while staying pragmatic on hosting:

1. **OpenAI** (optional): Chat Completions with `response_format: json_object` and optional vision (`gpt-4o`, `gpt-4o-mini`, etc.) when `OPENAI_API_KEY` is set. Implemented in `apps/ai_engine/services/openai_service.py`.
2. **Google Gemini** (optional): REST `generateContent` when `GEMINI_API_KEY` is set and OpenAI did not return valid JSON. See `gemini_service.py`.
3. **Local depreciation fallback** if both are disabled, keys are missing, or the response is invalid.

Priority: **OpenAI first** (when enabled and keyed), then **Gemini**, then fallback. Configure with `USE_OPENAI_AI`, `USE_GEMINI_AI`, and keys in `.env`.

The Flutter app never sees provider API keys.

## Prompt, parsing, orchestration

- **Prompt:** `prompt_builder.build_analysis_prompt` — strict JSON contract, marketplace currency from `DEFAULT_CURRENCY`, second-hand marketplace context.
- **Parsing:** `response_parser.parse_gemini_json` — strips markdown fences, validates fields, clamps scores, ensures positive prices (same schema for OpenAI and Gemini outputs).
- **Orchestration:** `price_analysis_service.analyze_listing` — loads `data/price_baseline.csv` snippet for similar rows, calls OpenAI and/or Gemini, persists `AIAnalysisResult`, updates `ProductListing` AI fields. The `gemini_model_name` column stores either a Gemini model id or a trace string such as `openai:gpt-4o-mini`.

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

When cloud models cannot be used:

- **Condition factor** from seller-declared condition: excellent 0.85, good 0.70, fair 0.50, poor 0.30.
- **Age factor** by bucket (0–6, 7–12, 13–24, 25–36, 36+ months).
- **Usage penalty** capped on `usage_duration_months`.
- **Average:** `original_price * condition_factor * age_factor * (1 - usage_penalty)` (floored to a small positive value).
- **Range:** `min = avg * 0.85`, `max = avg * 1.15`.
- **Explanation:** notes that cloud reasoning was unavailable and local depreciation-based pricing was used.

## Dataset baseline usage

- `scripts/build_price_baseline.py` builds `backend/data/price_baseline.csv` from optional external datasets under `DATASETS_DIR`.
- `scripts/scan_datasets.py` writes `docs/DATASETS_REPORT.md` and `data/dataset_summary.json`.
- Baseline text is **non-blocking**: missing files yield a short prompt note; the app still runs.

## Limitations

- Cloud model quality depends on prompt adherence and image quality.
- Baseline matching is token overlap on a CSV sample, not a full market engine.
- **No on-device TFLite model in v1** (thesis may describe this as a future or parallel track).

## Future work

- On-device **TFLite** classifiers for category/condition to combine with cloud scores.
- Embedding index for “similar sold items” and richer comparables.
- Fine-tuned small models on marketplace data where licensing allows.
