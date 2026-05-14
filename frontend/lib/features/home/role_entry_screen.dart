import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_state.dart';
import 'admin_shell.dart';
import 'buyer_shell.dart';
import 'guest_shell.dart';
import 'seller_shell.dart';

/// Routes authenticated users by role; guests see limited navigation.
class RoleEntryScreen extends ConsumerWidget {
  const RoleEntryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    return auth.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (_, __) => const GuestShell(),
      data: (user) {
        if (user == null) return const GuestShell();
        switch (user.role) {
          case 'superadmin':
            return const AdminShell();
          case 'seller':
            return const SellerShell();
          case 'buyer':
          default:
            return const BuyerShell();
        }
      },
    );
  }
}
