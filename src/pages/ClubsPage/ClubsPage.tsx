import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, Card, CardActionArea, Chip,
  Skeleton, Typography,
} from '@mui/material';
import { Add, Groups, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useUserClubs } from '../../hooks/useClub';
import { CreateClubDialog } from '../../components/clubs/CreateClubDialog';
import { JoinClubDialog } from '../../components/clubs/JoinClubDialog';
import { isFirebaseConfigured } from '../../lib/firebase';
import type { Club } from '../../types/clubs';

function ClubCard({ club, onClick }: { club: Club; onClick: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>{club.name}</Typography>
              {club.moderatorUid === user?.uid && (
                <Chip label="👑" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
              <Chip
                label={club.status === 'ACTIVE' ? t('club.status.active') : t('club.status.closed')}
                size="small"
                color={club.status === 'ACTIVE' ? 'success' : 'default'}
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {club.bookTitle} · {club.bookAuthor}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {t('club.list.memberCount', { count: club.memberCount })}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export function ClubsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { clubs, loading } = useUserClubs(user?.uid ?? '');

  if (!isFirebaseConfigured) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('club.list.title')}</Typography>
        <Alert severity="info">{t('club.list.notConfigured')}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', pt: 6 }}>
        <Groups sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t('club.list.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('club.list.signInPrompt')}
        </Typography>
        <Button variant="contained" startIcon={<Login />} onClick={() => navigate('/profile')}>
          {t('club.list.signIn')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>{t('club.list.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<Login />} onClick={() => setJoinOpen(true)}>
            {t('club.list.join')}
          </Button>
          <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            {t('club.list.create')}
          </Button>
        </Box>
      </Box>

      {loading ? (
        [0, 1, 2].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 1 }} />)
      ) : clubs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Groups sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography color="text.secondary" sx={{ mb: 1 }}>{t('club.list.empty')}</Typography>
          <Typography variant="body2" color="text.disabled">{t('club.list.emptyHint')}</Typography>
        </Box>
      ) : (
        clubs.map(club => (
          <ClubCard key={club.id} club={club} onClick={() => navigate(`/clubs/${club.id}`)} />
        ))
      )}

      {user && (
        <>
          <CreateClubDialog open={createOpen} onClose={() => setCreateOpen(false)} user={user} />
          <JoinClubDialog open={joinOpen} onClose={() => setJoinOpen(false)} user={user} />
        </>
      )}
    </Box>
  );
}
