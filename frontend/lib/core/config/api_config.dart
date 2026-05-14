import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:8005/api/v1';
  static const String localBaseUrl = 'http://localhost:8005/api/v1';
  static const String physicalDeviceBaseUrl = 'http://YOUR_LOCAL_IP:8005/api/v1';

  /// Web and desktop use localhost. Android emulator uses 10.0.2.2. iOS simulator also uses localhost.
  static String get baseUrl {
    if (kIsWeb) return localBaseUrl;
    if (defaultTargetPlatform == TargetPlatform.android) {
      return androidEmulatorBaseUrl;
    }
    return localBaseUrl;
  }
}
