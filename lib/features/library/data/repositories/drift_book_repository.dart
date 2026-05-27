import 'dart:async';

import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/app_database.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/library/domain/repositories/book_repository.dart';

class DriftBookRepository implements BookRepository {
  DriftBookRepository(this._db);

  final AppDatabase _db;

  @override
  Stream<List<Book>> watchAll() {
    return _db.select(_db.booksTable).watch().map(
          (rows) => rows.map(_fromRow).toList(),
        );
  }

  @override
  Stream<List<Book>> watchByStatus(BookStatus status) {
    return (_db.select(_db.booksTable)
          ..where((t) => t.status.equals(status.name)))
        .watch()
        .map((rows) => rows.map(_fromRow).toList());
  }

  @override
  Future<Book?> getById(String id) async {
    final row = await (_db.select(_db.booksTable)
          ..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    return row == null ? null : _fromRow(row);
  }

  @override
  Future<void> save(Book book) async {
    await _db.into(_db.booksTable).insertOnConflictUpdate(_toCompanion(book));
  }

  @override
  Future<void> delete(String id) async {
    await (_db.delete(_db.booksTable)..where((t) => t.id.equals(id))).go();
  }

  Book _fromRow(BookRow row) => Book(
        id: row.id,
        userId: row.userId,
        title: row.title,
        author: row.author,
        totalPages: row.totalPages,
        status: _statusFromDb(row.status),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        coverUri: row.coverUri,
      );

  BooksTableCompanion _toCompanion(Book b) => BooksTableCompanion(
        id: Value(b.id),
        userId: Value(b.userId),
        title: Value(b.title),
        author: Value(b.author),
        totalPages: Value(b.totalPages),
        status: Value(_statusToDb(b.status)),
        coverUri: Value(b.coverUri),
        createdAt: Value(b.createdAt),
        updatedAt: Value(b.updatedAt),
      );

  static String _statusToDb(BookStatus s) => switch (s) {
        BookStatus.wantToRead => 'want_to_read',
        BookStatus.reading => 'reading',
        BookStatus.finished => 'finished',
      };

  static BookStatus _statusFromDb(String s) => switch (s) {
        'reading' => BookStatus.reading,
        'finished' => BookStatus.finished,
        _ => BookStatus.wantToRead,
      };
}
