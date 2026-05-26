import 'package:flutter/material.dart';
import 'package:hobby_app/core/theme/app_colors.dart';

/// Circular amber progress ring showing the user's reading streak.
/// Must not be shown when [streak] is 0.
class StreakRing extends StatelessWidget {
  const StreakRing({required this.streak, super.key});

  final int streak;

  @override
  Widget build(BuildContext context) {
    final primaryContainer =
        Theme.of(context).colorScheme.primaryContainer;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 56,
          height: 56,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(
                value: (streak % 30) / 30,
                strokeWidth: 6,
                backgroundColor: primaryContainer,
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.amber,
                ),
                strokeCap: StrokeCap.round,
              ),
              Text(
                '$streak',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'day streak',
          style: TextStyle(
            fontSize: 10,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }
}
