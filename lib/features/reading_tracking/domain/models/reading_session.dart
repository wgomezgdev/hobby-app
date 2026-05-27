import 'package:freezed_annotation/freezed_annotation.dart';

part 'reading_session.freezed.dart';
part 'reading_session.g.dart';

@freezed
class ReadingSession with _$ReadingSession {
  const factory ReadingSession({
    required String id,
    required String bookId,
    required DateTime startedAt,
    required int durationMinutes,
    required int pagesFrom,
    required int pagesTo,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? notes,
  }) = _ReadingSession;

  factory ReadingSession.fromJson(Map<String, dynamic> json) =>
      _$ReadingSessionFromJson(json);
}
