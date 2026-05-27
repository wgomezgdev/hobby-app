import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:hobby_app/core/database/tables/books_table.dart';
import 'package:hobby_app/core/database/tables/quotes_table.dart';
import 'package:hobby_app/core/database/tables/ratings_table.dart';
import 'package:hobby_app/core/database/tables/reading_sessions_table.dart';
import 'package:hobby_app/core/database/tables/sync_queue_table.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    BooksTable,
    ReadingSessionsTable,
    QuotesTable,
    RatingsTable,
    SyncQueueTable,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return driftDatabase(name: 'hobby_app_db');
  }
}
