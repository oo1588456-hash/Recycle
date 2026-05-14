# On-device condition model (thesis Ch.3.4–4.4)

Place your exported TensorFlow Lite file here:

**Filename:** `condition_mobilenetv2_int8.tflite`

The Flutter loader (`lib/core/hybrid_ai/tflite_condition_service.dart`) expects:

- Input tensor shape **`[1, H, W, 3]`** with **float32** in **\[0, 1\]** (RGB `/255`).
- Output tensor shape **`[1, 4]`** with **float32** (softmax over):  
  `excellent`, `good`, `fair`, `poor` **in that order**.

Until this file exists, offline “Eye” scoring falls back to **declared condition heuristics** (see `docs/HATIM_THESIS_VS_REPOSITORY.md`).

Training notes: `backend/ml/README.md`.
