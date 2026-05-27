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

type View = 'stars' | 'recent';

export function RankingPage() {
  const ratings = useAllRatings();
  const books = useAllBooks();
  const [view, setView] = useState<View>('stars');

  const ranked = useMemo(() => {
    if (!ratings || !books) return undefined;
    const bookMap = new Map(books.map((b) => [b.id!, b]));
    const pairs = ratings
      .map((r) => ({ rating: r, book: bookMap.get(r.bookId) }))
      .filter((p): p is { rating: typeof ratings[0]; book: NonNullable<typeof books[0]> } => !!p.book);

    if (view === 'stars') {
      return [...pairs].sort((a, b) => b.rating.stars - a.rating.stars);
    }
    return [...pairs]
      .filter((p) => p.book.status === 'FINISHED')
      .sort((a, b) => b.book.updatedAt - a.book.updatedAt);
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
                    <StarRating value={rating.stars} readOnly />
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
