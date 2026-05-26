/// Compile-time environment configuration.
/// Values are injected via --dart-define-from-file=.env.dev (or .env.staging / .env.prod).
abstract final class Env {
  static const String supabaseUrl =
      String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY');
  static const String sentryDsn =
      String.fromEnvironment('SENTRY_DSN');
}
