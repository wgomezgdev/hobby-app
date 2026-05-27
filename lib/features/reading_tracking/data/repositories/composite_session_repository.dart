import 'package:hobby_app/core/sync/sync_queue_helper.dart';
import 'package:hobby_app/features/reading_tracking/data/repositories/drift_session_repository.dart';
import 'package:hobby_app/features/reading_tracking/data/repositories/supabase_session_repository.dart';
import 'package:hobby_app/features/reading_tracking/domain/models/reading_session.dart';
import 'package:hobby_app/features/reading_tracking/domain/repositories/session_repository.dart';

class CompositeSessionRepository implements SessionRepository {
  CompositeSessionRepository(this._local, this._remote, this._queue);

  final DriftSessionRepository _local;
  final SupabaseSessionRepository _remote;
  final SyncQueueHelper _queue;

  @override
  Stream<List<ReadingSession>> watchByBook(String bookId) =>
      _local.watchByBook(bookId);

  @override
  Future<ReadingSession?> getLatestForBook(String bookId) =>
      _local.getLatestForBook(bookId);

  @override
  Future<List<DateTime>> getDistinctSessionDates() =>
      _local.getDistinctSessionDates();

  @override
  Future<void> save(ReadingSession session) async {
    await _local.save(session);
    try {
      await _remote.save(session);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'session',
        entityId: session.id,
        operation: 'upsert',
        payload: {'id': session.id, 'book_id': session.bookId},
      );
    }
  }

  @override
  Future<void> delete(String id) async {
    await _local.delete(id);
    try {
      await _remote.delete(id);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'session',
        entityId: id,
        operation: 'delete',
        payload: {'id': id},
      );
    }
  }
}
