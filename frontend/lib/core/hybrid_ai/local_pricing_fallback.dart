import 'dart:math' as math;

/// Local depreciation fallback aligned with Django `price_analysis_service._fallback`
/// (thesis offline path when cloud / server is unavailable).
class LocalPricingFallback {
  static Map<String, dynamic> build({
    required double originalPrice,
    required String declaredCondition,
    required int ageMonths,
    required int usageMonths,
    String? tfliteLabel,
    double? tfliteConditionScore,
    String currency = 'GBP',
  }) {
    final rawCond = declaredCondition.toLowerCase();
    final condForMath = (tfliteLabel != null && const {'excellent', 'good', 'fair', 'poor'}.contains(tfliteLabel))
        ? tfliteLabel
        : rawCond;
    final cf = switch (condForMath) {
      'excellent' => 0.85,
      'good' => 0.70,
      'fair' => 0.50,
      'poor' => 0.30,
      _ => 0.70,
    };

    final age = ageMonths;
    final af = age <= 6
        ? 0.95
        : age <= 12
            ? 0.85
            : age <= 24
                ? 0.70
                : age <= 36
                    ? 0.55
                    : 0.40;

    final usage = usageMonths.toDouble();
    final usagePenalty = math.min(0.15, usage * 0.002);

    var avg = originalPrice * cf * af * (1 - usagePenalty);
    if (avg < 1) avg = 1;
    final mn = (avg * 0.85);
    final mx = (avg * 1.15);

    var label = rawCond;
    if (!const {'excellent', 'good', 'fair', 'poor'}.contains(label)) {
      label = 'good';
    }

    var score = 65;
    if (tfliteConditionScore != null) {
      score = tfliteConditionScore.round().clamp(0, 100);
    }
    if (tfliteLabel != null && const {'excellent', 'good', 'fair', 'poor'}.contains(tfliteLabel)) {
      label = tfliteLabel;
    }

    return {
      'condition_label': label,
      'condition_score': score,
      'suggested_price_min': _round2(mn),
      'suggested_price_avg': _round2(avg),
      'suggested_price_max': _round2(mx),
      'confidence_score': 40,
      'explanation':
          'Device is offline or the server could not be reached. This estimate uses the same '
          'local depreciation rules as the Django fallback (thesis offline path). '
          'Add `assets/models/condition_mobilenetv2_int8.tflite` for true on-device vision.',
      'warnings': [
        'Offline / local fallback — not cloud GPT reasoning.',
      ],
      'latency_ms': 0,
      'used_openai': false,
      'used_gemini': false,
      'used_cloud_ai': false,
      'analysis_id': null,
      'currency': currency,
    };
  }

  static double _round2(double v) => (v * 100).round() / 100;
}
