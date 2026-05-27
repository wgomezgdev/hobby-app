import 'package:freezed_annotation/freezed_annotation.dart';

part 'book.freezed.dart';
part 'book.g.dart';

enum BookStatus {
  @JsonValue('want_to_read')
  wantToRead,
  @JsonValue('reading')
  reading,
  @JsonValue('finished')
  finished,
}

@freezed
class Book with _$Book {
  const factory Book({
    required String id,
    required String userId,
    required String title,
    required String author,
    required int totalPages,
    required BookStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? coverUri,
  }) = _Book;

  factory Book.fromJson(Map<String, dynamic> json) => _$BookFromJson(json);
}
