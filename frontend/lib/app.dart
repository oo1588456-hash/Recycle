import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/home/splash_screen.dart';
import 'features/products/create_listing_screen.dart';

class RecycleApp extends StatelessWidget {
  const RecycleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReCycle',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: const SplashScreen(),
      routes: {
        '/create': (_) => const CreateListingScreen(),
      },
    );
  }
}
