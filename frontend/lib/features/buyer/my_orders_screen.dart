import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../auth/auth_state.dart';
import 'order_detail_screen.dart';

final myOrdersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/orders/my-orders/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

class MyOrdersScreen extends ConsumerWidget {
  const MyOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('My orders')),
        body: const Center(child: Text('Sign in to view orders.')),
      );
    }
    if (user.role != 'buyer') {
      return Scaffold(
        appBar: AppBar(title: const Text('My orders')),
        body: const Center(child: Text('Buyer orders appear here.')),
      );
    }
    final async = ref.watch(myOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My orders')),
      body: async.when(
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No orders yet.'));
          return ListView.builder(
            itemCount: rows.length,
            itemBuilder: (_, i) {
              final o = rows[i];
              return ListTile(
                title: Text(o['order_number']?.toString() ?? 'Order'),
                subtitle: Text('${o['currency']} ${o['total_amount']} · ${o['status']}'),
                onTap: () => Navigator.of(context).push<void>(
                  MaterialPageRoute<void>(
                    builder: (_) => OrderDetailScreen(orderId: o['id'] as int, mode: OrderDetailMode.buyer),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
