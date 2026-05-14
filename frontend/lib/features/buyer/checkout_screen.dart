import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _addr = TextEditingController();
  final _phone = TextEditingController();
  final _notes = TextEditingController();
  var _busy = false;
  String? _err;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppTextField(controller: _addr, label: 'Shipping address', maxLines: 2),
          const SizedBox(height: 12),
          AppTextField(controller: _phone, label: 'Phone', keyboardType: TextInputType.phone),
          const SizedBox(height: 12),
          AppTextField(controller: _notes, label: 'Notes (optional)', maxLines: 2),
          if (_err != null) ...[const SizedBox(height: 8), Text(_err!, style: const TextStyle(color: Colors.red))],
          const SizedBox(height: 24),
          AppButton(
            label: 'Place order (COD)',
            loading: _busy,
            onPressed: _busy
                ? null
                : () async {
                    setState(() {
                      _busy = true;
                      _err = null;
                    });
                    try {
                      await ref.read(dioProvider).post('/orders/create-from-cart/', data: {
                        'shipping_address': _addr.text.trim(),
                        'buyer_phone': _phone.text.trim(),
                        'payment_method': 'cash_on_delivery',
                        'notes': _notes.text.trim(),
                      });
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed')));
                        Navigator.of(context).pop();
                      }
                    } on DioException catch (e) {
                      setState(() => _err = e.response?.data?.toString() ?? e.message);
                    } catch (e) {
                      setState(() => _err = e.toString());
                    } finally {
                      if (mounted) setState(() => _busy = false);
                    }
                  },
          ),
        ],
      ),
    );
  }
}
