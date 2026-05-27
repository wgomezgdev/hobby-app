import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/app_database.dart';
import 'package:hobby_app/features/quotes/domain/models/quote.dart';
import 'package:hobby_app/features/quotes/domain/repositories/quote_repository.dart';

class DriftQuoteRepository implements QuoteRepository {
  DriftQuoteRepository(this._db);

  final AppDatabase _db;

  @override
  Stream<List<Quote>> watchByBook(String bookId) {
    return (_db.select(_db.quotesTable)
          ..where((t) => t.bookId.equals(bookId))
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .watch()
        .map((rows) => rows.map(_fromRow).toList());
  }

  @override
  Stream<List<Quote>> watchFavorites() {
    return (_db.select(_db.quotesTable)
          ..where((t) => t.isFavorite.equals(true))
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .watch()
        .map((rows) => rows.map(_fromRow).toList());
  }

  @override
  Future<List<Quote>> search(String query) async {
    final lower = query.toLowerCase();
    final rows = await (_db.select(_db.quotesTable)
          ..where((t) => t.body.lower().contains(lower)))
        .get();
    return rows.map(_fromRow).toList();
  }

  @override
  Future<void> save(Quote quote) async {
    await _db
        .into(_db.quotesTable)
        .insertOnConflictUpdate(_toCompanion(quote));
  }

  @override
  Future<void> delete(String id) async {
    await (_db.delete(_db.quotesTable)..where((t) => t.id.equals(id))).go();
  }

  Quote _fromRow(QuoteRow row) => Quote(
        id: row.id,
        bookId: row.bookId,
        text: row.body,
        tags: (jsonDecode(row.tags) as List<dynamic>).cast<String>(),
        isFavorite: row.isFavorite,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        pageNumber: row.pageNumber,
      );

  QuotesTableCompanion _toCompanion(Quote q) => QuotesTableCompanion(
        id: Value(q.id),
        bookId: Value(q.bookId),
        body: Value(q.text),
        tags: Value(jsonEncode(q.tags)),
        isFavorite: Value(q.isFavorite),
        pageNumber: Value(q.pageNumber),
        createdAt: Value(q.createdAt),
        updatedAt: Value(q.updatedAt),
      );
}
