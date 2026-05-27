import 'package:hobby_app/features/reading_tracking/domain/models/reading_session.dart';
import 'package:hobby_app/features/reading_tracking/domain/repositories/session_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseSessionRepository implements SessionRepository {
  SupabaseSessionRepository(this._client);

  final SupabaseClient _client;

  static const _table = 'reading_sessions';

  @override
  Stream<List<ReadingSession>> watchByBook(String bookId) =>
      throw UnimplementedError('Use Drift stream');

  @override
  Future<ReadingSession?> getLatestForBook(String bookId) async {
    final data = await _client
        .from(_table)
        .select()
        .eq('book_id', bookId)
        .order('started_at', ascending: false)
        .limit(1)
        .maybeSingle();
    return data == null ? null : _fromMap(data);
  }

  @override
  Future<List<DateTime>> getDistinctSessionDates() async {
    final rows = await _client.from(_table).select('started_at');
    return rows
        .map((r) {
          final dt = DateTime.parse(r['started_at'] as String);
          return DateTime.utc(dt.year, dt.month, dt.day);
        })
        .toSet()
        .toList()
      ..sort((a, b) => b.compareTo(a));
  }

  @override
  Future<void> save(ReadingSession session) async {
    await _client.from(_table).upsert(_toMap(session));
  }

  @override
  Future<void> delete(String id) async {
    await _client.from(_table).delete().eq('id', id);
  }

  ReadingSession _fromMap(Map<String, dynamic> m) => ReadingSession(
        id: m['id'] as String,
        bookId: m['book_id'] as String,
        startedAt: DateTime.parse(m['started_at'] as String),
        durationMinutes: m['duration_minutes'] as int,
        pagesFrom: m['pages_from'] as int,
        pagesTo: m['pages_to'] as int,
        createdAt: DateTime.parse(m['created_at'] as String),
        updatedAt: DateTime.parse(m['updated_at'] as String),
        notes: m['notes'] as String?,
      );

  Map<String, dynamic> _toMap(ReadingSession s) => {
        'id': s.id,
        'book_id': s.bookId,
        'started_at': s.startedAt.toIso8601String(),
        'duration_minutes': s.durationMinutes,
        'pages_from': s.pagesFrom,
        'pages_to': s.pagesTo,
        'notes': s.notes,
        'created_at': s.createdAt.toIso8601String(),
        'updated_at': s.updatedAt.toIso8601String(),
      };
}
