import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/loading_view.dart';
import '../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';
import 'product_providers.dart';

class MyProductsScreen extends ConsumerWidget {
  const MyProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(myProductsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My products')),
      body: async.when(
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('No listings yet.'));
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (_, i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: ProductCard(
                product: items[i],
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => ProductDetailScreen(productId: items[i].id)),
                ),
              ),
            ),
          );
        },
        loading: () => const LoadingView(),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
