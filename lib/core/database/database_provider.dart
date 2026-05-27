import 'package:hobby_app/core/database/app_database.dart';
import 'package:hobby_app/core/sync/sync_queue_helper.dart';
import 'package:hobby_app/core/sync/sync_service.dart';
import 'package:hobby_app/features/library/data/repositories/composite_book_repository.dart';
import 'package:hobby_app/features/library/data/repositories/drift_book_repository.dart';
import 'package:hobby_app/features/library/data/repositories/supabase_book_repository.dart';
import 'package:hobby_app/features/library/domain/repositories/book_repository.dart';
import 'package:hobby_app/features/quotes/data/repositories/composite_quote_repository.dart';
import 'package:hobby_app/features/quotes/data/repositories/drift_quote_repository.dart';
import 'package:hobby_app/features/quotes/data/repositories/supabase_quote_repository.dart';
import 'package:hobby_app/features/quotes/domain/repositories/quote_repository.dart';
import 'package:hobby_app/features/ranking/data/repositories/composite_rating_repository.dart';
import 'package:hobby_app/features/ranking/data/repositories/drift_rating_repository.dart';
import 'package:hobby_app/features/ranking/data/repositories/supabase_rating_repository.dart';
import 'package:hobby_app/features/ranking/domain/repositories/rating_repository.dart';
import 'package:hobby_app/features/reading_tracking/data/repositories/composite_session_repository.dart';
import 'package:hobby_app/features/reading_tracking/data/repositories/drift_session_repository.dart';
import 'package:hobby_app/features/reading_tracking/data/repositories/supabase_session_repository.dart';
import 'package:hobby_app/features/reading_tracking/domain/repositories/session_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'database_provider.g.dart';

@Riverpod(keepAlive: true)
AppDatabase appDatabase(AppDatabaseRef ref) => AppDatabase();

@Riverpod(keepAlive: true)
SyncQueueHelper syncQueueHelper(SyncQueueHelperRef ref) =>
    SyncQueueHelper(ref.watch(appDatabaseProvider));

@Riverpod(keepAlive: true)
SyncService syncService(SyncServiceRef ref) {
  final service = SyncService(
    ref.watch(appDatabaseProvider),
    Supabase.instance.client,
  );
  ref.onDispose(service.stop);
  service.start();
  return service;
}

@Riverpod(keepAlive: true)
BookRepository bookRepository(BookRepositoryRef ref) => CompositeBookRepository(
      DriftBookRepository(ref.watch(appDatabaseProvider)),
      SupabaseBookRepository(Supabase.instance.client),
      ref.watch(syncQueueHelperProvider),
    );

@Riverpod(keepAlive: true)
SessionRepository sessionRepository(SessionRepositoryRef ref) =>
    CompositeSessionRepository(
      DriftSessionRepository(ref.watch(appDatabaseProvider)),
      SupabaseSessionRepository(Supabase.instance.client),
      ref.watch(syncQueueHelperProvider),
    );

@Riverpod(keepAlive: true)
QuoteRepository quoteRepository(QuoteRepositoryRef ref) =>
    CompositeQuoteRepository(
      DriftQuoteRepository(ref.watch(appDatabaseProvider)),
      SupabaseQuoteRepository(Supabase.instance.client),
      ref.watch(syncQueueHelperProvider),
    );

@Riverpod(keepAlive: true)
RatingRepository ratingRepository(RatingRepositoryRef ref) =>
    CompositeRatingRepository(
      DriftRatingRepository(ref.watch(appDatabaseProvider)),
      SupabaseRatingRepository(Supabase.instance.client),
      ref.watch(syncQueueHelperProvider),
    );
