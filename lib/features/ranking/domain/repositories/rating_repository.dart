import 'package:hobby_app/features/ranking/domain/models/rating.dart';

abstract interface class RatingRepository {
  Stream<Rating?> watchByBook(String bookId);
  Future<void> save(Rating rating);
  Future<void> delete(String bookId);
}
