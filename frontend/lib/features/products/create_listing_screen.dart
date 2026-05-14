import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/network/dio_client.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';
import '../products/product_providers.dart';

class CreateListingScreen extends ConsumerStatefulWidget {
  const CreateListingScreen({super.key});

  @override
  ConsumerState<CreateListingScreen> createState() => _CreateListingScreenState();
}

class _CreateListingScreenState extends ConsumerState<CreateListingScreen> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _brand = TextEditingController();
  final _model = TextEditingController();
  final _orig = TextEditingController(text: '50000');
  final _age = TextEditingController(text: '12');
  final _usage = TextEditingController(text: '8');
  final _loc = TextEditingController();
  final _customFinalPrice = TextEditingController();
  String _cond = 'good';
  int? _categoryId;
  XFile? _image;
  Map<String, dynamic>? _ai;
  var _busy = false;
  int? _productId;

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _brand.dispose();
    _model.dispose();
    _orig.dispose();
    _age.dispose();
    _usage.dispose();
    _loc.dispose();
    _customFinalPrice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cats = ref.watch(categoriesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('New listing')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppTextField(controller: _title, label: 'Title'),
          AppTextField(controller: _desc, label: 'Description', maxLines: 3),
          AppTextField(controller: _brand, label: 'Brand'),
          AppTextField(controller: _model, label: 'Model'),
          AppTextField(controller: _orig, label: 'Original price', keyboardType: TextInputType.number),
          AppTextField(controller: _age, label: 'Age (months)', keyboardType: TextInputType.number),
          AppTextField(controller: _usage, label: 'Usage (months)', keyboardType: TextInputType.number),
          AppTextField(controller: _loc, label: 'Location'),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _cond,
            decoration: const InputDecoration(labelText: 'Declared condition'),
            items: const [
              DropdownMenuItem(value: 'excellent', child: Text('Excellent')),
              DropdownMenuItem(value: 'good', child: Text('Good')),
              DropdownMenuItem(value: 'fair', child: Text('Fair')),
              DropdownMenuItem(value: 'poor', child: Text('Poor')),
            ],
            onChanged: (v) => setState(() => _cond = v ?? 'good'),
          ),
          const SizedBox(height: 8),
          cats.when(
            data: (list) => DropdownButtonFormField<int>(
              value: _categoryId,
              hint: const Text('Category'),
              items: list.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
              onChanged: (v) => setState(() => _categoryId = v),
            ),
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('$e'),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () async {
                  final p = ImagePicker();
                  final f = await p.pickImage(source: ImageSource.gallery);
                  if (f != null) setState(() => _image = f);
                },
                icon: const Icon(Icons.photo),
                label: const Text('Pick image'),
              ),
              const SizedBox(width: 12),
              if (_image != null) const Text('Image selected'),
            ],
          ),
          if (_ai != null) ...[
            const Divider(),
            Text('AI score: ${_ai!['condition_score']} (${_ai!['condition_label']})'),
            Text(
              'Suggested: ${_ai!['suggested_price_min']} – ${_ai!['suggested_price_avg']} – ${_ai!['suggested_price_max']} PKR',
            ),
            if ((_ai!['warnings'] as List?)?.isNotEmpty == true)
              Text('Warnings: ${_ai!['warnings']}', style: TextStyle(color: Colors.orange.shade800)),
            Text(_ai!['explanation'] as String? ?? ''),
          ],
          const SizedBox(height: 16),
          AppButton(
            label: _productId == null ? 'Create draft' : (_ai == null ? 'Analyze with AI' : 'Re-analyze'),
            loading: _busy,
            onPressed: _busy
                ? null
                : () async {
                    setState(() => _busy = true);
                    try {
                      final dio = ref.read(dioProvider);
                      if (_productId == null) {
                        if (_categoryId == null) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pick a category.')));
                          }
                          return;
                        }
                        final body = {
                          'title': _title.text,
                          'description': _desc.text,
                          'category': _categoryId,
                          'brand': _brand.text,
                          'model_name': _model.text,
                          'original_price': _orig.text,
                          'final_price': _orig.text,
                          'currency': 'PKR',
                          'product_age_months': int.tryParse(_age.text) ?? 0,
                          'usage_duration_months': int.tryParse(_usage.text) ?? 0,
                          'user_declared_condition': _cond,
                          'location': _loc.text,
                          'status': 'draft',
                        };
                        final r = await dio.post('/seller/products/', data: body);
                        _productId = (r.data as Map)['id'] as int;
                        if (_image != null) {
                          final form = FormData.fromMap({
                            'is_primary': 'true',
                            'image': await MultipartFile.fromFile(_image!.path, filename: 'upload.jpg'),
                          });
                          await dio.post('/seller/products/$_productId/upload-image/', data: form);
                        }
                        setState(() {});
                      } else {
                        final r = await dio.post('/seller/products/$_productId/analyze-with-ai/');
                        final map = r.data as Map<String, dynamic>;
                        setState(() {
                          _ai = map;
                          _customFinalPrice.text = map['suggested_price_avg']?.toString() ?? '';
                        });
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                      }
                    } finally {
                      if (mounted) setState(() => _busy = false);
                    }
                  },
          ),
          if (_ai != null) ...[
            AppButton(
              label: 'Accept AI average price',
              onPressed: () async {
                final dio = ref.read(dioProvider);
                await dio.post('/seller/products/$_productId/accept-ai-price/');
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Price set from AI average')));
                }
              },
            ),
            AppTextField(
              controller: _customFinalPrice,
              label: 'Custom final price (PKR)',
              keyboardType: TextInputType.number,
            ),
            AppButton(
              label: 'Save custom price',
              onPressed: () async {
                final price = _customFinalPrice.text.trim();
                if (price.isEmpty) return;
                final dio = ref.read(dioProvider);
                await dio.patch('/seller/products/$_productId/', data: {'final_price': price});
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Custom price saved')));
                }
              },
            ),
            AppButton(
              label: 'Publish listing',
              onPressed: () async {
                final dio = ref.read(dioProvider);
                await dio.post('/seller/products/$_productId/publish/');
                ref.invalidate(myProductsProvider);
                if (context.mounted) Navigator.of(context).pop();
              },
            ),
          ],
        ],
      ),
    );
  }
}
