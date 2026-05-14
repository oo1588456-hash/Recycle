import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';

import 'firebase_bootstrap.dart';

/// Thesis Ch.3.6 — `cached_ai_results` collection (redundant OpenAI call avoidance at edge).
class AiCacheFirestore {
  AiCacheFirestore._();

  static Future<void> writeCachedAnalysis({
    required int productId,
    required Map<String, dynamic> payload,
  }) async {
    if (!FirebaseBootstrap.isReady) return;
    final raw = '$productId|${jsonEncode(payload)}';
    final hash = sha256.convert(utf8.encode(raw)).toString().substring(0, 32);
    await FirebaseFirestore.instance.collection('cached_ai_results').doc(hash).set(
      {
        'product_id': productId,
        'payload': payload,
        'cache_key_sha256_prefix': hash,
        'updated_at': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }
}
