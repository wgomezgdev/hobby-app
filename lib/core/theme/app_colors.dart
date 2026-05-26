import 'package:flutter/material.dart';

/// Static palette constants for the Warm Scholar design system.
abstract final class AppColors {
  static const Color amber = Color(0xFFE8A020);

  static const LinearGradient headerGradient = LinearGradient(
    colors: [Color(0xFF4B3D8F), Color(0xFF7060B8)],
  );

  static const List<LinearGradient> coverPalettes = [
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF4B3D8F), Color(0xFF8470CF)],
    ),
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF1A6B9A), Color(0xFF4FA0CC)],
    ),
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFFB05B00), Color(0xFFE08840)],
    ),
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF1A7A45), Color(0xFF4DB077)],
    ),
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF8B2020), Color(0xFFC05050)],
    ),
    LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF5C1F7A), Color(0xFF9050B8)],
    ),
  ];
}
