import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/api_config.dart';
import '../../core/network/dio_client.dart';
import '../../core/storage/token_storage.dart';
import '../../shared/models/models.dart';

final authStateProvider =
    StateNotifierProvider<AuthController, AsyncValue<UserModel?>>((ref) {
  return AuthController(ref);
});

class AuthController extends StateNotifier<AsyncValue<UserModel?>> {
  AuthController(this.ref) : super(const AsyncValue.loading()) {
    _bootstrap();
  }
  final Ref ref;

  Dio get _dio => ref.read(dioProvider);
  TokenStorage get _tok => ref.read(tokenStorageProvider);

  Future<void> _bootstrap() async {
    final t = await _tok.readAccess();
    if (t == null) {
      state = const AsyncValue.data(null);
      return;
    }
    try {
      final r = await _dio.get('/auth/me/');
      state = AsyncValue.data(UserModel.fromJson(r.data as Map<String, dynamic>));
    } catch (_) {
      await _tok.clear();
      state = const AsyncValue.data(null);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    final r = await _dio.post('/auth/login/', data: {'email': email, 'password': password});
    final data = r.data as Map<String, dynamic>;
    await _tok.saveTokens(access: data['access'] as String, refresh: data['refresh'] as String);
    state = AsyncValue.data(UserModel.fromJson(data['user'] as Map<String, dynamic>));
  }

  Future<void> register(Map<String, dynamic> body) async {
    await _dio.post('/auth/register/', data: body);
    await login(body['email'] as String, body['password'] as String);
  }

  Future<void> logout() async {
    await _tok.clear();
    state = const AsyncValue.data(null);
  }
}

String mediaBaseUrl() {
  final u = ApiConfig.baseUrl;
  return u.replaceAll('/api/v1', '');
}
