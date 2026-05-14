# MobileNetV2 → TFLite (“The Eye” in the thesis)

Your dissertation (Ch.4.3–4.4) describes a **MobileNetV2** classifier exported to **INT8 TFLite** for on‑device condition labels.

This folder holds **documentation and optional scripts**. Default backend `requirements.txt` does **not** include TensorFlow (it is large); use a separate venv if you train here.

## Expected model contract (Flutter client)

The Flutter app looks for:

`frontend/assets/models/condition_mobilenetv2_int8.tflite`

Recommended I/O contract for the sample loader in `TfliteConditionService`:

- **Input:** `[1, 224, 224, 3]` float32, values roughly in **\[0, 1\]** (divide uint8 `/255`).
- **Output:** `[1, 4]` float32 **softmax** over classes in order:  
  `excellent`, `good`, `fair`, `poor`.

If your exported model uses different shapes or normalization, update `frontend/lib/core/hybrid_ai/tflite_condition_service.dart` accordingly.

## Training outline (Keras → TFLite INT8)

1. Curate labelled images (Excellent/Good/Fair/Poor) — thesis references Kaggle‑style consumer electronics / fashion.
2. Train MobileNetV2 head (transfer learning) in Python TensorFlow.
3. Run **post‑training full integer quantization** with a representative dataset.
4. Export `tflite` and copy into `frontend/assets/models/` as above.
5. Re‑run Flutter on a device; offline listing flow can then use true CNN scores when connectivity is down.

Optional: add `train_condition_tflite.py` in this directory when your dataset path is fixed (not committed dataset binaries).
