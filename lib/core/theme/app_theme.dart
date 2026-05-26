import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Warm Scholar palette — deep indigo primary, warm cream surface.
abstract final class AppTheme {
  static const Color _seed = Color(0xFF4B3D8F);
  static const Color _lightSurface = Color(0xFFFFF8F2);

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: _seed,
      surface: _lightSurface,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: GoogleFonts.nunitoTextTheme(),
    );
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: _seed,
      brightness: Brightness.dark,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: GoogleFonts.nunitoTextTheme(
        ThemeData.dark().textTheme,
      ),
    );
  }
}
