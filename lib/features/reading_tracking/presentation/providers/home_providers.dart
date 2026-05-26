import 'package:hobby_app/features/reading_tracking/domain/models/book.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'home_providers.g.dart';

@riverpod
List<Book> currentlyReadingBooks(CurrentlyReadingBooksRef ref) {
  return [
    Book(
      id: '1',
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      totalPages: 662,
      currentPage: 448,
      paletteIndex: 0,
      lastReadAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    Book(
      id: '2',
      title: 'Dune',
      author: 'Frank Herbert',
      totalPages: 412,
      currentPage: 123,
      paletteIndex: 2,
      lastReadAt: DateTime.now().subtract(const Duration(days: 5)),
    ),
  ];
}

@riverpod
int readingStreak(ReadingStreakRef ref) => 7;
