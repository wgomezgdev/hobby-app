import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hobby_app/core/database/database_provider.dart';
import 'package:hobby_app/core/widgets/book_cover_block.dart';
import 'package:hobby_app/features/library/domain/models/book.dart';
import 'package:hobby_app/features/library/presentation/providers/library_providers.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Library'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Reading'),
              Tab(text: 'To Read'),
              Tab(text: 'Finished'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _BookList(status: BookStatus.reading),
            _BookList(status: BookStatus.wantToRead),
            _BookList(status: BookStatus.finished),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.push('/library/add'),
          child: const Icon(Icons.add),
        ),
      ),
    );
  }
}

class _BookList extends ConsumerWidget {
  const _BookList({required this.status});

  final BookStatus status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booksAsync = ref.watch(booksByStatusProvider(status));
    return booksAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (books) {
        if (books.isEmpty) return _EmptyTab(status: status);
        return ListView.separated(
          itemCount: books.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final book = books[index];
            return Dismissible(
              key: ValueKey(book.id),
              direction: DismissDirection.endToStart,
              background: ColoredBox(
                color: Theme.of(context).colorScheme.error,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: Icon(
                      Icons.delete,
                      color: Theme.of(context).colorScheme.onError,
                    ),
                  ),
                ),
              ),
              onDismissed: (_) {
                ref.read(bookRepositoryProvider).delete(book.id).ignore();
              },
              child: _BookTile(book: book),
            );
          },
        );
      },
    );
  }
}

class _BookTile extends StatelessWidget {
  const _BookTile({required this.book});

  final Book book;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final paletteIndex = book.id.hashCode.abs() % 3;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: BookCoverBlock(
        title: book.title,
        paletteIndex: paletteIndex,
        width: 48,
        height: 64,
        borderRadius: 6,
      ),
      title: Text(
        book.title,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: theme.textTheme.titleSmall,
      ),
      subtitle: Text(
        '${book.author} · ${book.totalPages} pages',
        style: theme.textTheme.bodySmall,
      ),
    );
  }
}

class _EmptyTab extends StatelessWidget {
  const _EmptyTab({required this.status});

  final BookStatus status;

  static const _messages = {
    BookStatus.reading: 'No books in progress.\nStart reading something!',
    BookStatus.wantToRead:
        'Your reading list is empty.\nTap + to add books.',
    BookStatus.finished:
        "You haven't finished any books yet.\nKeep reading!",
  };

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          _messages[status] ?? '',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
