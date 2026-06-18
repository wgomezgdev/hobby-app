import { useState } from 'react';
import {
  Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { closeClubAndGenerateCapsule } from '../../repositories/capsuleRepository';

interface Props {
  open: boolean;
  onClose: () => void;
  clubId: string;
  clubName: string;
  currentUser: { uid: string; displayName: string };
}

export function CloseClubDialog({ open, onClose, clubId, clubName, currentUser }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await closeClubAndGenerateCapsule(clubId, currentUser);
      onClose();
      navigate(`/clubs/${clubId}/capsule`);
    } catch (e) {
      console.error(e);
      onClose();
      navigate(`/clubs/${clubId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('club.close.title')}</DialogTitle>
      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <DialogContentText>
          {t('club.close.warning', { name: clubName })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t('club.close.cancel')}</Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.close.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
