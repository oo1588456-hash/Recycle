# Hatim thesis (21573510) vs this repository — alignment map

This document maps your dissertation text to **what is implemented in GitHub today**. It is the authoritative “honesty layer” for supervisors and examiners: **what matches**, **what is approximated**, and **what is not yet built**.

## Executive summary

| Thesis claim | Repository status |
|--------------|-------------------|
| Flutter cross‑platform client | **Yes** — `frontend/` |
| Hybrid AI (edge vision + cloud reasoning) | **Partial** — **Online:** Django runs **vision + LLM** on the **uploaded** listing image (same outcome as “cloud brain”, different data path than the thesis figure where the phone sends a **pre-computed TFLite score**). **Offline / server error:** Flutter runs **optional TFLite** on the local gallery image, then **local depreciation** pricing (see `HybridAiOrchestrator`). |
| Firebase / Firestore / Cloud Functions | **Not the primary stack** — persistence and auth are **Django + SQLite** (dev). See `docs/FIREBASE_MIGRATION.md` for how to move toward the thesis stack. |
| FastAPI gateway | **Optional dev component** — `gateway/` is a small FastAPI service that can proxy OpenAI keys (thesis “hide keys from client” pattern). Production still uses Django as the main API. |
| OpenAI GPT‑4o JSON reasoning | **Supported on server** — set `OPENAI_API_KEY` (+ model env). Flutter does **not** call OpenAI directly (keys stay off the device). |
| Tables 4–5 / SUS 86 / 83.4% / MAE $4.50 etc. | **Not auto‑reproduced by this repo** — those numbers require **your** experiments, datasets, and devices. The code provides **hooks** and **evaluation placeholders**; it does not hard‑code empirical thesis results. |

## Chapter-by-chapter (abridged)

### Abstract & Ch.1–2 (problem, hybrid paradigm)

- **Aligned:** second‑hand marketplace, AI‑assisted pricing/condition, multimodal use of **image + metadata** (image via Django upload + vision model on server; metadata in prompts).
- **Partial:** “edge” vision in the strict thesis sense (MobileNetV2 INT8 on phone) is **optional** until you add the TFLite asset and wire outputs into the UI path you prefer.

### Ch.3 System design (Firebase, FastAPI, latency‑first gate)

- **Firebase / Firestore:** described in thesis as primary — **not** implemented as primary here. **Django** is the source of truth for listings, auth (JWT), and AI audit rows.
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

> “The submitted codebase implements the **same hybrid decision pattern** and **cloud GPT‑style reasoning with server‑held keys**; the thesis also describes **Firebase and on‑device TFLite** as the target production shape — those are **partially scaffolded** (`gateway/`, TFLite asset hook, migration doc) while the **working prototype** runs on **Django + Flutter**.”

## Appendix A

GitHub: `https://github.com/oo1588456-hash/Recycle` (per thesis Appendix A).
