import 'package:drift/drift.dart';

@DataClassName('BookRow')
class BooksTable extends Table {
  @override
  String get tableName => 'books';

  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get title => text()();
  TextColumn get author => text()();
  IntColumn get totalPages => integer()();
  TextColumn get status =>
      text().withDefault(const Constant('want_to_read'))();
  TextColumn get coverUri => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
