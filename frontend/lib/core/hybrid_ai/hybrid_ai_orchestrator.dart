import 'package:dio/dio.dart';

import 'connectivity_probe.dart';
import 'local_pricing_fallback.dart';
import 'tflite_condition_service.dart';

/// Thesis Ch.3.3 — try cloud (Django vision + LLM), else local TFLite + depreciation fallback.
class HybridAiOrchestrator {
  static Future<Map<String, dynamic>> runSellerAnalyze({
    required Dio dio,
    required int productId,
    required double originalPrice,
    required String declaredCondition,
    required int ageMonths,
    required int usageMonths,
    String? imagePath,
    String currency = 'GBP',
  }) async {
    final online = await shouldAttemptCloud();
    if (online) {
      try {
        final r = await dio.post<Map<String, dynamic>>('/seller/products/$productId/analyze-with-ai/');
        final data = Map<String, dynamic>.from(r.data ?? {});
        data['hybrid_path'] = 'cloud_django';
        return data;
      } on DioException {
        // fall through to local / hybrid edge
      }
    }

    TfliteConditionScore? vision;
    try {
      vision = await TfliteConditionService.score(imagePath);
    } catch (_) {
      vision = null;
    }

    final local = LocalPricingFallback.build(
      originalPrice: originalPrice,
      declaredCondition: declaredCondition,
      ageMonths: ageMonths,
      usageMonths: usageMonths,
      tfliteLabel: vision?.label,
      tfliteConditionScore: vision?.conditionScore,
      currency: currency,
    );
    local['hybrid_path'] = vision != null ? 'edge_tflite_plus_local_pricing' : 'local_pricing_only';
    return local;
  }
}
