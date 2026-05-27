import 'package:hobby_app/core/sync/sync_queue_helper.dart';
import 'package:hobby_app/features/quotes/data/repositories/drift_quote_repository.dart';
import 'package:hobby_app/features/quotes/data/repositories/supabase_quote_repository.dart';
import 'package:hobby_app/features/quotes/domain/models/quote.dart';
import 'package:hobby_app/features/quotes/domain/repositories/quote_repository.dart';

class CompositeQuoteRepository implements QuoteRepository {
  CompositeQuoteRepository(this._local, this._remote, this._queue);

  final DriftQuoteRepository _local;
  final SupabaseQuoteRepository _remote;
  final SyncQueueHelper _queue;

  @override
  Stream<List<Quote>> watchByBook(String bookId) =>
      _local.watchByBook(bookId);

  @override
  Stream<List<Quote>> watchFavorites() => _local.watchFavorites();

  @override
  Future<List<Quote>> search(String query) => _local.search(query);

  @override
  Future<void> save(Quote quote) async {
    await _local.save(quote);
    try {
      await _remote.save(quote);
    } catch (_) {
      await _queue.enqueue(
        entityType: 'quote',
        entityId: quote.id,
        operation: 'upsert',
        payload: {'id': quote.id, 'book_id': quote.bookId},
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
        entityType: 'quote',
        entityId: id,
        operation: 'delete',
        payload: {'id': id},
      );
    }
  }
}
