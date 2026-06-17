import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCatchUpSummary } from '../../utils/geminiClubs';

interface Props {
  open: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor: string;
}

export function CatchUpDialog({ open, onClose, bookTitle, bookAuthor }: Props) {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFrom(''); setTo(''); setSummary(null); setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!from.trim() || !to.trim()) return;
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const result = await getCatchUpSummary(bookTitle, bookAuthor, from.trim(), to.trim());
      setSummary(result);
    } catch {
      setError(t('club.catchup.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('club.catchup.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <Typography variant="caption" color="text.secondary">{t('club.catchup.disclaimer')}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label={t('club.catchup.fromChapter')}
            value={from}
            onChange={e => setFrom(e.target.value)}
            inputProps={{ maxLength: 10 }}
            fullWidth
          />
          <TextField
            label={t('club.catchup.toChapter')}
            value={to}
            onChange={e => setTo(e.target.value)}
            inputProps={{ maxLength: 10 }}
            fullWidth
          />
        </Box>
        {loading && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
        {summary && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            {summary}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('club.catchup.close')}</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !from.trim() || !to.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.catchup.generate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
