import 'package:flutter/material.dart';
import 'package:hobby_app/core/theme/app_colors.dart';
import 'package:hobby_app/core/widgets/book_cover_block.dart';
import 'package:hobby_app/features/reading_tracking/domain/models/book.dart';

/// Card showing a currently-reading book with progress and quick actions.
class HomeBookCard extends StatelessWidget {
  const HomeBookCard({
    required this.book,
    this.onLogSession,
    this.onAddQuote,
    super.key,
  });

  final Book book;
  final VoidCallback? onLogSession;
  final VoidCallback? onAddQuote;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 168,
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _CoverColumn(book: book),
              const SizedBox(width: 16),
              Expanded(child: _InfoColumn(book: book, scheme: scheme)),
            ],
          ),
        ),
      ),
    );
  }
}

class _CoverColumn extends StatelessWidget {
  const _CoverColumn({required this.book});

  final Book book;

  @override
  Widget build(BuildContext context) {
    final labelColor =
        book.isLastReadOverdue ? AppColors.amber : Colors.white;
    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        BookCoverBlock(
          title: book.title,
          paletteIndex: book.paletteIndex,
        ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 3),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black54],
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: Text(
              book.lastReadLabel,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, color: labelColor),
            ),
          ),
        ),
      ],
    );
  }
}

class _InfoColumn extends StatelessWidget {
  const _InfoColumn({required this.book, required this.scheme});

  final Book book;
  final ColorScheme scheme;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          book.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: scheme.onSurface,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          book.author,
          style: TextStyle(
            fontSize: 12,
            color: scheme.onSurfaceVariant,
          ),
        ),
        const Spacer(),
        _ProgressBar(progress: book.progress, scheme: scheme),
        const SizedBox(height: 4),
        Text(
          book.progressLabel,
          style: TextStyle(
            fontSize: 11,
            color: scheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 8),
        _ActionRow(scheme: scheme),
      ],
    );
  }
}

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({
    required this.progress,
    required this.scheme,
  });

  final double progress;
  final ColorScheme scheme;

  static const _milestones = [0.25, 0.50, 0.75];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        return SizedBox(
          height: 8,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Track
              Container(
                decoration: BoxDecoration(
                  color: scheme.primaryContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              // Fill
              FractionallySizedBox(
                widthFactor: progress.clamp(0.0, 1.0),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4B3D8F), Color(0xFF7060B8)],
                    ),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
              // Milestone diamonds
              for (final m in _milestones)
                if (progress >= m)
                  Positioned(
                    left: width * m - 6,
                    top: -2,
                    child: Transform.rotate(
                      angle: 0.785398, // 45°
                      child: Container(
                        width: 8,
                        height: 8,
                        color: Colors.white,
                      ),
                    ),
                  ),
            ],
          ),
        );
      },
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({required this.scheme});

  final ColorScheme scheme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 48,
            child: TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                backgroundColor: scheme.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: EdgeInsets.zero,
              ),
              child: Text(
                '📝 Log',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: scheme.onPrimary,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: SizedBox(
            height: 48,
            child: TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                backgroundColor: scheme.primaryContainer,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: EdgeInsets.zero,
              ),
              child: Text(
                '❝ Quote',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: scheme.onPrimaryContainer,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
