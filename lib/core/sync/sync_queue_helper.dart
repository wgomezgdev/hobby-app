import 'dart:convert';

import 'package:hobby_app/core/database/app_database.dart';

class SyncQueueHelper {
  SyncQueueHelper(this._db);

  final AppDatabase _db;

  Future<void> enqueue({
    required String entityType,
    required String entityId,
    required String operation,
    required Map<String, dynamic> payload,
  }) async {
    await _db.into(_db.syncQueueTable).insert(
          SyncQueueTableCompanion.insert(
            entityType: entityType,
            entityId: entityId,
            operation: operation,
            payload: jsonEncode(payload),
            nextRetryAt: DateTime.now().millisecondsSinceEpoch,
            createdAt: DateTime.now().millisecondsSinceEpoch,
          ),
        );
  }
}
