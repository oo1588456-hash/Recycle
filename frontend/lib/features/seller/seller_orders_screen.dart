import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../buyer/order_detail_screen.dart';

final sellerOrdersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/seller/orders/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

class SellerOrdersScreen extends ConsumerWidget {
  const SellerOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(sellerOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Sales orders')),
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
                    builder: (_) => OrderDetailScreen(orderId: o['id'] as int, mode: OrderDetailMode.seller),
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
