import { useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, LinearProgress, Slider, Snackbar,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { CheckCircle, EmojiEvents } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { firestoreDb } from '../../../lib/firebase';
import { useClubMembers } from '../../../hooks/useClub';
import { useMilestonePrompt } from '../../../hooks/useMilestonePrompt';
import { evaluateBadgesAfterProgress } from '../../../utils/badgeEvaluator';
import { BadgeChip } from '../../../components/clubs/BadgeChip';
import { ComposePostDialog } from '../../../components/clubs/ComposePostDialog';
import { PACE_STATUS_DISPLAY, type BadgeId, type ClubMember, type ClubStatus, type PaceStatus } from '../../../types/clubs';

interface Props {
  clubId: string;
  clubStatus: ClubStatus;
  bookTitle: string;
  bookAuthor: string;
  currentUid: string;
}

export function MembersTab({ clubId, clubStatus, bookTitle, bookAuthor, currentUid }: Props) {
  const { t } = useTranslation();
  const members = useClubMembers(clubId);
  const { checkMilestone } = useMilestonePrompt(bookTitle, bookAuthor);

  const [editOpen, setEditOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paceStatus, setPaceStatus] = useState<PaceStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<{ milestone: number; question: string } | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');

  const me = members.find(m => m.uid === currentUid) ?? null;
  const sorted = [...members].sort((a, b) => {
    if (a.role === 'MODERATOR') return -1;
    if (b.role === 'MODERATOR') return 1;
    return b.progress - a.progress;
  });

  const openEdit = () => {
    setProgress(me?.progress ?? 0);
    setPaceStatus(me?.paceStatus ?? null);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!firestoreDb || !me) return;
    setSaving(true);
    try {
      const oldProgress = me.progress;
      await updateDoc(doc(firestoreDb, 'clubs', clubId, 'members', currentUid), {
        progress,
        paceStatus,
      });
      setEditOpen(false);
      setSnackbar(t('club.members.progressUpdated'));

      const newBadges: BadgeId[] = await evaluateBadgesAfterProgress(clubId, currentUid, progress);
      if (newBadges.length > 0) setSnackbar(t('club.members.newBadge'));

      const ms = await checkMilestone(oldProgress, progress, me.milestonesReached);
      if (ms) setMilestone(ms);
    } finally {
      setSaving(false);
    }
  };

  const handleMilestoneDismiss = async () => {
    if (!firestoreDb || !me || !milestone) return;
    await updateDoc(doc(firestoreDb, 'clubs', clubId, 'members', currentUid), {
      milestonesReached: [...me.milestonesReached, milestone.milestone],
    });
    setMilestone(null);
  };

  const handleMilestoneShare = () => {
    if (!milestone) return;
    setComposeText(milestone.question);
    setComposeOpen(true);
    handleMilestoneDismiss();
  };

  return (
    <Box>
      {me && clubStatus === 'ACTIVE' && (
        <Button variant="outlined" size="small" onClick={openEdit} sx={{ mb: 2 }}>
          {t('club.members.updateProgress')}
        </Button>
      )}

      {sorted.map(member => (
        <Box key={member.uid} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
          <Avatar src={member.photoURL ?? undefined} sx={{ width: 40, height: 40 }}>
            {member.displayName?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{member.displayName}</Typography>
              {member.role === 'MODERATOR' && <EmojiEvents sx={{ fontSize: 14, color: 'warning.main' }} />}
            </Box>

            {member.paceStatus && (
              <Typography variant="caption" color="text.secondary" display="block">
                {PACE_STATUS_DISPLAY[member.paceStatus].emoji} {t(`club.pace.${member.paceStatus}`)}
              </Typography>
            )}

            {member.progress === 100 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main">100%</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={member.progress}
                  sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary">{member.progress}%</Typography>
              </Box>
            )}

            {member.badges.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {member.badges.map(b => <BadgeChip key={b} badge={b} size="small" />)}
              </Box>
            )}
          </Box>
        </Box>
      ))}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('club.members.updateProgress')}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('club.members.progress')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Slider
              value={progress}
              onChange={(_, v) => setProgress(v as number)}
              min={0} max={100} step={1}
              sx={{ flexGrow: 1 }}
            />
            <Typography variant="body2" fontWeight={700} sx={{ minWidth: 36 }}>{progress}%</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>{t('club.pace.label')}</Typography>
          <ToggleButtonGroup
            value={paceStatus}
            exclusive
            onChange={(_, v) => setPaceStatus(v)}
            size="small"
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {(['ON_TRACK', 'BEHIND', 'FINISHED'] as PaceStatus[]).map(ps => (
              <ToggleButton key={ps} value={ps} sx={{ fontSize: '0.75rem' }}>
                {PACE_STATUS_DISPLAY[ps].emoji} {t(`club.pace.${ps}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('club.members.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {t('club.members.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {milestone && (
        <Dialog open={!!milestone} onClose={handleMilestoneDismiss}>
          <DialogTitle>🎉 {t('club.milestone.title', { milestone: milestone.milestone })}</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body1" fontStyle="italic">{milestone.question}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMilestoneDismiss}>{t('club.milestone.dismiss')}</Button>
            <Button variant="contained" onClick={handleMilestoneShare}>{t('club.milestone.shareHotTake')}</Button>
          </DialogActions>
        </Dialog>
      )}

      {me && (
        <ComposePostDialog
          open={composeOpen}
          onClose={() => { setComposeOpen(false); setComposeText(''); }}
          clubId={clubId}
          author={{ uid: me.uid, displayName: me.displayName, photoURL: me.photoURL }}
          initialType="HOT_TAKE"
          initialText={composeText}
        />
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
