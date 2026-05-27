import 'package:drift/drift.dart';

@DataClassName('SyncQueueRow')
class SyncQueueTable extends Table {
  @override
  String get tableName => 'sync_queue';

  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityType => text()();
  TextColumn get entityId => text()();
  TextColumn get operation => text()();
  TextColumn get payload => text()();
  IntColumn get attemptCount => integer().withDefault(const Constant(0))();
  IntColumn get nextRetryAt => integer()();
  IntColumn get createdAt => integer()();
}
