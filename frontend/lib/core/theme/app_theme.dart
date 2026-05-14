import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF2E7D32);
  static const Color primaryDark = Color(0xFF1B5E20);
  static const Color surface = Color(0xFFF8FFF8);

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.light),
      scaffoldBackgroundColor: surface,
    );
    return base.copyWith(
      appBarTheme: const AppBarTheme(centerTitle: true, backgroundColor: primary, foregroundColor: Colors.white),
        cardTheme: CardThemeData(
          elevation: 1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
