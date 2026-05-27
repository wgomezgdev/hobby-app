import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hobby_app/core/router/app_shell.dart';
import 'package:hobby_app/features/auth/presentation/providers/auth_providers.dart';
import 'package:hobby_app/features/auth/presentation/screens/sign_in_screen.dart';
import 'package:hobby_app/features/library/presentation/screens/add_book_screen.dart';
import 'package:hobby_app/features/library/presentation/screens/library_screen.dart';
import 'package:hobby_app/features/quotes/presentation/screens/quotes_screen.dart';
import 'package:hobby_app/features/ranking/presentation/screens/profile_screen.dart';
import 'package:hobby_app/features/reading_tracking/presentation/screens/home_screen.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@Riverpod(keepAlive: true)
GoRouter appRouter(AppRouterRef ref) {
  final authNotifier = _AuthNotifier(ref);
  return GoRouter(
    initialLocation: '/home',
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final isSignedIn = ref.read(currentUserProvider) != null;
      final isOnSignIn = state.matchedLocation == '/signin';

      if (!isSignedIn && !isOnSignIn) return '/signin';
      if (isSignedIn && isOnSignIn) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/signin',
        builder: (context, state) => const SignInScreen(),
      ),
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
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const AddBookScreen(),
              ),
            ],
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

class _AuthNotifier extends ChangeNotifier {
  _AuthNotifier(this._ref) {
    _ref.listen(authStateChangesProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}
