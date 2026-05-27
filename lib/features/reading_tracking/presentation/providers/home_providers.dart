import 'package:hobby_app/core/database/database_provider.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/reading_tracking/presentation/home_book_view_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'home_providers.g.dart';

@riverpod
Stream<List<HomeBookViewModel>> currentlyReadingBooks(
  CurrentlyReadingBooksRef ref,
) async* {
  final bookRepo = ref.watch(bookRepositoryProvider);
  final sessionRepo = ref.watch(sessionRepositoryProvider);
  await for (final books in bookRepo.watchByStatus(BookStatus.reading)) {
    final sessions = await Future.wait(
      books.map((b) => sessionRepo.getLatestForBook(b.id)),
    );
    yield [
      for (var i = 0; i < books.length; i++)
        HomeBookViewModel(books[i], sessions[i]),
    ];
  }
}

@riverpod
Future<int> readingStreak(ReadingStreakRef ref) async {
  final sessionRepo = ref.watch(sessionRepositoryProvider);
  final dates = await sessionRepo.getDistinctSessionDates();
  return _computeStreak(dates);
}

int _computeStreak(List<DateTime> dates) {
  if (dates.isEmpty) return 0;
  final now = DateTime.now();
  final today = DateTime.utc(now.year, now.month, now.day);
  final yesterday = today.subtract(const Duration(days: 1));
  if (dates.first != today && dates.first != yesterday) return 0;
  var streak = 0;
  var expected = dates.first;
  for (final date in dates) {
    if (date == expected) {
      streak++;
      expected = expected.subtract(const Duration(days: 1));
    } else {
      break;
    }
  }
  return streak;
}
