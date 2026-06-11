import { Avatar, Box, Card, CardActionArea, Chip, LinearProgress, Skeleton, Typography } from '@mui/material';
import { AutoStories } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHomeData } from '../../hooks/useHomeData';
import { useAllRatings } from '../../hooks/useRatings';
import { StarRating } from '../../components/StarRating/StarRating';
import { useAuth } from '../../hooks/useAuth';
import { useLibraryUiStore } from '../../stores/libraryUiStore';
import type { Book, BookStatus } from '../../types/entities';

function BookRow({ book, onClick, badge }: { book: Book; onClick: () => void; badge?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {book.cover ? (
            <Box
              component="img"
              src={book.cover}
              alt={book.title}
              sx={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
            />
          ) : (
            <Box sx={{ width: 48, height: 68, bgcolor: 'background.default', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AutoStories sx={{ color: 'text.disabled', fontSize: 20 }} />
            </Box>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {badge}
            <Typography variant="subtitle2" fontWeight={700} noWrap>{book.title}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{book.author}</Typography>
            {book.status === 'READING' && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {book.currentPage && book.totalPages
                    ? t('home.pageOf', { current: book.currentPage, total: book.totalPages })
                    : `${book.currentProgress}%`}
                </Typography>
                <LinearProgress variant="determinate" value={book.currentProgress} sx={{ mt: 0.5, borderRadius: 1, height: 4 }} />
              </Box>
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const data = useHomeData();
  const ratings = useAllRatings();
  const { user } = useAuth();
  const setFilter = useLibraryUiStore(s => s.setFilter);

  const h = new Date().getHours();
  const greetingKey = h >= 5 && h < 12 ? 'home.greeting.morning'
    : h >= 12 && h < 20 ? 'home.greeting.afternoon'
    : 'home.greeting.evening';

  const ratingsMap = new Map((ratings ?? []).map(r => [r.bookId, r.stars]));

  if (!data) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton width="60%" height={36} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={24} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {[0, 1, 2].map(i => <Skeleton key={i} variant="rectangular" sx={{ flex: 1, height: 80, borderRadius: 2 }} />)}
        </Box>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const { readingCount, finishedCount, pendingCount, readingBooks, finishedBooks } = data;

  return (
    <Box sx={{ pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{t(greetingKey)} 👋</Typography>
          <Typography variant="h5" fontWeight={700}>
            {t('home.myLibrary').split(' ')[0]}{' '}
            <Box component="span" color="primary.main">{t('home.myLibrary').split(' ').slice(1).join(' ')}</Box>
          </Typography>
        </Box>
        <Avatar
          src={user?.photoURL ?? undefined}
          onClick={() => navigate('/profile')}
          sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontWeight: 700, cursor: 'pointer' }}
        >
          {user?.displayName?.[0] ?? 'RP'}
        </Avatar>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        {[
          { label: t('home.stats.read'), count: finishedCount, filter: 'FINISHED' as BookStatus },
          { label: t('home.stats.inProgress'), count: readingCount, filter: 'READING' as BookStatus },
          { label: t('home.stats.pending'), count: pendingCount, filter: 'WANT_TO_READ' as BookStatus },
        ].map(({ label, count, filter }) => (
          <Card key={label} sx={{ flex: 1, textAlign: 'center' }}>
            <CardActionArea
              onClick={() => { setFilter(filter); navigate('/library'); }}
              sx={{ p: 1.5 }}
            >
              <Typography variant="h5" fontWeight={800} color="primary.main">{count}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>{t('home.currentlyReading')}</Typography>
      {readingBooks.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {readingBooks.map(book => (
            <BookRow
              key={book.id}
              book={book}
              onClick={() => navigate(`/books/${book.id}`)}
              badge={<Chip label={t('home.activeBadge')} size="small" color="primary" sx={{ mb: 0.5, fontSize: '0.65rem', height: 20 }} />}
            />
          ))}
        </Box>
      ) : (
        <Card sx={{ mb: 3, p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('home.notReading')}
          </Typography>
          <Chip label={t('home.startReading')} color="primary" onClick={() => navigate('/library')} clickable />
        </Card>
      )}

      {finishedBooks.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {t('home.completed', { count: finishedCount })}
          </Typography>
          {finishedBooks.map(book => (
            <BookRow
              key={book.id}
              book={book}
              onClick={() => navigate(`/books/${book.id}`)}
              badge={
                ratingsMap.has(book.id!) ? (
                  <Box sx={{ mb: 0.5 }}>
                    <StarRating value={ratingsMap.get(book.id!) ?? null} readOnly />
                  </Box>
                ) : undefined
              }
            />
          ))}
        </>
      )}
    </Box>
  );
}
