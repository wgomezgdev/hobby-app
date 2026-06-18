import { useEffect, useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Grid, Typography,
} from '@mui/material';
import { ArrowBack, AutoAwesome } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCapsule } from '../../repositories/capsuleRepository';
import { BadgeChip } from '../../components/clubs/BadgeChip';
import type { ClubCapsule } from '../../types/clubs';

export function CapsulePage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<ClubCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!clubId) return;
    let cancelled = false;

    const fetch = async () => {
      const result = await getCapsule(clubId);
      if (cancelled) return;
      if (result) {
        setCapsule(result);
        setLoading(false);
      } else if (retries < 3) {
        setTimeout(() => setRetries(r => r + 1), 3000);
      } else {
        setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [clubId, retries]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">{t('club.capsule.generating')}</Typography>
      </Box>
    );
  }

  if (!capsule) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{t('club.capsule.notFound')}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/clubs/${clubId}`)}>
          {t('club.detail.back')}
        </Button>
      </Box>
    );
  }

  const closedDate = new Date(capsule.closedAt).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/clubs/${capsule.clubId}`)}>
          {t('club.detail.back')}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={700}>{capsule.bookTitle}</Typography>
        <Typography variant="body2" color="text.secondary">{capsule.bookAuthor}</Typography>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
          {capsule.clubName} · {t('club.capsule.closedOn', { date: closedDate })}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
        <Chip label={t('club.capsule.membersCount', { count: capsule.memberCount })} />
        <Chip label={t('club.capsule.postsCount', { count: capsule.totalPosts })} />
        <Chip label={t('club.capsule.reactionsCount', { count: capsule.totalReactions })} />
      </Box>

      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body1" fontStyle="italic" sx={{ mb: 1 }}>
          {capsule.generatedSummary}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AutoAwesome sx={{ fontSize: 12, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">{t('club.capsule.generated')}</Typography>
        </Box>
      </Box>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        {t('club.capsule.members')}
      </Typography>
      <Grid container spacing={2}>
        {capsule.memberSnapshots.map(m => (
          <Grid item xs={12} sm={6} key={m.uid}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Avatar src={m.photoURL ?? undefined} sx={{ width: 36, height: 36 }}>
                {m.displayName?.[0]}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{m.displayName}</Typography>
                <Typography variant="caption" color="text.secondary">{m.finalProgress}% {t('club.capsule.read')}</Typography>
                {m.badges.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {m.badges.map(b => <BadgeChip key={b} badge={b} size="small" />)}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.disabled" display="block" textAlign="center" sx={{ mt: 4 }}>
        {t('club.capsule.preserved')}
      </Typography>
    </Box>
  );
}
