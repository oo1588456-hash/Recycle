import 'package:flutter/material.dart';

import '../profile/profile_screen.dart';
import '../superadmin/admin_ai_screen.dart';
import '../superadmin/admin_dashboard_screen.dart';
import '../superadmin/admin_orders_screen.dart';
import '../superadmin/admin_products_screen.dart';
import '../superadmin/admin_users_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const AdminDashboardScreen(),
      const AdminUsersScreen(),
      const AdminProductsScreen(),
      const AdminOrdersScreen(),
      const AdminAiScreen(),
      const ProfileScreen(),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Stats'),
          NavigationDestination(icon: Icon(Icons.people), label: 'Users'),
          NavigationDestination(icon: Icon(Icons.inventory), label: 'Products'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.psychology), label: 'AI'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
