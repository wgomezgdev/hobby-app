import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../../components/ProgressBar/ProgressBar';
import type { Book } from '../../../types/entities';

interface ProgressTabProps {
  book: Book;
}

export function ProgressTab({ book }: ProgressTabProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 2, maxWidth: 480 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Reading Progress</Typography>
      <ProgressBar value={book.currentProgress} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {book.currentProgress === 100
          ? 'Finished!'
          : `${100 - book.currentProgress}% remaining`}
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => navigate(`/books/${book.id}/sessions/new`)}
        disabled={book.currentProgress >= 100}
      >
        Log Reading Session
      </Button>
    </Box>
  );
}
