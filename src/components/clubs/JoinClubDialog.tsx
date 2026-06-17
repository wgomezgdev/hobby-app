import { useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlreadyMemberError, ClubClosedError, getClubByInviteCode, joinClub } from '../../repositories/clubRepository';
import { normalizeCode } from '../../utils/inviteCode';

interface Props {
  open: boolean;
  onClose: () => void;
  user: { uid: string; displayName: string | null; photoURL: string | null };
}

export function JoinClubDialog({ open, onClose, user }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalized = normalizeCode(code);
    if (normalized.length !== 6) {
      setError(t('club.join.invalidCode'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const club = await getClubByInviteCode(normalized);
      if (!club) {
        setError(t('club.join.notFound'));
        return;
      }
      await joinClub(club.id, {
        uid: user.uid,
        displayName: user.displayName ?? 'Unknown',
        photoURL: user.photoURL,
      });
      setCode('');
      onClose();
      navigate(`/clubs/${club.id}`);
    } catch (e) {
      if (e instanceof AlreadyMemberError) setError(t('club.join.alreadyMember'));
      else if (e instanceof ClubClosedError) setError(t('club.join.closed'));
      else setError(e instanceof Error ? e.message : t('club.join.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('club.join.title')}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label={t('club.join.codeLabel')}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          inputProps={{ maxLength: 6, style: { fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: 8, textAlign: 'center' } }}
          fullWidth
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('club.join.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || code.length !== 6}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.join.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
