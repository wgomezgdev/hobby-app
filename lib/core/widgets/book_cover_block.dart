import 'package:flutter/material.dart';

class BookCoverBlock extends StatelessWidget {
  const BookCoverBlock({
    required this.title,
    required this.paletteIndex,
    this.width = 80,
    this.height = 110,
    this.borderRadius = 8,
    super.key,
  });

  final String title;
  final int paletteIndex;
  final double width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final bgs = [
      scheme.primaryContainer,
      scheme.secondaryContainer,
      scheme.tertiaryContainer,
    ];
    final fgs = [
      scheme.onPrimaryContainer,
      scheme.onSecondaryContainer,
      scheme.onTertiaryContainer,
    ];
    final i = paletteIndex % bgs.length;
    final letter = title.isNotEmpty ? title[0].toUpperCase() : '?';
    return Semantics(
      label: 'Cover for $title',
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: bgs[i],
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        alignment: Alignment.center,
        child: Text(
          letter,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: fgs[i],
          ),
        ),
      ),
    );
  }
}
