import 'package:drift/drift.dart';
import 'package:hobby_app/core/database/tables/books_table.dart';

@DataClassName('QuoteRow')
class QuotesTable extends Table {
  @override
  String get tableName => 'quotes';

  TextColumn get id => text()();
  TextColumn get bookId =>
      text().references(BooksTable, #id, onDelete: KeyAction.cascade)();
  // Dart getter 'body' maps to DB column 'text' to match the Supabase schema.
  TextColumn get body => text().named('text')();
  // stored as JSON array: '["tag1","tag2"]'
  TextColumn get tags => text().withDefault(const Constant('[]'))();
  BoolColumn get isFavorite => boolean().withDefault(const Constant(false))();
  IntColumn get pageNumber => integer().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
