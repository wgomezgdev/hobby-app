import 'package:hobby_app/features/library/domain/models/book.dart';

abstract interface class BookRepository {
  Stream<List<Book>> watchAll();
  Stream<List<Book>> watchByStatus(BookStatus status);
  Future<Book?> getById(String id);
  Future<void> save(Book book);
  Future<void> delete(String id);
}
