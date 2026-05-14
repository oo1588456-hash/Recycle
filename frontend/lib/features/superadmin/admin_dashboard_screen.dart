import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';

final adminStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/admin/dashboard/stats/');
  return r.data as Map<String, dynamic>;
});

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(adminStatsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Admin dashboard')),
      body: async.when(
        data: (s) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _tile(context, 'Buyers', s['total_buyers']),
            _tile(context, 'Sellers', s['total_sellers']),
            _tile(context, 'Products', s['total_products']),
            _tile(context, 'Active listings', s['active_products']),
            _tile(context, 'Sold listings', s['sold_products']),
            _tile(context, 'Orders', s['total_orders']),
            _tile(context, 'Pending orders', s['pending_orders']),
            _tile(context, 'AI analyses', s['total_ai_analyses']),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }

  Widget _tile(BuildContext context, String label, Object? value) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(value?.toString() ?? '—', style: Theme.of(context).textTheme.titleMedium),
      ),
    );
  }
}
