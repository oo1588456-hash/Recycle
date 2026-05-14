import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../shared/models/models.dart';
import '../auth/auth_state.dart';

final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/categories/');
  final data = r.data;
  final list = (data is Map && data['results'] is List) ? data['results'] as List<dynamic> : data as List<dynamic>;
  return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
});

Future<List<ProductModel>> fetchProducts(Dio dio, {String? search}) async {
  final r = await dio.get('/products/', queryParameters: {if (search != null && search.isNotEmpty) 'search': search});
  final data = r.data;
  final list = (data is Map && data['results'] is List) ? data['results'] as List<dynamic> : data as List<dynamic>;
  final media = mediaBaseUrl();
  return list.map((e) => ProductModel.fromJson(e as Map<String, dynamic>, mediaBase: media)).toList();
}

final productListProvider = FutureProvider.autoDispose.family<List<ProductModel>, String?>((ref, search) async {
  final dio = ref.watch(dioProvider);
  return fetchProducts(dio, search: search);
});

final myProductsProvider = FutureProvider.autoDispose<List<ProductModel>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/seller/products/');
  final data = r.data;
  final list = (data is Map && data['results'] is List) ? data['results'] as List<dynamic> : data as List<dynamic>;
  final media = mediaBaseUrl();
  return list.map((e) => ProductModel.fromJson(e as Map<String, dynamic>, mediaBase: media)).toList();
});
