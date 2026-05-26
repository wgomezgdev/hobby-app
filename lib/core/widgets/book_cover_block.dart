import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hobby_app/core/theme/app_colors.dart';

/// Gradient letter cover shown wherever a book has no uploaded image.
class BookCoverBlock extends StatelessWidget {
  const BookCoverBlock({
    required this.title,
    required this.paletteIndex,
    this.width = 100,
    this.height = 136,
    this.borderRadius = 12,
    super.key,
  });

  final String title;
  final int paletteIndex;
  final double width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final gradient = AppColors.coverPalettes[paletteIndex % 6];
    final letter =
        title.isNotEmpty ? title[0].toUpperCase() : '?';
    return Semantics(
      label: 'Cover for $title',
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        alignment: Alignment.center,
        child: Text(
          letter,
          style: GoogleFonts.lora(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
