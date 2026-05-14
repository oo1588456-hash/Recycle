import 'package:flutter/material.dart';

import '../buyer/cart_screen.dart';
import '../buyer/my_orders_screen.dart';
import '../chat/chat_list_screen.dart';
import '../products/product_list_screen.dart';
import '../profile/profile_screen.dart';

class BuyerShell extends StatefulWidget {
  const BuyerShell({super.key});

  @override
  State<BuyerShell> createState() => _BuyerShellState();
}

class _BuyerShellState extends State<BuyerShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const ProductListScreen(),
      const CartScreen(),
      const MyOrdersScreen(),
      const ChatListScreen(),
      const ProfileScreen(),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront), label: 'Browse'),
          NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), label: 'Cart'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
