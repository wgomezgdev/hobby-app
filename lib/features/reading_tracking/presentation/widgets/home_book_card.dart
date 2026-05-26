import 'package:flutter/material.dart';
import 'package:hobby_app/core/widgets/book_cover_block.dart';
import 'package:hobby_app/features/reading_tracking/domain/models/book.dart';

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
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BookCoverBlock(
              title: book.title,
              paletteIndex: book.paletteIndex,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    book.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleMedium,
                  ),
                  Text(
                    book.author,
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(value: book.progress),
                  const SizedBox(height: 4),
                  Text(
                    book.progressLabel,
                    style: theme.textTheme.labelSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    book.lastReadLabel,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: book.isLastReadOverdue
                          ? scheme.error
                          : scheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton(
                          onPressed: onLogSession,
                          child: const Text('Log'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: onAddQuote,
                          child: const Text('Quote'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
