import 'package:flutter/material.dart';

import '../products/product_list_screen.dart';
import '../profile/profile_screen.dart';

/// Browse without an account; sign in from Profile.
class GuestShell extends StatefulWidget {
  const GuestShell({super.key});

  @override
  State<GuestShell> createState() => _GuestShellState();
}

class _GuestShellState extends State<GuestShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [const ProductListScreen(), const ProfileScreen()];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront), label: 'Browse'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}
