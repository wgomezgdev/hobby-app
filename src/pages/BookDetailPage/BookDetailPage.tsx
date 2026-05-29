import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { ArrowBack, DeleteOutlined, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBook } from '../../hooks/useBooks';
import { deleteBook } from '../../repositories/bookRepository';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { ProgressTab } from './tabs/ProgressTab';
import { SessionsTab } from './tabs/SessionsTab';
import { QuotesTab } from './tabs/QuotesTab';
import { RatingTab } from './tabs/RatingTab';

const VALID_TABS = ['progress', 'sessions', 'quotes', 'rating'] as const;
type TabValue = typeof VALID_TABS[number];

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ: 'Want to Read',
  READING: 'Reading',
  FINISHED: 'Finished',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success'> = {
  WANT_TO_READ: 'default',
  READING: 'primary',
  FINISHED: 'success',
};

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id!, 10);
  const book = useBook(bookId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const tab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : 'progress';

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    await deleteBook(bookId);
    navigate('/');
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: TabValue) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/')} aria-label="Back to library">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Book Detail</Typography>
        {book && (
          <>
            <Button
              startIcon={<Edit />}
              onClick={() => navigate(`/books/${bookId}/edit`)}
              size="small"
            >
              Edit
            </Button>
            <IconButton
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete book"
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
              alt={`Cover of ${book.title}`}
              sx={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 80, height: 110, borderRadius: 1, bgcolor: 'grey.100',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            />
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{book.title}</Typography>
            <Typography variant="body2" color="text.secondary">{book.author}</Typography>
            <Chip
              label={STATUS_LABELS[book.status]}
              color={STATUS_COLORS[book.status]}
              size="small"
              sx={{ mt: 0.5, mb: 1 }}
            />
            <ProgressBar value={book.currentProgress} />
          </Box>
        </Box>
      )}

      <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="Progress" value="progress" />
        <Tab label="Sessions" value="sessions" />
        <Tab label="Quotes" value="quotes" />
        <Tab label="Rating" value="rating" />
      </Tabs>

      {book && (
        <>
          {tab === 'progress' && <ProgressTab book={book} />}
          {tab === 'sessions' && <SessionsTab bookId={bookId} />}
          {tab === 'quotes' && <QuotesTab bookId={bookId} />}
          {tab === 'rating' && <RatingTab bookId={bookId} />}
        </>
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete book?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>{book?.title}</strong> and all its sessions,
            quotes, and rating. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
