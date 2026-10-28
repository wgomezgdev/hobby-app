import { useState } from 'react';
import {
  Box, Button, Chip, List, ListItemButton,
  ListItemText, Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClubTopics } from '../../../hooks/useClub';
import { NewTopicDialog } from '../../../components/clubs/NewTopicDialog';
import { formatDistanceToNow } from '../../../utils/formatTime';
import type { ClubStatus } from '../../../types/clubs';

interface Props {
  clubId: string;
  clubStatus: ClubStatus;
  currentUid: string;
  currentName: string;
  isModerator: boolean;
}

export function DiscussionsTab({ clubId, clubStatus, currentUid, currentName, isModerator }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const topics = useClubTopics(clubId);
  const [newTopicOpen, setNewTopicOpen] = useState(false);

  return (
    <Box>
      {isModerator && clubStatus === 'ACTIVE' && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setNewTopicOpen(true)}>
            {t('club.discussions.newTopic')}
          </Button>
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
      />
    </Box>
  );
}
