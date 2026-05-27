import { useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Fab, IconButton, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import { Add, Favorite, FavoriteBorder, Search } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useQuotesForBook, useTagsForBook } from '../../../hooks/useQuotes';
import { addQuote, toggleFavorite } from '../../../repositories/quoteRepository';
import { TagInput } from '../../../components/TagInput/TagInput';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';

interface QuotesTabProps {
  bookId: number;
}

interface QuoteFormData {
  text: string;
  pageNumber: string;
  tags: string[];
  isFavorite: boolean;
}

export function QuotesTab({ bookId }: QuotesTabProps) {
  const quotes = useQuotesForBook(bookId);
  const availableTags = useTagsForBook(bookId);
  const [search, setSearch] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } =
    useForm<QuoteFormData>({ defaultValues: { tags: [], isFavorite: false } });

  const onSubmit = async (data: QuoteFormData) => {
    await addQuote({
      bookId,
      text: data.text,
      pageNumber: data.pageNumber ? parseInt(data.pageNumber, 10) : undefined,
      tags: data.tags,
      isFavorite: data.isFavorite,
    });
    reset({ tags: [], isFavorite: false });
    setDialogOpen(false);
  };

  if (quotes === undefined) {
    return (
      <Box sx={{ py: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </Box>
    );
  }

  const allTags = availableTags ?? [];
  const filtered = quotes
    .filter((q) => !filterFavorite || q.isFavorite)
    .filter((q) => !filterTag || q.tags.includes(filterTag))
    .filter((q) => !search || q.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ py: 1, pb: 8 }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search quotes…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={filterFavorite ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            label="Favorites"
            onClick={() => setFilterFavorite((v) => !v)}
            color={filterFavorite ? 'error' : 'default'}
            variant={filterFavorite ? 'filled' : 'outlined'}
            size="small"
          />
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              color={filterTag === tag ? 'primary' : 'default'}
              variant={filterTag === tag ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
      </Stack>

      {quotes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No quotes saved yet</Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No quotes match your filters</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((q) => (
            <Box key={q.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', flexGrow: 1 }}>
                  "{q.text}"
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleFavorite(q.id!)}
                  aria-label={q.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {q.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Box>
              {q.pageNumber && (
                <Typography variant="caption" color="text.secondary">p. {q.pageNumber}</Typography>
              )}
              {q.tags.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                  {q.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <Fab
        color="primary"
        size="medium"
        aria-label="Add quote"
        onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-quote-title"
      >
        <DialogTitle id="add-quote-title">Add Quote</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Quote text"
                multiline
                rows={3}
                fullWidth
                required
                {...register('text', { required: 'Quote text is required' })}
                autoFocus
              />
              <TextField
                label="Page number (optional)"
                type="number"
                inputProps={{ min: 1 }}
                {...register('pageNumber')}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    suggestions={allTags}
                  />
                )}
              />
              <Controller
                name="isFavorite"
                control={control}
                render={({ field }) => (
                  <Chip
                    icon={field.value ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                    label="Mark as favorite"
                    onClick={() => field.onChange(!field.value)}
                    color={field.value ? 'error' : 'default'}
                    variant={field.value ? 'filled' : 'outlined'}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>Save Quote</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
