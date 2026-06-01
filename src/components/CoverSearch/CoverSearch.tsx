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

interface BookResult {
  id: string;
  title: string;
  thumbnail: string;
  fullUrl: string;
}

// --- Google Books ---

function parseGoogleBooks(data: { items?: unknown[] }): BookResult[] {
  if (!Array.isArray(data.items)) return [];
  return data.items
    .filter((item): item is {
      id: string;
      volumeInfo: { title?: string; imageLinks?: { thumbnail?: string; smallThumbnail?: string } };
    } => {
      const v = (item as { volumeInfo?: { imageLinks?: Record<string, string> } }).volumeInfo;
      return !!(v?.imageLinks?.thumbnail ?? v?.imageLinks?.smallThumbnail);
    })
    .map(item => {
      const raw = (item.volumeInfo.imageLinks!.thumbnail ?? item.volumeInfo.imageLinks!.smallThumbnail)!
        .replace('http://', 'https://');
      return {
        id: item.id,
        title: item.volumeInfo.title ?? '',
        thumbnail: raw,
        fullUrl: raw.replace('zoom=1', 'zoom=0').replace('zoom=5', 'zoom=0').replace('&edge=curl', ''),
      };
    });
}

async function fetchGoogleBooks(query: string): Promise<BookResult[]> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string | undefined;
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : '';
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20${keyParam}`
  );
  if (!res.ok) throw new Error(`gbooks:${res.status}`);
  return parseGoogleBooks(await res.json());
}

// --- Open Library fallback ---

interface OLDoc { cover_i?: number; title?: string }

function parseOpenLibrary(data: { docs?: OLDoc[] }): BookResult[] {
  return (data.docs ?? [])
    .filter(d => d.cover_i)
    .map(d => {
      const base = `https://covers.openlibrary.org/b/id/${d.cover_i}`;
      return {
        id: String(d.cover_i),
        title: d.title ?? '',
        thumbnail: `${base}-M.jpg`,
        fullUrl: `${base}-L.jpg`,
      };
    });
}

async function fetchOpenLibrary(title: string, author: string): Promise<BookResult[]> {
  const params = new URLSearchParams({ fields: 'cover_i,title', limit: '20' });
  if (title) params.set('title', title);
  if (author) params.set('author', author);
  if (!title && !author) params.set('q', title + ' ' + author);
  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!res.ok) throw new Error(`ol:${res.status}`);
  return parseOpenLibrary(await res.json());
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
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(false);
    setResults([]);
    try {
      let books = await fetchGoogleBooks(query.trim()).catch(() => null);
      if (!books || books.length === 0) {
        books = await fetchOpenLibrary(title, author);
      }
      setResults(books);
    } catch (e) {
      console.error('[CoverSearch]', e);
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
