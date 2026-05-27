import 'package:hobby_app/features/ranking/domain/models/rating.dart';
import 'package:hobby_app/features/ranking/domain/repositories/rating_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseRatingRepository implements RatingRepository {
  SupabaseRatingRepository(this._client);

  final SupabaseClient _client;

  static const _table = 'ratings';

  @override
  Stream<Rating?> watchByBook(String bookId) =>
      throw UnimplementedError('Use Drift stream');

  @override
  Future<void> save(Rating rating) async {
    await _client.from(_table).upsert(_toMap(rating));
  }

  @override
  Future<void> delete(String bookId) async {
    await _client.from(_table).delete().eq('book_id', bookId);
  }

  Map<String, dynamic> _toMap(Rating r) => {
        'id': r.id,
        'book_id': r.bookId,
        'stars': r.stars,
        'review': r.review,
        'rated_at': r.ratedAt.toIso8601String(),
        'updated_at': r.updatedAt.toIso8601String(),
      };
}
