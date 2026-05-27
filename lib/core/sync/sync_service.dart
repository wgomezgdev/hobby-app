import 'dart:async';
import 'dart:convert';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/app_database.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SyncService {
  SyncService(this._db, this._client);

  final AppDatabase _db;
  final SupabaseClient _client;

  static const _maxAttempts = 5;
  static const _baseDelaySeconds = 30;

  StreamSubscription<List<ConnectivityResult>>? _sub;

  void start() {
    _sub = Connectivity()
        .onConnectivityChanged
        .listen((results) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline) _flush();
    });
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
  }

  Future<void> _flush() async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final pending = await (_db.select(_db.syncQueueTable)
          ..where(
            (t) =>
                t.attemptCount.isSmallerThanValue(_maxAttempts) &
                t.nextRetryAt.isSmallerOrEqualValue(now),
          )
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .get();

    for (final item in pending) {
      await _processItem(item);
    }
  }

  Future<void> _processItem(SyncQueueRow item) async {
    try {
      final payload = jsonDecode(item.payload) as Map<String, dynamic>;
      final table = _tableFor(item.entityType);

      if (item.operation == 'delete') {
        await _client.from(table).delete().eq('id', item.entityId);
      } else {
        await _client.from(table).upsert(payload);
      }

      await (_db.delete(_db.syncQueueTable)
            ..where((t) => t.id.equals(item.id)))
          .go();
    } catch (_) {
      final nextAttempt = item.attemptCount + 1;
      final delaySeconds = _baseDelaySeconds * (1 << nextAttempt);
      final nextRetry =
          DateTime.now().millisecondsSinceEpoch + delaySeconds * 1000;

      await (_db.update(_db.syncQueueTable)
            ..where((t) => t.id.equals(item.id)))
          .write(
        SyncQueueTableCompanion(
          attemptCount: Value(nextAttempt),
          nextRetryAt: Value(nextRetry),
        ),
      );
    }
  }

  static String _tableFor(String entityType) => switch (entityType) {
        'book' => 'books',
        'session' => 'reading_sessions',
        'quote' => 'quotes',
        'rating' => 'ratings',
        _ => throw ArgumentError('Unknown entity type: $entityType'),
      };
}
