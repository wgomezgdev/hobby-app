import 'package:freezed_annotation/freezed_annotation.dart';

part 'async_state.freezed.dart';

/// Sealed async state union used by all Riverpod notifiers.
/// Build with: dart run build_runner build
@freezed
sealed class AsyncState<T> with _$AsyncState<T> {
  const factory AsyncState.idle() = AsyncStateIdle<T>;
  const factory AsyncState.loading() = AsyncStateLoading<T>;
  const factory AsyncState.success(T data) = AsyncStateSuccess<T>;
  const factory AsyncState.error(
    String message, [
    StackTrace? stackTrace,
  ]) = AsyncStateError<T>;
}
