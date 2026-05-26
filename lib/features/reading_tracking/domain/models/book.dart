import 'package:freezed_annotation/freezed_annotation.dart';

part 'book.freezed.dart';

enum BookStatus { wantToRead, reading, finished }

@freezed
class Book with _$Book {
  const factory Book({
    required String id,
    required String title,
    required String author,
    required int totalPages,
    required int currentPage,
    required int paletteIndex,
    DateTime? lastReadAt,
    @Default(BookStatus.reading) BookStatus status,
  }) = _Book;

  const Book._();

  double get progress => currentPage / totalPages;

  String get progressLabel {
    final pct = (progress * 100).toStringAsFixed(0);
    return '$pct% complete · p. $currentPage / $totalPages';
  }

  String get lastReadLabel {
    if (lastReadAt == null) return 'Not started';
    final diff = DateTime.now().difference(lastReadAt!).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    return '$diff days ago';
  }

  bool get isLastReadOverdue {
    if (lastReadAt == null) return false;
    return DateTime.now().difference(lastReadAt!).inDays > 3;
  }
}
