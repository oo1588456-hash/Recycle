import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/api_config.dart';
import '../storage/token_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
    ),
  );
  final storage = ref.watch(tokenStorageProvider);
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final t = await storage.readAccess();
        if (t != null && t.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $t';
        }
        return handler.next(options);
      },
    ),
  );
  return dio;
});
