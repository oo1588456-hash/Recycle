import 'package:flutter/material.dart';

import '../chat/chat_list_screen.dart';
import '../products/my_products_screen.dart';
import '../profile/profile_screen.dart';
import '../seller/seller_orders_screen.dart';

class SellerShell extends StatefulWidget {
  const SellerShell({super.key});

  @override
  State<SellerShell> createState() => _SellerShellState();
}

class _SellerShellState extends State<SellerShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const MyProductsScreen(),
      const SellerOrdersScreen(),
      const ChatListScreen(),
      const ProfileScreen(),
    ];
    return Scaffold(
      body: pages[_index],
      floatingActionButton: _index == 0
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.of(context).pushNamed('/create'),
              icon: const Icon(Icons.add),
              label: const Text('New listing'),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.inventory_2), label: 'Listings'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
