import { Card, CardActionArea, CardContent, CardMedia, Chip, Box, Typography } from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Book } from '../../types/entities';
import { ProgressBar } from '../ProgressBar/ProgressBar';

const STATUS_COLORS: Record<Book['status'], 'default' | 'primary' | 'success'> = {
  WANT_TO_READ: 'default',
  READING: 'primary',
  FINISHED: 'success',
};

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/books/${book.id}`)} sx={{ flexGrow: 1 }}>
        {book.cover ? (
          <CardMedia
            component="img"
            height={160}
            image={book.cover}
            alt={book.title}
            sx={{ objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <Box
            sx={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <MenuBook sx={{ fontSize: 48, color: 'grey.400' }} />
          </Box>
        )}
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {book.author}
          </Typography>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip
              label={t(`book.status.${book.status}`)}
              color={STATUS_COLORS[book.status]}
              size="small"
            />
          </Box>
          {book.currentPage != null && book.totalPages ? (
            <Typography variant="caption" color="text.secondary">
              {t('home.pageOf', { current: book.currentPage, total: book.totalPages })}
            </Typography>
          ) : null}
          <ProgressBar value={book.currentProgress} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
