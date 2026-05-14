import 'dart:io';

import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';

/// Thesis "Eye" module — optional MobileNetV2 INT8 TFLite on device.
class TfliteConditionScore {
  TfliteConditionScore({required this.label, required this.conditionScore, required this.probs});
  final String label;
  final double conditionScore;
  final List<double> probs;
}

class TfliteConditionService {
  static const _asset = 'assets/models/condition_mobilenetv2_int8.tflite';
  static const _labels = ['excellent', 'good', 'fair', 'poor'];

  static Interpreter? _interpreter;

  static Future<void> dispose() async {
    _interpreter?.close();
    _interpreter = null;
  }

  /// Returns null if model is missing or inference fails.
  static Future<TfliteConditionScore?> score(String? imagePath) async {
    if (imagePath == null || imagePath.isEmpty) return null;
    final file = File(imagePath);
    if (!file.existsSync()) return null;

    try {
      _interpreter ??= await Interpreter.fromAsset(_asset);
    } catch (_) {
      return null;
    }

    final interpreter = _interpreter!;
    final inTensor = interpreter.getInputTensor(0);
    final outTensor = interpreter.getOutputTensor(0);
    final shape = inTensor.shape;
    if (shape.length != 4 || shape[3] != 3) return null;

    final batch = shape[0];
    final h = shape[1];
    final w = shape[2];
    if (batch != 1) return null;

    final bytes = await file.readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) return null;
    final resized = img.copyResize(decoded, width: w, height: h, interpolation: img.Interpolation.linear);

    // Nested [1, h, w, 3] float32 in [0,1]
    final input = List.generate(
      1,
      (_) => List.generate(
        h,
        (y) => List.generate(
          w,
          (x) {
            final p = resized.getPixel(x, y);
            return [
              p.r / 255.0,
              p.g / 255.0,
              p.b / 255.0,
            ];
          },
        ),
      ),
    );

    final outShape = outTensor.shape;
    if (outShape.length != 2 || outShape[0] != 1) return null;
    final classes = outShape[1];
    final output = List.generate(1, (_) => List<double>.filled(classes, 0));

    try {
      interpreter.run(input, output);
    } catch (_) {
      return null;
    }

    if (classes < 4) return null;
    final probs = output[0].sublist(0, 4).map((e) => e.isFinite ? e : 0.0).toList();
    var sum = probs.fold<double>(0, (a, b) => a + b);
    if (sum <= 0) return null;
    final norm = probs.map((e) => e / sum).toList();
    var bestI = 0;
    var bestV = norm[0];
    for (var i = 1; i < 4; i++) {
      if (norm[i] > bestV) {
        bestV = norm[i];
        bestI = i;
      }
    }
    final label = _labels[bestI];
    final score = (40 + 55 * bestV + 5 * (norm[(bestI + 1) % 4])).clamp(0, 100).toDouble();
    return TfliteConditionScore(label: label, conditionScore: score, probs: norm);
  }
}
