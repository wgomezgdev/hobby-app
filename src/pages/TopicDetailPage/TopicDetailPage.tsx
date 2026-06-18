import { useState } from 'react';
import {
  Box, Button, Divider, IconButton, Skeleton, TextField, Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useClub, useClubMembers, useTopicReplies } from '../../hooks/useClub';
import { addReply, deleteReply } from '../../repositories/discussionRepository';
import { ReplyCard } from '../../components/clubs/ReplyCard';

export function TopicDetailPage() {
  const { clubId, topicId } = useParams<{ clubId: string; topicId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { club } = useClub(clubId ?? '');
  const members = useClubMembers(clubId ?? '');
  const replies = useTopicReplies(clubId ?? '', topicId ?? '');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentMember = members.find(m => m.uid === user?.uid);

  const handleSubmit = async () => {
    if (!user || !clubId || !topicId || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await addReply(clubId, topicId, {
        topicId,
        authorUid: user.uid,
        authorName: user.displayName ?? 'Unknown',
        authorPhotoURL: user.photoURL,
        text: replyText.trim(),
      });
      setReplyText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (replyId: string) => {
    if (!clubId || !topicId) return;
    await deleteReply(clubId, topicId, replyId);
  };

  if (!club) {
    return (
      <Box>
        <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={20} sx={{ mb: 3 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(`/clubs/${clubId}?tab=discussions`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          {t('club.discussions.label')}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {/* Topic title from replies hook topic - we get it from URL context */}
          {t('club.discussions.thread')}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {replies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">{t('club.replies.empty')}</Typography>
        </Box>
      ) : (
        replies.map(reply => (
          <ReplyCard
            key={reply.id}
            reply={reply}
            currentUid={user?.uid ?? ''}
            onDelete={handleDelete}
          />
        ))
      )}

      {club.status === 'ACTIVE' && currentMember && (
        <Box sx={{ mt: 3, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            placeholder={t('club.replies.compose')}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            multiline
            maxRows={4}
            inputProps={{ maxLength: 1000 }}
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !replyText.trim()}
            sx={{ flexShrink: 0 }}
          >
            {t('club.replies.submit')}
          </Button>
        </Box>
      )}
    </Box>
  );
}
