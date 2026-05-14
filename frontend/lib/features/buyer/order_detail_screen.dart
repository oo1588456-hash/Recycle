import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../auth/auth_state.dart';

enum OrderDetailMode { buyer, seller, admin }

class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId, this.mode = OrderDetailMode.buyer});

  final int orderId;
  final OrderDetailMode mode;

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  Map<String, dynamic>? _order;
  var _loading = true;
  String? _err;

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _err = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final r = await dio.get('/orders/${widget.orderId}/');
      setState(() => _order = r.data as Map<String, dynamic>);
    } catch (e) {
      setState(() => _err = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _patchStatus(String status) async {
    final dio = ref.read(dioProvider);
    if (widget.mode == OrderDetailMode.seller) {
      await dio.patch('/seller/orders/${widget.orderId}/status/', data: {'status': status});
    } else if (widget.mode == OrderDetailMode.admin) {
      await dio.patch('/admin/orders/${widget.orderId}/status/', data: {'status': status});
    }
    await _load();
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  static const _statuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _err != null
              ? Center(child: Text(_err!))
              : _buildBody(),
    );
  }

  Widget _buildBody() {
    final o = _order!;
    final items = (o['items'] as List<dynamic>?) ?? const [];
    final uid = ref.watch(authStateProvider).valueOrNull?.id;
    final sellerId = o['seller'];
    final canUpdate = widget.mode == OrderDetailMode.admin ||
        (widget.mode == OrderDetailMode.seller && uid == sellerId);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(o['order_number']?.toString() ?? '', style: Theme.of(context).textTheme.titleLarge),
        Text('Status: ${o['status']}'),
        Text('Total: ${o['currency']} ${o['total_amount']}'),
        Text('Payment: ${o['payment_method']} / ${o['payment_status']}'),
        Text('Ship to: ${o['shipping_address']}'),
        Text('Phone: ${o['buyer_phone']}'),
        if ((o['notes'] as String?)?.isNotEmpty == true) Text('Notes: ${o['notes']}'),
        const Divider(),
        const Text('Items', style: TextStyle(fontWeight: FontWeight.bold)),
        ...items.map((raw) {
          final it = raw as Map<String, dynamic>;
          return ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text('Product #${it['product']}'),
            subtitle: Text('${o['currency']} ${it['price']} × ${it['quantity']}'),
          );
        }),
        if (canUpdate) ...[
          const SizedBox(height: 16),
          const Text('Update status', style: TextStyle(fontWeight: FontWeight.bold)),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _statuses
                .map(
                  (s) => ActionChip(
                    label: Text(s),
                    onPressed: () async {
                      try {
                        await _patchStatus(s);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Set to $s')));
                        }
                      } on DioException catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                        }
                      }
                    },
                  ),
                )
                .toList(),
          ),
        ],
      ],
    );
  }
}
