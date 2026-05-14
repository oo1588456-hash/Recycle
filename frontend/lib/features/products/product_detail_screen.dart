import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../shared/models/models.dart';
import '../auth/auth_state.dart';
import '../chat/chat_list_screen.dart';

final productDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/products/$id/');
  return r.data as Map<String, dynamic>;
});

class ProductDetailScreen extends ConsumerWidget {
  const ProductDetailScreen({super.key, required this.productId});
  final int productId;

  int? _sellerId(Map<String, dynamic> j) {
    final s = j['seller'];
    if (s is Map<String, dynamic>) return s['id'] as int?;
    if (s is int) return s;
    return null;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(productDetailProvider(productId));
    return Scaffold(
      appBar: AppBar(title: const Text('Listing')),
      body: async.when(
        data: (j) {
          final media = mediaBaseUrl();
          final p = ProductModel.fromJson(j, mediaBase: media);
          final user = ref.watch(authStateProvider).valueOrNull;
          final sellerId = _sellerId(j);
          final isOwner = user != null && sellerId == user.id;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (p.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(p.imageUrl!, height: 220, width: double.infinity, fit: BoxFit.cover),
                ),
              const SizedBox(height: 12),
              Text(p.title, style: Theme.of(context).textTheme.headlineSmall),
              Text('${p.currency} ${p.finalPrice}', style: Theme.of(context).textTheme.titleLarge),
              if (p.aiConditionLabel != null) Text('AI condition: ${p.aiConditionLabel}'),
              if (j['ai_price_explanation'] != null && (j['ai_price_explanation'] as String).isNotEmpty)
                Card(
                  color: Colors.green.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('AI pricing insight', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text(j['ai_price_explanation'] as String),
                      ],
                    ),
                  ),
                ),
              if (p.location != null) Text('Location: ${p.location}'),
              const Divider(),
              Text(j['description'] as String? ?? ''),
              const SizedBox(height: 16),
              if (user?.role == 'buyer' && !isOwner) ...[
                FilledButton.icon(
                  onPressed: () async {
                    try {
                      await ref.read(dioProvider).post('/cart/items/', data: {'product_id': productId, 'quantity': 1});
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart')));
                      }
                    } on DioException catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.response?.data?.toString() ?? e.message ?? 'Error')),
                        );
                      }
                    }
                  },
                  icon: const Icon(Icons.shopping_cart_outlined),
                  label: const Text('Add to cart'),
                ),
                const SizedBox(height: 8),
              ],
              if (user != null && sellerId != null && !isOwner)
                OutlinedButton.icon(
                  onPressed: () {
                    final label = p.sellerName ?? 'Seller';
                    Navigator.of(context).push<void>(
                      MaterialPageRoute<void>(
                        builder: (_) => ChatDetailScreen(peerId: sellerId, productId: productId, peerLabel: label),
                      ),
                    );
                  },
                  icon: const Icon(Icons.chat),
                  label: const Text('Message seller'),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
