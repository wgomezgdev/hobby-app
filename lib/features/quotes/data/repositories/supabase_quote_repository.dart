import 'package:hobby_app/features/quotes/domain/models/quote.dart';
import 'package:hobby_app/features/quotes/domain/repositories/quote_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseQuoteRepository implements QuoteRepository {
  SupabaseQuoteRepository(this._client);

  final SupabaseClient _client;

  static const _table = 'quotes';

  @override
  Stream<List<Quote>> watchByBook(String bookId) =>
      throw UnimplementedError('Use Drift stream');

  @override
  Stream<List<Quote>> watchFavorites() =>
      throw UnimplementedError('Use Drift stream');

  @override
  Future<List<Quote>> search(String query) async {
    final rows = await _client
        .from(_table)
        .select()
        .textSearch('text', query, type: TextSearchType.websearch);
    return (rows as List<dynamic>)
        .map((r) => _fromMap(r as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<void> save(Quote quote) async {
    await _client.from(_table).upsert(_toMap(quote));
  }

  @override
  Future<void> delete(String id) async {
    await _client.from(_table).delete().eq('id', id);
  }

  Quote _fromMap(Map<String, dynamic> m) => Quote(
        id: m['id'] as String,
        bookId: m['book_id'] as String,
        text: m['text'] as String,
        tags: (m['tags'] as List<dynamic>).cast<String>(),
        isFavorite: m['is_favorite'] as bool,
        createdAt: DateTime.parse(m['created_at'] as String),
        updatedAt: DateTime.parse(m['updated_at'] as String),
        pageNumber: m['page_number'] as int?,
      );

  Map<String, dynamic> _toMap(Quote q) => {
        'id': q.id,
        'book_id': q.bookId,
        'text': q.text,
        'tags': q.tags,
        'is_favorite': q.isFavorite,
        'page_number': q.pageNumber,
        'created_at': q.createdAt.toIso8601String(),
        'updated_at': q.updatedAt.toIso8601String(),
      };
}
