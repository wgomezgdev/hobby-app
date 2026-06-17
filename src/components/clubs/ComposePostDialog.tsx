import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, InputAdornment, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { Bookmark } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { addPost } from '../../repositories/postRepository';
import { POST_TYPE_DISPLAY, type PostType } from '../../types/clubs';

type SelectableType = Exclude<PostType, 'DISCUSSION_REPLY'>;

const SELECTABLE_TYPES: SelectableType[] = ['QUOTE', 'DISCOVERY', 'HOT_TAKE', 'QUESTION', 'VOCABULARY'];
const TEXT_LIMITS: Record<SelectableType, number> = {
  QUOTE: 500, DISCOVERY: 300, HOT_TAKE: 200, QUESTION: 200, VOCABULARY: 50,
};

interface Props {
  open: boolean;
  onClose: () => void;
  clubId: string;
  author: { uid: string; displayName: string; photoURL: string | null };
  initialType?: SelectableType;
  initialText?: string;
}

export function ComposePostDialog({ open, onClose, clubId, author, initialType = 'QUOTE', initialText = '' }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<SelectableType>(initialType);
  const [text, setText] = useState(initialText);
  const [pageNumber, setPageNumber] = useState('');
  const [chapterTag, setChapterTag] = useState('');
  const [definition, setDefinition] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxLen = TEXT_LIMITS[type];

  const handleClose = () => {
    setType(initialType);
    setText(initialText);
    setPageNumber('');
    setChapterTag('');
    setDefinition('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!text.trim()) { setError(t('club.compose.textRequired')); return; }
    if (text.length > maxLen) { setError(t('club.compose.textTooLong', { max: maxLen })); return; }
    setError(null);
    setLoading(true);
    try {
      await addPost(clubId, {
        clubId,
        authorUid: author.uid,
        authorName: author.displayName,
        authorPhotoURL: author.photoURL,
        type,
        text: text.trim(),
        isPinned: false,
        ...(type === 'QUOTE' && pageNumber ? { pageNumber: parseInt(pageNumber) } : {}),
        ...(chapterTag.trim() ? { chapterTag: chapterTag.trim() } : {}),
        ...(type === 'VOCABULARY' && definition.trim() ? { vocabularyDefinition: definition.trim() } : {}),
      });
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('club.compose.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('club.compose.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}

        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, v) => { if (v) { setType(v); setText(''); } }}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {SELECTABLE_TYPES.map(pt => (
            <ToggleButton key={pt} value={pt} sx={{ fontSize: '0.75rem' }}>
              {POST_TYPE_DISPLAY[pt].emoji} {t(`club.post.${pt.toLowerCase().replace('_', '')}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {type === 'VOCABULARY' ? (
          <>
            <TextField
              label={t('club.post.word')}
              value={text}
              onChange={e => setText(e.target.value)}
              inputProps={{ maxLength: 50 }}
              helperText={`${text.length}/50`}
              fullWidth
            />
            <TextField
              label={t('club.post.definition')}
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              helperText={`${definition.length}/200`}
              fullWidth
            />
          </>
        ) : (
          <TextField
            label={t('club.compose.textLabel')}
            value={text}
            onChange={e => setText(e.target.value)}
            multiline
            rows={4}
            inputProps={{ maxLength: maxLen }}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color={text.length > maxLen * 0.9 ? 'error' : 'text.secondary'}>
                  {text.length}/{maxLen}
                </Typography>
              </Box>
            }
            fullWidth
          />
        )}

        {type === 'QUOTE' && (
          <TextField
            label={t('club.compose.pageNumber')}
            value={pageNumber}
            onChange={e => setPageNumber(e.target.value.replace(/\D/g, ''))}
            type="text"
            inputProps={{ inputMode: 'numeric' }}
            fullWidth
          />
        )}

        <TextField
          label={t('club.post.chapterTag')}
          value={chapterTag}
          onChange={e => setChapterTag(e.target.value)}
          inputProps={{ maxLength: 30 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Bookmark sx={{ fontSize: 16 }} /></InputAdornment>,
          }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('club.compose.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.compose.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
