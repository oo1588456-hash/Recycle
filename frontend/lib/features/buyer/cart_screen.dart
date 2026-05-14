import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../auth/auth_state.dart';
import 'checkout_screen.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  Map<String, dynamic>? _cart;
  var _loading = true;
  String? _err;

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _err = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final r = await dio.get('/cart/');
      setState(() => _cart = r.data as Map<String, dynamic>);
    } catch (e) {
      setState(() => _err = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).valueOrNull;
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cart')),
        body: const Center(child: Text('Sign in as a buyer to use the cart.')),
      );
    }
    if (user.role != 'buyer') {
      return Scaffold(
        appBar: AppBar(title: const Text('Cart')),
        body: const Center(child: Text('Only buyer accounts can use the cart.')),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        actions: [
          if (_cart != null && (_cart!['items'] as List?)?.isNotEmpty == true)
            TextButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                try {
                  await ref.read(dioProvider).delete('/cart/clear/');
                  await _load();
                } on DioException catch (e) {
                  if (!context.mounted) return;
                  messenger.showSnackBar(SnackBar(content: Text('$e')));
                }
              },
              child: const Text('Clear'),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _err != null
              ? Center(child: Text(_err!))
              : _buildList(),
      floatingActionButton: _cart != null && (_cart!['items'] as List).isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () async {
                await Navigator.of(context).push<void>(
                  MaterialPageRoute<void>(builder: (_) => const CheckoutScreen()),
                );
                await _load();
              },
              icon: const Icon(Icons.payment),
              label: const Text('Checkout'),
            )
          : null,
    );
  }

  Widget _buildList() {
    final items = (_cart?['items'] as List<dynamic>?) ?? const [];
    if (items.isEmpty) {
      return const Center(child: Text('Your cart is empty.'));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: items.length,
        itemBuilder: (_, i) {
          final row = items[i] as Map<String, dynamic>;
          final detail = row['product_detail'] as Map<String, dynamic>?;
          final title = detail?['title']?.toString() ?? 'Product #${row['product']}';
          final price = detail?['final_price']?.toString() ?? '';
          final cur = detail?['currency']?.toString() ?? 'PKR';
          return ListTile(
            title: Text(title),
            subtitle: Text('$cur $price'),
            trailing: IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () async {
                try {
                  await ref.read(dioProvider).delete('/cart/items/${row['id']}/');
                  await _load();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                  }
                }
              },
            ),
          );
        },
      ),
    );
  }
}
