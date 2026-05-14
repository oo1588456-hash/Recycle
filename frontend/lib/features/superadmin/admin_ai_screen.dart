import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';

final adminAiProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/admin/ai-analyses/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

final adminDatasetReportProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/admin/dataset-report/');
  return r.data as Map<String, dynamic>;
});

class AdminAiScreen extends ConsumerWidget {
  const AdminAiScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyses = ref.watch(adminAiProvider);
    final report = ref.watch(adminDatasetReportProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('AI & datasets')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text('Dataset report', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          report.when(
            data: (m) => Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Text(m.toString()),
              ),
            ),
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('$e'),
          ),
          const SizedBox(height: 16),
          const Text('Recent AI analyses', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          analyses.when(
            data: (rows) {
              if (rows.isEmpty) return const Text('No records.');
              return Column(
                children: rows.take(30).map((r) {
                  return Card(
                    child: ListTile(
                      title: Text(r['input_title']?.toString() ?? 'Analysis'),
                      subtitle: Text(
                        'PKR ${r['suggested_price_avg']} · ${r['predicted_condition_label']} · success=${r['success']}',
                      ),
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
            error: (e, _) => Text('$e'),
          ),
        ],
      ),
    );
  }
}
