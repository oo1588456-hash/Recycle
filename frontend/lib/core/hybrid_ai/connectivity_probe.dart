import 'dart:async';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';

/// Thesis Ch.3.3 "Latency-First" gate — coarse reachability before cloud AI.
Future<bool> shouldAttemptCloud({
  Duration dnsTimeout = const Duration(seconds: 3),
}) async {
  final interfaces = await Connectivity().checkConnectivity();
  final noneOnly = interfaces.length == 1 && interfaces.contains(ConnectivityResult.none);
  if (noneOnly) return false;
  try {
    final result = await InternetAddress.lookup('example.com').timeout(dnsTimeout);
    return result.isNotEmpty && result.first.rawAddress.isNotEmpty;
  } on SocketException {
    return false;
  } on TimeoutException {
    return false;
  }
}
