import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Skeleton, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { ArrowBack, DeleteOutlined, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBook } from '../../hooks/useBooks';
import { useSessionsForBook } from '../../hooks/useSessions';
import { deleteBook } from '../../repositories/bookRepository';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { ProgressTab } from './tabs/ProgressTab';
import { SessionsTab } from './tabs/SessionsTab';
import { QuotesTab } from './tabs/QuotesTab';
import { RatingTab } from './tabs/RatingTab';
import { calcPaceStats, formatDate } from '../../utils/readingPace';

const VALID_TABS = ['progress', 'sessions', 'quotes', 'rating'] as const;
type TabValue = typeof VALID_TABS[number];

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success'> = {
  WANT_TO_READ: 'default',
  READING: 'primary',
  FINISHED: 'success',
};

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id!, 10);
  const book = useBook(bookId);
  const sessions = useSessionsForBook(bookId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const tab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : 'progress';

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletedTitle, setDeletedTitle] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    const title = book?.title ?? 'Book';
    await deleteBook(bookId);
    setDeleteOpen(false);
    setDeletedTitle(title);
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: TabValue) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/')} aria-label={t('book.detail.backAria')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('book.detail.title')}</Typography>
        {book && (
          <>
            <Button
              startIcon={<Edit />}
              onClick={() => navigate(`/books/${bookId}/edit`)}
              size="small"
            >
              {t('book.detail.edit')}
            </Button>
            <IconButton
              onClick={() => setDeleteOpen(true)}
              aria-label={t('book.detail.deleteAria')}
              color="error"
            >
              <DeleteOutlined />
            </IconButton>
          </>
        )}
      </Box>

      {book === undefined ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={80} height={110} sx={{ borderRadius: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton width="70%" height={32} />
            <Skeleton width="50%" />
            <Skeleton width="30%" sx={{ mt: 1 }} />
            <Skeleton sx={{ mt: 1 }} />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {book.cover ? (
            <Box
              component="img"
              src={book.cover}
              alt={book.title}
              sx={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 80, height: 110, borderRadius: 1, bgcolor: 'background.paper',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            />
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {book.genres && book.genres.length > 0 && (
              <Chip label={t(`genre.${book.genres[0].replace(/\s/g, '_')}`).toUpperCase()} size="small" color="primary" sx={{ mb: 0.5, fontSize: '0.65rem' }} />
            )}
            <Typography variant="h6" noWrap>{book.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {book.author}{book.year ? ` · ${book.year}` : ''}
            </Typography>
            <Chip
              label={t(`book.status.${book.status}`)}
              color={STATUS_COLORS[book.status]}
              size="small"
              sx={{ mt: 0.5, mb: 1 }}
            />
            {book.currentPage != null && book.totalPages ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                {t('book.detail.pageOf', { current: book.currentPage, total: book.totalPages })}
              </Typography>
            ) : null}
            <ProgressBar value={book.currentProgress} />
          </Box>
        </Box>
      )}

      {book && sessions && sessions.length > 0 && (book.currentPage != null || book.totalPages) && (() => {
        const pace = calcPaceStats(sessions, book);
        const stats = [
          { icon: '📅', value: pace.startDate ? formatDate(pace.startDate) : '—', label: t('book.detail.pace.started') },
          { icon: '⏱', value: pace.daysReading > 0 ? t('book.detail.pace.daysValue', { days: pace.daysReading }) : '—', label: t('book.detail.pace.daysReading') },
          { icon: '🔥', value: pace.avgPacePerDay > 0 ? t('book.detail.pace.paceValue', { pace: pace.avgPacePerDay }) : '—', label: t('book.detail.pace.avgPace') },
          { icon: '🎯', value: pace.daysToFinish != null ? t('book.detail.pace.daysValue', { days: pace.daysToFinish }) : '—', label: t('book.detail.pace.toFinish') },
        ];
        return (
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {stats.map(s => (
              <Grid item xs={6} key={s.label}>
                <Card sx={{ p: 1.5 }}>
                  <Typography variant="body2">{s.icon} <strong>{s.value}</strong></Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      })()}

      <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label={t('book.detail.tabs.progress')} value="progress" />
        <Tab label={t('book.detail.tabs.sessions')} value="sessions" />
        <Tab label={t('book.detail.tabs.quotes')} value="quotes" />
        <Tab label={t('book.detail.tabs.rating')} value="rating" />
      </Tabs>

      {book && (
        <>
          {tab === 'progress' && <ProgressTab book={book} />}
          {tab === 'sessions' && <SessionsTab bookId={bookId} />}
          {tab === 'quotes' && <QuotesTab bookId={bookId} />}
          {tab === 'rating' && <RatingTab bookId={bookId} />}
        </>
      )}

      <Snackbar
        open={!!deletedTitle}
        autoHideDuration={1500}
        onClose={() => navigate('/')}
        message={t('book.delete.snackbar', { title: deletedTitle })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('book.delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('book.delete.content', { title: book?.title })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('book.delete.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('book.delete.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
