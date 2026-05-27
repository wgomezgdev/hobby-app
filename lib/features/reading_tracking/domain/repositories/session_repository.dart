import 'package:hobby_app/features/reading_tracking/domain/models/reading_session.dart';

abstract interface class SessionRepository {
  Stream<List<ReadingSession>> watchByBook(String bookId);
  Future<ReadingSession?> getLatestForBook(String bookId);
  Future<List<DateTime>> getDistinctSessionDates();
  Future<void> save(ReadingSession session);
  Future<void> delete(String id);
}
