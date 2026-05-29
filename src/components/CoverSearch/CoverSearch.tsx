import { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, IconButton, ImageList, ImageListItem,
  InputAdornment, TextField, Typography,
} from '@mui/material';
import { Close, ImageSearch, SearchOutlined } from '@mui/icons-material';

interface Props {
  title: string;
  author: string;
  onSelect: (url: string) => void;
}

interface OLDoc {
  cover_i?: number;
  title?: string;
}

export function CoverSearch({ title, author, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OLDoc[]>([]);
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
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(false);
    setResults([]);
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&fields=cover_i,title&limit=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const withCovers = (data.docs as OLDoc[]).filter(d => d.cover_i);
      setResults(withCovers);
    } catch (e) {
      console.error('[CoverSearch] fetch failed:', e);
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (coverId: number) => {
    onSelect(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
    handleClose();
  };

  return (
    <>
      <Button
        startIcon={<ImageSearch />}
        variant="outlined"
        size="small"
        onClick={handleOpen}
      >
        Search cover online
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Search book cover
          <IconButton onClick={handleClose} size="small" aria-label="Close">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
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
                  key={r.cover_i}
                  onClick={() => handleSelect(r.cover_i!)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    '&:hover': { borderColor: 'primary.main', opacity: 0.85 },
                  }}
                >
                  <img
                    src={`https://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg`}
                    alt={r.title ?? 'Book cover'}
                    loading="lazy"
                    style={{ display: 'block', width: '100%' }}
                  />
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
