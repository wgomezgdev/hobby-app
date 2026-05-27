import 'package:hobby_app/core/sync/sync_queue_helper.dart';
import 'package:hobby_app/features/ranking/data/repositories/drift_rating_repository.dart';
import 'package:hobby_app/features/ranking/data/repositories/supabase_rating_repository.dart';
import 'package:hobby_app/features/ranking/domain/models/rating.dart';
import 'package:hobby_app/features/ranking/domain/repositories/rating_repository.dart';

class CompositeRatingRepository implements RatingRepository {
  CompositeRatingRepository(this._local, this._remote, this._queue);

  final DriftRatingRepository _local;
  final SupabaseRatingRepository _remote;
  final SyncQueueHelper _queue;

  @override
  Stream<Rating?> watchByBook(String bookId) => _local.watchByBook(bookId);

  @override
  Future<void> save(Rating rating) async {
    await _local.save(rating);
    try {
      await _remote.save(rating);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'rating',
        entityId: rating.id,
        operation: 'upsert',
        payload: {'id': rating.id, 'book_id': rating.bookId},
      );
    }
  }

  @override
  Future<void> delete(String bookId) async {
    await _local.delete(bookId);
    try {
      await _remote.delete(bookId);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'rating',
        entityId: bookId,
        operation: 'delete',
        payload: {'book_id': bookId},
      );
    }
  }
}
