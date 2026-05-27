import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/app_database.dart';
import 'package:hobby_app/features/reading_tracking/domain/models/reading_session.dart';
import 'package:hobby_app/features/reading_tracking/domain/repositories/session_repository.dart';

class DriftSessionRepository implements SessionRepository {
  DriftSessionRepository(this._db);

  final AppDatabase _db;

  @override
  Stream<List<ReadingSession>> watchByBook(String bookId) {
    return (_db.select(_db.readingSessionsTable)
          ..where((t) => t.bookId.equals(bookId))
          ..orderBy([(t) => OrderingTerm.desc(t.startedAt)]))
        .watch()
        .map((rows) => rows.map(_fromRow).toList());
  }

  @override
  Future<ReadingSession?> getLatestForBook(String bookId) async {
    final row = await (_db.select(_db.readingSessionsTable)
          ..where((t) => t.bookId.equals(bookId))
          ..orderBy([(t) => OrderingTerm.desc(t.startedAt)])
          ..limit(1))
        .getSingleOrNull();
    return row == null ? null : _fromRow(row);
  }

  @override
  Future<List<DateTime>> getDistinctSessionDates() async {
    final rows = await _db.select(_db.readingSessionsTable).get();
    return rows
        .map((r) {
          final d = r.startedAt;
          return DateTime.utc(d.year, d.month, d.day);
        })
        .toSet()
        .toList()
      ..sort((a, b) => b.compareTo(a));
  }

  @override
  Future<void> save(ReadingSession session) async {
    await _db
        .into(_db.readingSessionsTable)
        .insertOnConflictUpdate(_toCompanion(session));
  }

  @override
  Future<void> delete(String id) async {
    await (_db.delete(_db.readingSessionsTable)
          ..where((t) => t.id.equals(id)))
        .go();
  }

  ReadingSession _fromRow(ReadingSessionRow row) => ReadingSession(
        id: row.id,
        bookId: row.bookId,
        startedAt: row.startedAt,
        durationMinutes: row.durationMinutes,
        pagesFrom: row.pagesFrom,
        pagesTo: row.pagesTo,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        notes: row.notes,
      );

  ReadingSessionsTableCompanion _toCompanion(ReadingSession s) =>
      ReadingSessionsTableCompanion(
        id: Value(s.id),
        bookId: Value(s.bookId),
        startedAt: Value(s.startedAt),
        durationMinutes: Value(s.durationMinutes),
        pagesFrom: Value(s.pagesFrom),
        pagesTo: Value(s.pagesTo),
        notes: Value(s.notes),
        createdAt: Value(s.createdAt),
        updatedAt: Value(s.updatedAt),
      );
}
