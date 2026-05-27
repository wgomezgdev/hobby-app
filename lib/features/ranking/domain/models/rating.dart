import 'package:freezed_annotation/freezed_annotation.dart';

part 'rating.freezed.dart';
part 'rating.g.dart';

@freezed
class Rating with _$Rating {
  const factory Rating({
    required String id,
    required String bookId,
    required int stars,
    required DateTime ratedAt,
    required DateTime updatedAt,
    String? review,
  }) = _Rating;

  factory Rating.fromJson(Map<String, dynamic> json) => _$RatingFromJson(json);
}
