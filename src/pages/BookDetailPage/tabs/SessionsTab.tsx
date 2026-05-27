import { Box, Button, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSessionsForBook } from '../../../hooks/useSessions';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';

interface SessionsTabProps {
  bookId: number;
}

export function SessionsTab({ bookId }: SessionsTabProps) {
  const sessions = useSessionsForBook(bookId);
  const navigate = useNavigate();

  if (sessions === undefined) {
    return (
      <Box sx={{ py: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">No sessions logged yet</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(`/books/${bookId}/sessions/new`)}
        >
          Log a session
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <List disablePadding>
        {[...sessions].reverse().map((s, i) => (
          <Box key={s.id}>
            {i > 0 && <Divider />}
            <ListItem disableGutters sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(s.startedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      +{s.progressDelta}%
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <span>{s.durationMinutes} min</span>
                    {s.notes && <span> · {s.notes}</span>}
                  </>
                }
              />
            </ListItem>
          </Box>
        ))}
      </List>
    </Box>
  );
}
