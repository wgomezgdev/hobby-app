import 'package:flutter/material.dart';
import 'package:hobby_app/core/theme/app_colors.dart';
import 'package:hobby_app/core/widgets/streak_ring.dart';

/// Gradient header for the Home screen with greeting and streak ring.
class HomeHeader extends StatelessWidget {
  const HomeHeader({required this.streak, super.key});

  final int streak;

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    return Container(
      decoration: const BoxDecoration(gradient: AppColors.headerGradient),
      child: Padding(
        padding: EdgeInsets.only(top: topPadding),
        child: SizedBox(
          height: 148,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _greeting,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Wilson',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                if (streak > 0) StreakRing(streak: streak),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
