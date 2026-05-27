import 'package:hobby_app/features/quotes/domain/models/quote.dart';

abstract interface class QuoteRepository {
  Stream<List<Quote>> watchByBook(String bookId);
  Stream<List<Quote>> watchFavorites();
  Future<List<Quote>> search(String query);
  Future<void> save(Quote quote);
  Future<void> delete(String id);
}
