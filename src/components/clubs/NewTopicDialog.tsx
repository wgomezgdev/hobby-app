import { useEffect, useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addTopic } from '../../repositories/discussionRepository';

interface Props {
  open: boolean;
  onClose: () => void;
  clubId: string;
  authorUid: string;
  authorName: string;
  initialTitle?: string;
  isAiGenerated?: boolean;
}

export function NewTopicDialog({ open, onClose, clubId, authorUid, authorName, initialTitle = '', isAiGenerated = false }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setTitle(initialTitle); setDescription(''); setError(null); }
  }, [open, initialTitle]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError(t('club.discussions.titleRequired')); return; }
    setError(null);
    setLoading(true);
    try {
      await addTopic(clubId, {
        clubId,
        authorUid,
        authorName,
        title: title.trim(),
        description: description.trim() || undefined,
        isAiGenerated,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('club.discussions.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('club.discussions.newTopic')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label={t('club.discussions.topicTitle')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          inputProps={{ maxLength: 200 }}
          helperText={`${title.length}/200`}
          fullWidth
          autoFocus
        />
        <TextField
          label={t('club.discussions.topicDesc')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={3}
          inputProps={{ maxLength: 500 }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('club.discussions.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.discussions.createTopic')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
