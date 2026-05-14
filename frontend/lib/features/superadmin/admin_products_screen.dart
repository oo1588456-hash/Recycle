import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../shared/models/models.dart';
import '../auth/auth_state.dart';

final adminProductsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/admin/products/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

class AdminProductsScreen extends ConsumerWidget {
  const AdminProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(adminProductsProvider);
    final media = mediaBaseUrl();
    return Scaffold(
      appBar: AppBar(title: const Text('All products')),
      body: async.when(
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No products.'));
          return RefreshIndicator(
            onRefresh: () => ref.refresh(adminProductsProvider.future),
            child: ListView.builder(
              itemCount: rows.length,
              itemBuilder: (_, i) {
                final j = rows[i];
                final p = ProductModel.fromJson(j, mediaBase: media);
                return ListTile(
                  leading: p.imageUrl != null
                      ? Image.network(p.imageUrl!, width: 48, height: 48, fit: BoxFit.cover)
                      : const Icon(Icons.image_not_supported),
                  title: Text(p.title),
                  subtitle: Text('${p.currency} ${p.finalPrice} · ${j['status']}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) async {
                      final dio = ref.read(dioProvider);
                      try {
                        if (v == 'delete') {
                          await dio.delete('/admin/products/${j['id']}/');
                        } else {
                          await dio.patch('/admin/products/${j['id']}/status/', data: {'status': v});
                        }
                        ref.invalidate(adminProductsProvider);
                      } on DioException catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                        }
                      }
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'active', child: Text('Set active')),
                      PopupMenuItem(value: 'rejected', child: Text('Reject')),
                      PopupMenuItem(value: 'archived', child: Text('Archive')),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
                    ],
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
