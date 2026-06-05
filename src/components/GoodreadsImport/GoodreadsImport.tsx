import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AutoStories } from '@mui/icons-material';
import { getAllBooks } from '../../repositories/bookRepository';
import { addBook } from '../../repositories/bookRepository';
import { saveRating } from '../../repositories/ratingRepository';
import { parseRSSShelf, extractUserId, type GoodreadsBookRaw } from '../../utils/goodreadsParser';

interface ImportPreview {
  books: GoodreadsBookRaw[];
  totalFound: number;
  duplicates: number;
  byStatus: { read: number; reading: number; toRead: number };
}

type Phase = 'idle' | 'loading' | 'preview' | 'importing' | 'done';

interface Props {
  open: boolean;
  onClose: () => void;
}

async function fetchShelf(userId: string, shelf: string): Promise<string> {
  const res = await fetch(`/api/goodreads?userId=${userId}&shelf=${encodeURIComponent(shelf)}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to fetch "${shelf}" shelf`);
  }
  const text = await res.text();
  // If Vite dev server serves index.html instead of XML, the API is not available locally.
  if (text.trimStart().toLowerCase().startsWith('<!doctype') ||
      text.trimStart().toLowerCase().startsWith('<html')) {
    throw new Error(
      'Goodreads import requires the deployed app. Run `vercel dev` locally or use the production URL.'
    );
  }
  return text;
}

export function GoodreadsImport({ open, onClose }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);

  const handleClose = () => {
    if (phase === 'importing') return;
    setPhase('idle');
    setPreview(null);
    setError(null);
    setUrlInput('');
    onClose();
  };

  const handleLoad = async () => {
    const userId = extractUserId(urlInput);
    if (!userId) {
      setError('Enter a valid Goodreads profile URL or numeric user ID.');
      return;
    }

    setPhase('loading');
    setError(null);

    try {
      const [readXml, readingXml, toReadXml] = await Promise.all([
        fetchShelf(userId, 'read'),
        fetchShelf(userId, 'currently-reading'),
        fetchShelf(userId, 'to-read'),
      ]);

      const allBooks: GoodreadsBookRaw[] = [
        ...parseRSSShelf(readXml, 'read'),
        ...parseRSSShelf(readingXml, 'currently-reading'),
        ...parseRSSShelf(toReadXml, 'to-read'),
      ].filter(b => b.title);

      const existing = await getAllBooks();
      const existingKeys = new Set(
        existing.map(b => `${b.title.trim().toLowerCase()}|||${b.author.trim().toLowerCase()}`)
      );

      const newBooks = allBooks.filter(
        b => !existingKeys.has(`${b.title.trim().toLowerCase()}|||${b.author.trim().toLowerCase()}`)
      );

      setPreview({
        books: newBooks,
        totalFound: allBooks.length,
        duplicates: allBooks.length - newBooks.length,
        byStatus: {
          read: newBooks.filter(b => b.status === 'FINISHED').length,
          reading: newBooks.filter(b => b.status === 'READING').length,
          toRead: newBooks.filter(b => b.status === 'WANT_TO_READ').length,
        },
      });
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach Goodreads. Try again.');
      setPhase('idle');
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setPhase('importing');
    setImportedCount(0);
    setTotalToImport(preview.books.length);

    let count = 0;
    for (const book of preview.books) {
      const isFinished = book.status === 'FINISHED';
      const bookId = await addBook({
        title: book.title,
        author: book.author,
        status: book.status,
        cover: book.cover,
        currentProgress: isFinished ? 100 : 0,
        year: book.year,
        totalPages: book.totalPages,
        currentPage: isFinished && book.totalPages ? book.totalPages : undefined,
        genres: [],
      });

      if (book.userRating && bookId) {
        await saveRating({ bookId, stars: book.userRating, ratedAt: Date.now() });
      }

      count++;
      setImportedCount(count);
    }

    setPhase('done');
    setTimeout(() => handleClose(), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="goodreads-import-title"
    >
      <DialogTitle id="goodreads-import-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoStories fontSize="small" />
        Import from Goodreads
      </DialogTitle>

      <DialogContent>
        {phase === 'idle' || phase === 'loading' ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Goodreads profile URL or user ID"
              placeholder="https://www.goodreads.com/user/show/12345678"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && phase === 'idle' && handleLoad()}
              fullWidth
              size="small"
              disabled={phase === 'loading'}
              helperText="Your profile must be public"
            />
            {error && <Alert severity="error">{error}</Alert>}
            {phase === 'loading' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Fetching your Goodreads shelves…
                </Typography>
              </Box>
            )}
          </Stack>
        ) : phase === 'preview' && preview ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {preview.totalFound === 0 ? (
              <Alert severity="warning">
                No books found. Check that your user ID is correct and your Goodreads profile
                is set to public.
              </Alert>
            ) : (
              <>
                <Typography variant="body2">
                  Found <strong>{preview.totalFound}</strong> book
                  {preview.totalFound !== 1 ? 's' : ''} on your Goodreads shelves.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <StatChip label="Read" count={preview.byStatus.read} />
                  <StatChip label="Reading" count={preview.byStatus.reading} />
                  <StatChip label="To Read" count={preview.byStatus.toRead} />
                  <StatChip label="Already in library" count={preview.duplicates} muted />
                </Box>
                {preview.books.length === 0 && preview.duplicates > 0 && (
                  <Alert severity="info">All books are already in your library.</Alert>
                )}
              </>
            )}
          </Stack>
        ) : phase === 'importing' ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Importing book {importedCount} of {totalToImport}…
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalToImport > 0 ? (importedCount / totalToImport) * 100 : 0}
            />
          </Stack>
        ) : phase === 'done' ? (
          <Alert severity="success">
            Successfully imported {importedCount} book{importedCount !== 1 ? 's' : ''}!
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions>
        {(phase === 'idle' || phase === 'loading') && (
          <>
            <Button onClick={handleClose} disabled={phase === 'loading'}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleLoad}
              disabled={phase === 'loading' || !urlInput.trim()}
            >
              Load Books
            </Button>
          </>
        )}
        {phase === 'preview' && preview && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={preview.books.length === 0}
            >
              Import {preview.books.length} book{preview.books.length !== 1 ? 's' : ''}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function StatChip({ label, count, muted = false }: { label: string; count: number; muted?: boolean }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: muted ? 'divider' : 'primary.light',
        borderRadius: 2,
        px: 1.5,
        py: 1,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color={muted ? 'text.disabled' : 'primary.main'} sx={{ lineHeight: 1 }}>
        {count}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
