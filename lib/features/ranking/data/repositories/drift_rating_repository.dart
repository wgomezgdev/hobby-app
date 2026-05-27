import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/app_database.dart';
import 'package:hobby_app/features/ranking/domain/models/rating.dart';
import 'package:hobby_app/features/ranking/domain/repositories/rating_repository.dart';

class DriftRatingRepository implements RatingRepository {
  DriftRatingRepository(this._db);

  final AppDatabase _db;

  @override
  Stream<Rating?> watchByBook(String bookId) {
    return (_db.select(_db.ratingsTable)
          ..where((t) => t.bookId.equals(bookId)))
        .watchSingleOrNull()
        .map((row) => row == null ? null : _fromRow(row));
  }

  @override
  Future<void> save(Rating rating) async {
    await _db
        .into(_db.ratingsTable)
        .insertOnConflictUpdate(_toCompanion(rating));
  }

  @override
  Future<void> delete(String bookId) async {
    await (_db.delete(_db.ratingsTable)
          ..where((t) => t.bookId.equals(bookId)))
        .go();
  }

  Rating _fromRow(RatingRow row) => Rating(
        id: row.id,
        bookId: row.bookId,
        stars: row.stars,
        ratedAt: row.ratedAt,
        updatedAt: row.updatedAt,
        review: row.review,
      );

  RatingsTableCompanion _toCompanion(Rating r) => RatingsTableCompanion(
        id: Value(r.id),
        bookId: Value(r.bookId),
        stars: Value(r.stars),
        review: Value(r.review),
        ratedAt: Value(r.ratedAt),
        updatedAt: Value(r.updatedAt),
      );
}
