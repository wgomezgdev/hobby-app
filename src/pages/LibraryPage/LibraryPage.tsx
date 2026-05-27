import { useMemo } from 'react';
import {
  Box, Chip, Fab, Grid, MenuItem, Select, Stack, Typography, FormControl, InputLabel,
} from '@mui/material';
import { Add, MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAllBooks } from '../../hooks/useBooks';
import { useLibraryUiStore, type FilterValue, type SortValue } from '../../stores/libraryUiStore';
import { BookCard } from '../../components/BookCard/BookCard';
import { SkeletonCard } from '../../components/SkeletonCard/SkeletonCard';
import type { Book } from '../../types/entities';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reading', value: 'READING' },
  { label: 'Want to Read', value: 'WANT_TO_READ' },
  { label: 'Finished', value: 'FINISHED' },
];

function applyFilterAndSort(books: Book[], filter: FilterValue, sort: SortValue): Book[] {
  const filtered = filter === 'all' ? books : books.filter((b) => b.status === filter);
  return [...filtered].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'author') return a.author.localeCompare(b.author);
    return b.createdAt - a.createdAt;
  });
}

export function LibraryPage() {
  const navigate = useNavigate();
  const allBooks = useAllBooks();
  const { filter, sort, setFilter, setSort } = useLibraryUiStore();

  const books = useMemo(
    () => (allBooks ? applyFilterAndSort(allBooks, filter, sort) : undefined),
    [allBooks, filter, sort]
  );

  return (
    <Box sx={{ position: 'relative', pb: 10 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            onClick={() => setFilter(f.value)}
            color={filter === f.value ? 'primary' : 'default'}
            variant={filter === f.value ? 'filled' : 'outlined'}
          />
        ))}
        <FormControl size="small" sx={{ ml: 'auto', minWidth: 140 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            value={sort}
            label="Sort"
            onChange={(e) => setSort(e.target.value as SortValue)}
          >
            <MenuItem value="recent">Recent</MenuItem>
            <MenuItem value="title">Title A–Z</MenuItem>
            <MenuItem value="author">Author A–Z</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {books === undefined ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <MenuBook sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {filter === 'all' ? 'Your library is empty' : `No ${filter.toLowerCase().replace('_', ' ')} books`}
          </Typography>
          {filter === 'all' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add your first book to get started
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={3} key={book.id}>
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="Add book"
        onClick={() => navigate('/books/new')}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
