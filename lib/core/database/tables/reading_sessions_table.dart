import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/tables/books_table.dart';

@DataClassName('ReadingSessionRow')
class ReadingSessionsTable extends Table {
  @override
  String get tableName => 'reading_sessions';

  TextColumn get id => text()();
  TextColumn get bookId =>
      text().references(BooksTable, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get startedAt => dateTime()();
  IntColumn get durationMinutes => integer()();
  IntColumn get pagesFrom => integer()();
  IntColumn get pagesTo => integer()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
