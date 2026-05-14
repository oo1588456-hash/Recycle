import 'package:flutter/material.dart';

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.controller,
    this.label,
    this.obscure = false,
    this.keyboardType,
    this.maxLines = 1,
  });
  final TextEditingController controller;
  final String? label;
  final bool obscure;
  final TextInputType? keyboardType;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label),
    );
  }
}
