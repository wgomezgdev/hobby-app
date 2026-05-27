import 'package:hobby_app/core/database/database_provider.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'library_providers.g.dart';

@riverpod
Stream<List<Book>> booksByStatus(
  BooksByStatusRef ref,
  BookStatus status,
) =>
    ref.watch(bookRepositoryProvider).watchByStatus(status);
