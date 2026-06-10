import { Avatar, Box, Card, CardActionArea, Chip, LinearProgress, Skeleton, Typography } from '@mui/material';
import { AutoStories } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useHomeData } from '../../hooks/useHomeData';
import { useAllRatings } from '../../hooks/useRatings';
import { StarRating } from '../../components/StarRating/StarRating';
import { useAuth } from '../../hooks/useAuth';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 20) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const navigate = useNavigate();
  const data = useHomeData();
  const ratings = useAllRatings();
  const { user } = useAuth();

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

  const { readingCount, finishedCount, pendingCount, currentBook, recentlyFinished } = data;

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {greeting()} 👋
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            My <Box component="span" color="primary.main">Library</Box>
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

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Read', count: finishedCount },
          { label: 'In progress', count: readingCount },
          { label: 'Pending', count: pendingCount },
        ].map(({ label, count }) => (
          <Card key={label} sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">{count}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Card>
        ))}
      </Box>

      {/* Currently reading */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Currently Reading
      </Typography>
      {currentBook ? (
        <Card sx={{ mb: 3 }}>
          <CardActionArea onClick={() => navigate(`/books/${currentBook.id}`)} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              {currentBook.cover ? (
                <Box
                  component="img"
                  src={currentBook.cover}
                  alt={currentBook.title}
                  sx={{ width: 56, height: 80, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                />
              ) : (
                <Box sx={{ width: 56, height: 80, bgcolor: 'background.default', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AutoStories sx={{ color: 'text.disabled' }} />
                </Box>
              )}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Chip label="● ACTIVE" size="small" color="primary" sx={{ mb: 0.5, fontSize: '0.65rem', height: 20 }} />
                <Typography variant="subtitle2" fontWeight={700} noWrap>{currentBook.title}</Typography>
                <Typography variant="caption" color="text.secondary">{currentBook.author}</Typography>
                <Box sx={{ mt: 1 }}>
                  {currentBook.currentPage != null && currentBook.totalPages ? (
                    <Typography variant="caption" color="text.secondary">
                      Page {currentBook.currentPage} of {currentBook.totalPages}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {currentBook.currentProgress}%
                    </Typography>
                  )}
                  <LinearProgress
                    variant="determinate"
                    value={currentBook.currentProgress}
                    sx={{ mt: 0.5, borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </Box>
          </CardActionArea>
        </Card>
      ) : (
        <Card sx={{ mb: 3, p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            You are not reading anything right now
          </Typography>
          <Chip
            label="Start reading →"
            color="primary"
            onClick={() => navigate('/library')}
            clickable
          />
        </Card>
      )}

      {/* Completados */}
      {recentlyFinished.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Completed</Typography>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/library?status=FINISHED')}
            >
              See all →
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {recentlyFinished.map(book => (
              <Box
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                sx={{ flexShrink: 0, width: 90, cursor: 'pointer' }}
              >
                {book.cover ? (
                  <Box
                    component="img"
                    src={book.cover}
                    alt={book.title}
                    sx={{ width: 90, height: 130, objectFit: 'cover', borderRadius: 1.5, display: 'block' }}
                  />
                ) : (
                  <Box sx={{ width: 90, height: 130, bgcolor: 'background.paper', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AutoStories sx={{ color: 'text.disabled', fontSize: 32 }} />
                  </Box>
                )}
                <Typography variant="caption" noWrap display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {book.title}
                </Typography>
                <Typography variant="caption" noWrap display="block" color="text.secondary">
                  {book.author}
                </Typography>
                {ratingsMap.has(book.id!) && (
                  <StarRating value={ratingsMap.get(book.id!) ?? null} readOnly />
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
