import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import { AutoStories, FileUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getAllBooks, addBook } from '../../repositories/bookRepository';
import { saveRating } from '../../repositories/ratingRepository';
import { parseGoodreadsCSV, type GoodreadsBookRaw } from '../../utils/goodreadsParser';
import { fetchBookCover } from '../../utils/coverSearch';

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

export function GoodreadsImport({ open, onClose }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    setPhase('loading');
    setError(null);

    try {
      const text = await file.text();
      const allBooks = parseGoodreadsCSV(text).filter(b => b.title);

      if (allBooks.length === 0) {
        throw new Error(t('goodreads.errorEmpty'));
      }

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
      setError(err instanceof Error ? err.message : t('goodreads.errorParse'));
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
      const cover = book.cover ?? (await fetchBookCover(book.title, book.author)) ?? undefined;
      const bookId = await addBook({
        title: book.title,
        author: book.author,
        status: book.status,
        cover,
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
        {t('goodreads.title')}
      </DialogTitle>

      <DialogContent>
        {phase === 'idle' || phase === 'loading' ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('goodreads.instructions')}
            </Typography>
            <List dense disablePadding sx={{ pl: 1 }}>
              {[t('goodreads.step1'), t('goodreads.step2'), t('goodreads.step3')].map((step, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                  <Typography variant="body2">{i + 1}. {step}</Typography>
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={phase === 'loading'}
            >
              {t('goodreads.chooseFile')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleFileChange}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        ) : phase === 'preview' && preview ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">
              {t('goodreads.found', { count: preview.totalFound })}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <StatChip label={t('goodreads.statusRead')} count={preview.byStatus.read} />
              <StatChip label={t('goodreads.statusReading')} count={preview.byStatus.reading} />
              <StatChip label={t('goodreads.statusToRead')} count={preview.byStatus.toRead} />
              <StatChip label={t('goodreads.statusDuplicate')} count={preview.duplicates} muted />
            </Box>
            {preview.books.length === 0 && preview.duplicates > 0 && (
              <Alert severity="info">{t('goodreads.allDuplicate')}</Alert>
            )}
          </Stack>
        ) : phase === 'importing' ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('goodreads.importing', { current: importedCount, total: totalToImport })}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalToImport > 0 ? (importedCount / totalToImport) * 100 : 0}
            />
          </Stack>
        ) : phase === 'done' ? (
          <Alert severity="success">
            {t('goodreads.success', { count: importedCount })}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions>
        {(phase === 'idle' || phase === 'loading') && (
          <Button onClick={handleClose} disabled={phase === 'loading'}>
            {t('goodreads.cancel')}
          </Button>
        )}
        {phase === 'preview' && preview && (
          <>
            <Button onClick={handleClose}>{t('goodreads.cancel')}</Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={preview.books.length === 0}
            >
              {t('goodreads.importButton', { count: preview.books.length })}
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
