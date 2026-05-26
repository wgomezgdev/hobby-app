import 'package:go_router/go_router.dart';
import 'package:hobby_app/core/router/app_shell.dart';
import 'package:hobby_app/features/library/presentation/screens/library_screen.dart';
import 'package:hobby_app/features/quotes/presentation/screens/quotes_screen.dart';
import 'package:hobby_app/features/ranking/presentation/screens/profile_screen.dart';
import 'package:hobby_app/features/reading_tracking/presentation/screens/home_screen.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@Riverpod(keepAlive: true)
GoRouter appRouter(AppRouterRef ref) {
  return GoRouter(
    initialLocation: '/home',
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(
          location: state.uri.path,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/library',
            builder: (context, state) => const LibraryScreen(),
          ),
          GoRoute(
            path: '/quotes',
            builder: (context, state) => const QuotesScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
}
