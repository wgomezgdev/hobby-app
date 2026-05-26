import 'package:hobby_app/features/auth/data/repositories/supabase_auth_repository.dart';
import 'package:hobby_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'auth_providers.g.dart';

@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) =>
    SupabaseAuthRepository(Supabase.instance.client);

@Riverpod(keepAlive: true)
Stream<AuthState> authStateChanges(AuthStateChangesRef ref) =>
    ref.watch(authRepositoryProvider).authStateChanges;

@Riverpod(keepAlive: true)
User? currentUser(CurrentUserRef ref) {
  ref.watch(authStateChangesProvider);
  return ref.watch(authRepositoryProvider).currentUser;
}
