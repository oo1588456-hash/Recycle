import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';

/// Optional Firebase (thesis Ch.3.6). Configure via `--dart-define` (see `docs/FIREBASE_MIGRATION.md`).
class FirebaseBootstrap {
  FirebaseBootstrap._();

  static var isReady = false;

  static Future<void> tryInitialize() async {
    const projectId = String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: '');
    if (projectId.isEmpty) {
      return;
    }

    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: String.fromEnvironment('FIREBASE_ANDROID_API_KEY'),
            appId: String.fromEnvironment('FIREBASE_ANDROID_APP_ID'),
            messagingSenderId: String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
            projectId: projectId,
            storageBucket: String.fromEnvironment('FIREBASE_STORAGE_BUCKET'),
          ),
        );
      } else if (defaultTargetPlatform == TargetPlatform.iOS) {
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: String.fromEnvironment('FIREBASE_IOS_API_KEY'),
            appId: String.fromEnvironment('FIREBASE_IOS_APP_ID'),
            messagingSenderId: String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
            projectId: projectId,
            storageBucket: String.fromEnvironment('FIREBASE_STORAGE_BUCKET'),
            iosBundleId: String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID'),
          ),
        );
      } else {
        return;
      }
      isReady = true;
      try {
        await FirebaseAuth.instance.signInAnonymously();
      } catch (_) {
        // Production may use email link / custom token instead.
      }
    } catch (e, st) {
      debugPrint('Firebase init skipped: $e\n$st');
      isReady = false;
    }
  }
}
