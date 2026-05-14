import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage(this._s);
  final FlutterSecureStorage _s;

  static const _a = 'access';
  static const _r = 'refresh';

  Future<void> saveTokens({required String access, required String refresh}) async {
    await _s.write(key: _a, value: access);
    await _s.write(key: _r, value: refresh);
  }

  Future<String?> readAccess() => _s.read(key: _a);
  Future<String?> readRefresh() => _s.read(key: _r);

  Future<void> clear() async {
    await _s.delete(key: _a);
    await _s.delete(key: _r);
  }
}

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  const s = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  return TokenStorage(s);
});
