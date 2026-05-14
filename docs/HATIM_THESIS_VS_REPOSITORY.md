# Hatim thesis (21573510) vs this repository — alignment map

This document maps your dissertation text to **what is implemented in GitHub today**. It is the authoritative “honesty layer” for supervisors and examiners: **what matches**, **what is approximated**, and **what is not yet built**.

## Executive summary

| Thesis claim | Repository status |
|--------------|-------------------|
| Flutter cross‑platform client | **Yes** — `frontend/` |
| Hybrid AI (edge vision + cloud reasoning) | **Implemented (online):** Flutter resolves **device “Eye”** (TFLite asset when present, else declared-condition heuristic), then calls Django **`POST …/analyze-with-device-visual/`** so OpenAI/Gemini receive **text + scores only** (no raw pixels to the LLM), matching Ch.3.3–3.5. **Offline / server error:** same edge stack + **local depreciation** fallback. Legacy `analyze-with-ai` (server vision on stored image) remains for admin/testing. |
| Firebase / Firestore / Cloud Functions | **Scaffolded + partial runtime:** `firebase.json`, `firestore.rules`, `functions/` (Callable OpenAI proxy), Flutter optional **`FirebaseBootstrap`** + **`cached_ai_results`** writes. **Primary** marketplace persistence remains **Django + SQLite** until you finish migration (`docs/FIREBASE_MIGRATION.md`). |
| FastAPI gateway | **Optional dev component** — `gateway/` is a small FastAPI service that can proxy OpenAI keys (thesis “hide keys from client” pattern). Production still uses Django as the main API. |
| OpenAI GPT‑4o JSON reasoning | **Supported on server** — set `OPENAI_API_KEY` (+ model env). Flutter does **not** call OpenAI directly (keys stay off the device). |
| Tables 4–5 / SUS 86 / 83.4% / MAE $4.50 etc. | **Not auto‑reproduced by this repo** — those numbers require **your** experiments, datasets, and devices. The code provides **hooks** and **evaluation placeholders**; it does not hard‑code empirical thesis results. |

## Chapter-by-chapter (abridged)

### Abstract & Ch.1–2 (problem, hybrid paradigm)

- **Aligned:** second‑hand marketplace, AI‑assisted pricing/condition, multimodal use of **image + metadata** (image via Django upload + vision model on server; metadata in prompts).
- **Partial:** “edge” vision in the strict thesis sense (MobileNetV2 INT8 on phone) is **optional** until you add the TFLite asset and wire outputs into the UI path you prefer.

### Ch.3 System design (Firebase, FastAPI, latency‑first gate)

- **Firebase / Firestore / Functions:** thesis-primary storage — **Django** still owns listings/users in this repo, but **Firebase artifacts exist** (rules, Callable `chatJson`, Flutter Firestore AI cache) so the architecture in the report is **implemented as code**, not only prose.
- **Latency‑first gate:** implemented in Flutter as **`HybridAiOrchestrator`** (`frontend/lib/core/hybrid_ai/`): reachability probe → try Django `analyze-with-ai` → on failure or offline, **local fallback** map (mirrors server depreciation fallback conceptually).
- **FastAPI:** provided as **`gateway/`** for OpenAI proxy experiments; not required to run the Flutter app against Django.

### Ch.4 Implementation (TFLite training, Flutter integration)

- **Training / export:** see **`backend/ml/README.md`** and optional scripts (TensorFlow not in default `requirements.txt` to keep the backend lightweight).
- **Flutter integration:** `TfliteConditionService` attempts `assets/models/condition_mobilenetv2_int8.tflite`; until present, the app uses **declared condition → heuristic visual score** offline only as a **placeholder for the “Eye”** module.

### Ch.5 Evaluation (latency, MAE, SUS)

- **Not embedded in code:** evaluation is **methodology in the thesis**, not constants in software. Use Flutter DevTools / backend logs / your own scripts to regenerate metrics on this stack. Do **not** imply the GitHub clone alone reproduces Table 4–5 without your run.

### Ch.6 Conclusion / future work

- **Aligned as roadmap:** P2P payments, larger CNN taxonomy, predictive connectivity — still future work; some items are noted in root `README.md`.

## What you should tell the examiner (one sentence)

> “The submitted codebase implements the **latency-first hybrid pattern** (on-device visual scores, then **text-only** cloud GPT reasoning), **server-held OpenAI keys**, **Firebase rules + Callable Functions + Firestore AI cache scaffolding**, and an optional **FastAPI** gateway — while **listing persistence** for the working demo still uses **Django + SQLite** until Firebase migration is completed.”

## Appendix A

GitHub: `https://github.com/oo1588456-hash/Recycle` (per thesis Appendix A).
