import 'package:freezed_annotation/freezed_annotation.dart';

part 'quote.freezed.dart';
part 'quote.g.dart';

@freezed
class Quote with _$Quote {
  const factory Quote({
    required String id,
    required String bookId,
    required String text,
    required List<String> tags,
    required bool isFavorite,
    required DateTime createdAt,
    required DateTime updatedAt,
    int? pageNumber,
  }) = _Quote;

  factory Quote.fromJson(Map<String, dynamic> json) => _$QuoteFromJson(json);
}
