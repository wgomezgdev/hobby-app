import { useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, List, ListItemButton,
  ListItemText, Typography,
} from '@mui/material';
import { Add, AutoAwesome } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClubTopics } from '../../../hooks/useClub';
import { NewTopicDialog } from '../../../components/clubs/NewTopicDialog';
import { suggestDiscussionQuestions } from '../../../utils/geminiClubs';
import { formatDistanceToNow } from '../../../utils/formatTime';
import type { ClubStatus } from '../../../types/clubs';

interface Props {
  clubId: string;
  clubStatus: ClubStatus;
  bookTitle: string;
  bookAuthor: string;
  currentUid: string;
  currentName: string;
  isModerator: boolean;
}

export function DiscussionsTab({ clubId, clubStatus, bookTitle, bookAuthor, currentUid, currentName, isModerator }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const topics = useClubTopics(clubId);
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setSuggestError(null);
    setSuggestLoading(true);
    try {
      const qs = await suggestDiscussionQuestions(bookTitle, bookAuthor);
      setSuggestions(qs);
    } catch {
      setSuggestError(t('club.ai.error'));
    } finally {
      setSuggestLoading(false);
    }
  };

  const openWithSuggestion = (q: string) => {
    setInitialTitle(q);
    setIsAiGenerated(true);
    setSuggestions([]);
    setNewTopicOpen(true);
  };

  const openNew = () => {
    setInitialTitle('');
    setIsAiGenerated(false);
    setNewTopicOpen(true);
  };

  return (
    <Box>
      {isModerator && clubStatus === 'ACTIVE' && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button size="small" variant="contained" startIcon={<Add />} onClick={openNew}>
            {t('club.discussions.newTopic')}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={suggestLoading ? <CircularProgress size={14} /> : <AutoAwesome />}
            onClick={handleSuggest}
            disabled={suggestLoading}
          >
            {t('club.discussions.suggestAI')}
          </Button>
        </Box>
      )}

      {suggestError && <Alert severity="error" sx={{ mb: 2 }}>{suggestError}</Alert>}

      {suggestions.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {suggestions.map((q, i) => (
            <Chip
              key={i}
              label={q.length > 60 ? q.slice(0, 60) + '…' : q}
              title={q}
              onClick={() => openWithSuggestion(q)}
              icon={<AutoAwesome sx={{ fontSize: '12px !important' }} />}
              sx={{ fontSize: '0.75rem', height: 24 }}
            />
          ))}
        </Box>
      )}

      {topics.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">{t('club.discussions.empty')}</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {topics.map(topic => (
            <ListItemButton
              key={topic.id}
              onClick={() => navigate(`/clubs/${clubId}/topics/${topic.id}`)}
              sx={{ px: 0, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" fontWeight={600}>{topic.title}</Typography>
                    {topic.isAiGenerated && (
                      <Chip label={t('club.discussions.aiLabel')} size="small" color="secondary" sx={{ height: 16, fontSize: '0.6rem' }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('club.discussions.replyCount', { count: topic.replyCount })}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      · {formatDistanceToNow(topic.createdAt)}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}

      <NewTopicDialog
        open={newTopicOpen}
        onClose={() => setNewTopicOpen(false)}
        clubId={clubId}
        authorUid={currentUid}
        authorName={currentName}
        initialTitle={initialTitle}
        isAiGenerated={isAiGenerated}
      />
    </Box>
  );
}
