import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/loading_view.dart';
import '../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';
import 'product_providers.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({super.key});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  final _q = TextEditingController();
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productListProvider(_search));
    return Scaffold(
      appBar: AppBar(title: const Text('ReCycle')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _q,
                    decoration: const InputDecoration(hintText: 'Search listings', prefixIcon: Icon(Icons.search)),
                    onSubmitted: (v) => setState(() => _search = v.trim()),
                  ),
                ),
                IconButton(onPressed: () => setState(() => _search = _q.text.trim()), icon: const Icon(Icons.check)),
              ],
            ),
          ),
          Expanded(
            child: async.when(
              data: (items) => ListView.builder(
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
              ),
              loading: () => const LoadingView(),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
