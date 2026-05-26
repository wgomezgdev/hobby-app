import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hobby_app/core/router/app_router.dart';
import 'package:hobby_app/core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: HobbyApp()));
}

class HobbyApp extends ConsumerWidget {
  const HobbyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Reading Companion',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      routerConfig: router,
    );
  }
}
