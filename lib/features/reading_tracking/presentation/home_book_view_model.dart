import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/reading_tracking/domain/models/reading_session.dart';

class HomeBookViewModel {
  const HomeBookViewModel(this.book, this.latestSession);

  final Book book;
  final ReadingSession? latestSession;

  int get paletteIndex => book.id.hashCode.abs() % 3;

  double get progress {
    if (latestSession == null || book.totalPages == 0) return 0;
    final ratio = latestSession!.pagesTo / book.totalPages;
    if (ratio < 0) return 0;
    if (ratio > 1) return 1;
    return ratio;
  }

  String get progressLabel {
    if (latestSession == null) return 'Not started';
    final pct = (progress * 100).toStringAsFixed(0);
    return '$pct% complete · p. ${latestSession!.pagesTo} / ${book.totalPages}';
  }

  String get lastReadLabel {
    if (latestSession == null) return 'Not started';
    final diff = DateTime.now().difference(latestSession!.startedAt).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    return '$diff days ago';
  }

  bool get isLastReadOverdue {
    if (latestSession == null) return false;
    return DateTime.now().difference(latestSession!.startedAt).inDays > 3;
  }
}
