import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hobby_app/features/auth/presentation/providers/auth_providers.dart';
import 'package:hobby_app/features/reading_tracking/presentation/providers/home_providers.dart';
import 'package:hobby_app/features/reading_tracking/presentation/widgets/home_book_card.dart';

String _greeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late final ScrollController _scrollController;
  bool _isFabExtended = true;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final extended = _scrollController.offset < 60;
    if (extended != _isFabExtended) {
      setState(() => _isFabExtended = extended);
    }
  }

  @override
  Widget build(BuildContext context) {
    final booksAsync = ref.watch(currentlyReadingBooksProvider);
    final streak = ref.watch(readingStreakProvider).valueOrNull ?? 0;
    final user = ref.watch(currentUserProvider);
    final displayName =
        (user?.userMetadata?['full_name'] as String?) ??
        (user?.userMetadata?['name'] as String?) ??
        'Reader';
    final firstName = displayName.split(' ').first;
    final books = booksAsync.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_greeting(), style: Theme.of(context).textTheme.labelMedium),
            Text(
              firstName,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          if (streak > 0) _StreakChip(streak: streak),
          const SizedBox(width: 8),
        ],
      ),
      body: booksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (bookList) => bookList.isEmpty
            ? _EmptyBody(onAddBook: () => context.go('/library'))
            : CustomScrollView(
                controller: _scrollController,
                slivers: [
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 16, 16, 4),
                      child: Text(
                        'Currently Reading',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => Padding(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                        child: HomeBookCard(viewModel: bookList[index]),
                      ),
                      childCount: bookList.length,
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 96)),
                ],
              ),
      ),
      floatingActionButton: (books != null && books.isNotEmpty)
          ? _isFabExtended
              ? FloatingActionButton.extended(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  label: const Text('Log Session'),
                )
              : FloatingActionButton(
                  onPressed: () {},
                  child: const Icon(Icons.add),
                )
          : null,
    );
  }
}

class _StreakChip extends StatelessWidget {
  const _StreakChip({required this.streak});

  final int streak;

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: const Icon(Icons.local_fire_department, size: 16),
      label: Text('$streak days'),
    );
  }
}

class _EmptyBody extends StatelessWidget {
  const _EmptyBody({required this.onAddBook});

  final VoidCallback onAddBook;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.menu_book_outlined,
              size: 80,
              color: scheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'Start your reading journey',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Add a book and log your first session.\n'
              'Your library and streak start here.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: onAddBook,
              child: const Text('Add your first book'),
            ),
          ],
        ),
      ),
    );
  }
}
