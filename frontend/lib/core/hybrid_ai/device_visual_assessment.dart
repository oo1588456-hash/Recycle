import 'tflite_condition_service.dart';

/// Resolves thesis Ch.3.4 "Eye" output: real TFLite when the asset exists, else declared-condition heuristic.
class DeviceVisualAssessment {
  const DeviceVisualAssessment({
    required this.label,
    required this.score,
    required this.modelNote,
  });

  final String label;
  final int score;
  final String modelNote;

  static Future<DeviceVisualAssessment> resolve({
    required String declaredCondition,
    String? imagePath,
  }) async {
    try {
      final t = await TfliteConditionService.score(imagePath);
      if (t != null) {
        return DeviceVisualAssessment(
          label: t.label,
          score: t.conditionScore.round().clamp(0, 100),
          modelNote: 'MobileNetV2-style INT8 TFLite (on-device)',
        );
      }
    } catch (_) {}
    return _fromDeclared(declaredCondition);
  }

  static DeviceVisualAssessment _fromDeclared(String raw) {
    final c = raw.toLowerCase().trim();
    switch (c) {
      case 'excellent':
        return const DeviceVisualAssessment(
          label: 'excellent',
          score: 88,
          modelNote: 'Heuristic mapping (bundle condition_mobilenetv2_int8.tflite for CNN)',
        );
      case 'fair':
        return const DeviceVisualAssessment(
          label: 'fair',
          score: 52,
          modelNote: 'Heuristic mapping (bundle TFLite asset for CNN)',
        );
      case 'poor':
        return const DeviceVisualAssessment(
          label: 'poor',
          score: 28,
          modelNote: 'Heuristic mapping (bundle TFLite asset for CNN)',
        );
      case 'good':
      default:
        return const DeviceVisualAssessment(
          label: 'good',
          score: 65,
          modelNote: 'Heuristic mapping (bundle TFLite asset for CNN)',
        );
    }
  }
}
