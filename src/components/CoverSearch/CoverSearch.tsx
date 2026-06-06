import { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, IconButton, ImageList, ImageListItem,
  InputAdornment, TextField, Typography,
} from '@mui/material';
import { Close, ImageSearch, SearchOutlined } from '@mui/icons-material';
import { fetchGoogleBooks, fetchOpenLibrary } from '../../utils/coverSearch';

interface Props {
  title: string;
  author: string;
  onSelect: (url: string) => void;
}

interface BookResult {
  id: string;
  title: string;
  thumbnail: string;
  fullUrl: string;
}

// --- Component ---

export function CoverSearch({ title, author, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BookResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  const handleOpen = () => {
    setQuery(`${title} ${author}`.trim());
    setResults([]);
    setSearched(false);
    setError(false);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    setError(false);
    setResults([]);

    // Try Google Books; on any failure fall through to Open Library
    try {
      const books = await fetchGoogleBooks(q);
      if (books.length > 0) {
        setResults(books);
        setLoading(false);
        return;
      }
    } catch {
      // quota / network — continue to fallback
    }

    // Open Library fallback — uses the same query the user typed
    try {
      setResults(await fetchOpenLibrary(q));
    } catch (e) {
      console.error('[CoverSearch] both sources failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button startIcon={<ImageSearch />} variant="outlined" size="small" onClick={handleOpen}>
        Search cover online
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Search book cover
          <IconButton onClick={handleClose} size="small" aria-label="Close"><Close /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth size="small"
              placeholder="Book title or author…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search(); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
            <Button variant="contained" onClick={search} disabled={!query.trim() || loading}>
              Search
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Typography color="error" textAlign="center" py={4}>
              Search failed. Check your connection and try again.
            </Typography>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No covers found. Try a different title or author.
            </Typography>
          )}

          {!loading && results.length > 0 && (
            <ImageList cols={3} gap={8}>
              {results.map(r => (
                <ImageListItem
                  key={r.id}
                  onClick={() => { onSelect(r.fullUrl); handleClose(); }}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    '&:hover': { borderColor: 'primary.main', opacity: 0.85 },
                  }}
                >
                  <img src={r.thumbnail} alt={r.title} loading="lazy" style={{ display: 'block', width: '100%' }} />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {!searched && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Enter a title or author and press Search.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
