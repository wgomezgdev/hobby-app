import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/tables/books_table.dart';

@DataClassName('RatingRow')
class RatingsTable extends Table {
  @override
  String get tableName => 'ratings';

  TextColumn get id => text()();
  TextColumn get bookId =>
      text().references(BooksTable, #id, onDelete: KeyAction.cascade)();
  IntColumn get stars => integer()();
  TextColumn get review => text().nullable()();
  DateTimeColumn get ratedAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
