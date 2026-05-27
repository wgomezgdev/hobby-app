import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/library/domain/repositories/book_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseBookRepository implements BookRepository {
  SupabaseBookRepository(this._client);

  final SupabaseClient _client;

  static const _table = 'books';

  @override
  Stream<List<Book>> watchAll() => throw UnimplementedError('Use Drift stream');

  @override
  Stream<List<Book>> watchByStatus(BookStatus status) =>
      throw UnimplementedError('Use Drift stream');

  @override
  Future<Book?> getById(String id) async {
    final data = await _client.from(_table).select().eq('id', id).maybeSingle();
    return data == null ? null : _fromMap(data);
  }

  @override
  Future<void> save(Book book) async {
    await _client.from(_table).upsert(_toMap(book));
  }

  @override
  Future<void> delete(String id) async {
    await _client.from(_table).delete().eq('id', id);
  }

  Book _fromMap(Map<String, dynamic> m) => Book(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        title: m['title'] as String,
        author: m['author'] as String,
        totalPages: m['total_pages'] as int,
        status: _statusFromDb(m['status'] as String),
        createdAt: DateTime.parse(m['created_at'] as String),
        updatedAt: DateTime.parse(m['updated_at'] as String),
        coverUri: m['cover_uri'] as String?,
      );

  Map<String, dynamic> _toMap(Book b) => {
        'id': b.id,
        'user_id': b.userId,
        'title': b.title,
        'author': b.author,
        'total_pages': b.totalPages,
        'status': _statusToDb(b.status),
        'cover_uri': b.coverUri,
        'created_at': b.createdAt.toIso8601String(),
        'updated_at': b.updatedAt.toIso8601String(),
      };

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
