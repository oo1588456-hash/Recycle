import 'package:dio/dio.dart';

import '../firebase/ai_cache_firestore.dart';
import 'connectivity_probe.dart';
import 'device_visual_assessment.dart';
import 'local_pricing_fallback.dart';
import 'tflite_condition_service.dart';

/// Thesis Ch.3.3 — latency-first: edge "Eye" then cloud "Brain" (text-only to OpenAI/Gemini on server).
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
        final device = await DeviceVisualAssessment.resolve(
          declaredCondition: declaredCondition,
          imagePath: imagePath,
        );
        final r = await dio.post<Map<String, dynamic>>(
          '/seller/products/$productId/analyze-with-device-visual/',
          data: {
            'device_condition_label': device.label,
            'device_condition_score': device.score,
            'device_model_note': device.modelNote,
          },
        );
        final data = Map<String, dynamic>.from(r.data ?? {});
        data['hybrid_path'] = data['hybrid_path'] ?? 'edge_tflite_then_cloud_gpt_text_only';
        await AiCacheFirestore.writeCachedAnalysis(productId: productId, payload: data);
        return data;
      } on DioException {
        // fall through to offline edge stack
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
