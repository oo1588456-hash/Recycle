import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/api_config.dart';
import '../../core/hybrid_ai/hybrid_ai_orchestrator.dart';
import '../../core/network/dio_client.dart';

class AiAnalysisScreen extends ConsumerStatefulWidget {
  const AiAnalysisScreen({super.key, required this.productId});
  final int productId;

  @override
  ConsumerState<AiAnalysisScreen> createState() => _AiAnalysisScreenState();
}

class _AiAnalysisScreenState extends ConsumerState<AiAnalysisScreen> {
  Map<String, dynamic>? _data;
  var _busy = false;

  Future<void> _run() async {
    setState(() => _busy = true);
    try {
      final dio = ref.read(dioProvider);
      Map<String, dynamic> meta = {};
      try {
        final g = await dio.get<Map<String, dynamic>>('/seller/products/${widget.productId}/');
        meta = Map<String, dynamic>.from(g.data ?? {});
      } catch (_) {}
      final orig = double.tryParse('${meta['original_price'] ?? 0}') ?? 1;
      final map = await HybridAiOrchestrator.runSellerAnalyze(
        dio: dio,
        productId: widget.productId,
        originalPrice: orig,
        declaredCondition: meta['user_declared_condition']?.toString() ?? 'good',
        ageMonths: int.tryParse('${meta['product_age_months'] ?? 0}') ?? 0,
        usageMonths: int.tryParse('${meta['usage_duration_months'] ?? 0}') ?? 0,
        imagePath: null,
        currency: meta['currency']?.toString() ?? ApiConfig.defaultCurrency,
      );
      setState(() => _data = map);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_run);
  }

  @override
  Widget build(BuildContext context) {
    final cur = ApiConfig.defaultCurrency;
    return Scaffold(
      appBar: AppBar(title: const Text('AI analysis')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _busy
            ? const Center(child: CircularProgressIndicator())
            : _data == null
                ? const Text('No data')
                : ListView(
                    children: [
                      if (_data?['hybrid_path'] != null)
                        Text('Hybrid path: ${_data!['hybrid_path']}', style: Theme.of(context).textTheme.labelSmall),
                      Text('Score: ${_data!['condition_score']}'),
                      Text('Label: ${_data!['condition_label']}'),
                      Text(
                        'Range: ${_data!['suggested_price_min']} – ${_data!['suggested_price_avg']} – ${_data!['suggested_price_max']} $cur',
                      ),
                      Text(_data!['explanation']?.toString() ?? ''),
                      if ((_data!['warnings'] as List?)?.isNotEmpty == true)
                        Text('Warnings: ${_data!['warnings']}', style: TextStyle(color: Colors.orange.shade800)),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _run, child: const Text('Re-analyze')),
                    ],
                  ),
      ),
    );
  }
}
