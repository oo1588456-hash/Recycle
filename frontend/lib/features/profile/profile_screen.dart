import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_state.dart';
import '../auth/login_screen.dart';
import '../home/role_entry_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: auth.when(
        data: (user) {
          if (user == null) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('You are browsing as a guest.'),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const LoginScreen())),
                    child: const Text('Sign in'),
                  ),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ListTile(title: const Text('Name'), subtitle: Text(user.fullName ?? user.email)),
              ListTile(title: const Text('Email'), subtitle: Text(user.email)),
              ListTile(title: const Text('Role'), subtitle: Text(user.role)),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  await ref.read(authStateProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute<void>(builder: (_) => const RoleEntryScreen()),
                      (route) => false,
                    );
                  }
                },
                child: const Text('Logout'),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
