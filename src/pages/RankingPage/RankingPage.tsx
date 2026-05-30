import { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAllRatings } from '../../hooks/useRatings';
import { useAllBooks } from '../../hooks/useBooks';
import { StarRating } from '../../components/StarRating/StarRating';
import { SkeletonCard } from '../../components/SkeletonCard/SkeletonCard';
import type { Book, Rating } from '../../types/entities';

type View = 'stars' | 'recent';

interface RankedEntry {
  book: Book;
  rating?: Rating;
}

export function RankingPage() {
  const ratings = useAllRatings();
  const books = useAllBooks();
  const [view, setView] = useState<View>('stars');

  const ranked = useMemo((): RankedEntry[] | undefined => {
    if (!ratings || !books) return undefined;
    const ratingMap = new Map(ratings.map((r) => [r.bookId, r]));

    if (view === 'stars') {
      return ratings
        .map((r) => ({ rating: r, book: books.find((b) => b.id === r.bookId) }))
        .filter((p): p is RankedEntry & { rating: Rating } => !!p.book)
        .sort((a, b) => b.rating.stars - a.rating.stars);
    }

    return books
      .filter((b) => b.status === 'FINISHED')
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((book) => ({ book, rating: ratingMap.get(book.id!) }));
  }, [ratings, books, view]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Ranking</Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => { if (v) setView(v); }}
          size="small"
        >
          <ToggleButton value="stars">By Stars</ToggleButton>
          <ToggleButton value="recent">Recently Finished</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {ranked === undefined ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}><SkeletonCard /></Grid>
          ))}
        </Grid>
      ) : ranked.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <MenuBook sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography color="text.secondary">
            {view === 'stars' ? 'Rate some books to see your ranking' : 'No finished books yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <Link to="/">Go to your library</Link>
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {ranked.map(({ book, rating }, idx) => (
            <Grid item xs={12} sm={6} md={3} key={book.id}>
              <Card
                component={Link}
                to={`/books/${book.id}?tab=rating`}
                sx={{ textDecoration: 'none', height: '100%', display: 'block' }}
              >
                {book.cover ? (
                  <Box
                    component="img"
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <Box sx={{ height: 160, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MenuBook sx={{ fontSize: 48, color: 'grey.400' }} />
                  </Box>
                )}
                <CardContent>
                  <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      #{idx + 1}
                    </Typography>
                    {rating
                      ? <StarRating value={rating.stars} readOnly />
                      : <Typography variant="caption" color="text.disabled">Not rated</Typography>
                    }
                  </Stack>
                  <Typography variant="subtitle2" noWrap>{book.title}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{book.author}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
