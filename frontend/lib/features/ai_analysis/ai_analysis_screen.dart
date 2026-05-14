import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
      final r = await dio.post('/seller/products/${widget.productId}/analyze-with-ai/');
      setState(() => _data = r.data as Map<String, dynamic>);
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
                      Text('Score: ${_data!['condition_score']}'),
                      Text('Label: ${_data!['condition_label']}'),
                      Text(
                        'Range: ${_data!['suggested_price_min']} – ${_data!['suggested_price_avg']} – ${_data!['suggested_price_max']} PKR',
                      ),
                      Text(_data!['explanation']?.toString() ?? ''),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _run, child: const Text('Re-analyze')),
                    ],
                  ),
      ),
    );
  }
}
