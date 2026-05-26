import 'package:flutter/material.dart';
import 'package:hobby_app/core/theme/app_colors.dart';

/// Gradient app bar used as the top header on all main tab screens.
class GradientAppBar extends StatelessWidget implements PreferredSizeWidget {
  const GradientAppBar({required this.title, super.key});

  final String title;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      flexibleSpace: const DecoratedBox(
        decoration: BoxDecoration(gradient: AppColors.headerGradient),
      ),
    );
  }
}
