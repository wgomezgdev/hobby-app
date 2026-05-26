import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hobby_app/core/theme/app_colors.dart';
import 'package:hobby_app/core/widgets/streak_ring.dart';
import 'package:hobby_app/features/reading_tracking/presentation/providers/home_providers.dart';
import 'package:hobby_app/features/reading_tracking/presentation/widgets/home_book_card.dart';
import 'package:hobby_app/features/reading_tracking/presentation/widgets/home_header.dart';

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
    _scrollController = ScrollController()
      ..addListener(_onScroll);
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
    final books = ref.watch(currentlyReadingBooksProvider);
    final streak = ref.watch(readingStreakProvider);

    if (books.isEmpty) {
      return _EmptyState(streak: streak);
    }

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverToBoxAdapter(child: HomeHeader(streak: streak)),
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 20, 16, 4),
              child: Text(
                'Currently Reading',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                child: HomeBookCard(book: books[index]),
              ),
              childCount: books.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 96)),
        ],
      ),
      floatingActionButton: _buildFab(context),
    );
  }

  Widget _buildFab(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(28),
    );
    if (_isFabExtended) {
      return FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: scheme.primary,
        shape: shape,
        icon: Icon(Icons.add, color: scheme.onPrimary),
        label: Text(
          'Log Session',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: scheme.onPrimary,
          ),
        ),
      );
    }
    return FloatingActionButton(
      onPressed: () {},
      backgroundColor: scheme.primary,
      shape: shape,
      child: Icon(Icons.add, color: scheme.onPrimary),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.streak});

  final int streak;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final topPadding = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: scheme.surface,
      body: Column(
        children: [
          // Header without streak ring
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.headerGradient,
            ),
            child: Padding(
              padding: EdgeInsets.only(top: topPadding),
              child: SizedBox(
                height: 148,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _greeting,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Wilson',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (streak > 0) StreakRing(streak: streak),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _BookStackIllustration(scheme: scheme),
                    const SizedBox(height: 24),
                    Text(
                      'Start your reading journey',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: scheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Add a book and log your first session.\n'
                      'Your library and streak start here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: scheme.onSurfaceVariant,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: 220,
                      height: 52,
                      child: FilledButton(
                        onPressed: () {},
                        style: FilledButton.styleFrom(
                          shape: const StadiumBorder(),
                        ),
                        child: const Text(
                          '＋ Add your first book',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}

class _BookStackIllustration extends StatelessWidget {
  const _BookStackIllustration({required this.scheme});

  final ColorScheme scheme;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      height: 180,
      decoration: BoxDecoration(
        color: scheme.primaryContainer,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Transform.rotate(
            angle: -0.15,
            child: const _Spine(color: Color(0xFF4B3D8F)),
          ),
          Transform.rotate(
            angle: 0.05,
            child: const _Spine(color: Color(0xFF1A6B9A)),
          ),
          const _Spine(color: Color(0xFFB05B00)),
        ],
      ),
    );
  }
}

class _Spine extends StatelessWidget {
  const _Spine({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 110,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(6),
      ),
    );
  }
}
