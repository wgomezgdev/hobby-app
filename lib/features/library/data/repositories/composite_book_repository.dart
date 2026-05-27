import 'package:hobby_app/core/sync/sync_queue_helper.dart';
import 'package:hobby_app/features/library/data/repositories/drift_book_repository.dart';
import 'package:hobby_app/features/library/data/repositories/supabase_book_repository.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/library/domain/repositories/book_repository.dart';

class CompositeBookRepository implements BookRepository {
  CompositeBookRepository(this._local, this._remote, this._queue);

  final DriftBookRepository _local;
  final SupabaseBookRepository _remote;
  final SyncQueueHelper _queue;

  @override
  Stream<List<Book>> watchAll() => _local.watchAll();

  @override
  Stream<List<Book>> watchByStatus(BookStatus status) =>
      _local.watchByStatus(status);

  @override
  Future<Book?> getById(String id) => _local.getById(id);

  @override
  Future<void> save(Book book) async {
    await _local.save(book);
    try {
      await _remote.save(book);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'book',
        entityId: book.id,
        operation: 'upsert',
        payload: {
          'id': book.id,
          'user_id': book.userId,
          'title': book.title,
          'author': book.author,
          'total_pages': book.totalPages,
          'status': book.status.name,
          'cover_uri': book.coverUri,
        },
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
        entityType: 'book',
        entityId: id,
        operation: 'delete',
        payload: {'id': id},
      );
    }
  }
}
