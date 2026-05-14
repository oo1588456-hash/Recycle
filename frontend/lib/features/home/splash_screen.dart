import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_state.dart';
import 'role_entry_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  var _navigated = false;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    if (!auth.isLoading && !_navigated) {
      _navigated = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute<void>(builder: (_) => const RoleEntryScreen()),
        );
      });
    }
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.recycling, size: 72, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 12),
            Text('ReCycle', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            if (auth.isLoading) const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
