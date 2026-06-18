import { Avatar, Box, IconButton, Typography } from '@mui/material';
import { DeleteOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from '../../utils/formatTime';
import type { ClubReply } from '../../types/clubs';

interface Props {
  reply: ClubReply;
  currentUid: string;
  onDelete: (replyId: string) => void;
}

export function ReplyCard({ reply, currentUid, onDelete }: Props) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
      <Avatar src={reply.authorPhotoURL ?? undefined} sx={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
        {reply.authorName?.[0]}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>{reply.authorName}</Typography>
          <Typography variant="caption" color="text.disabled">{formatDistanceToNow(reply.createdAt)}</Typography>
          {reply.authorUid === currentUid && (
            <IconButton size="small" onClick={() => onDelete(reply.id)} sx={{ ml: 'auto', color: 'error.main' }} aria-label={t('club.replies.delete')}>
              <DeleteOutlined fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2">{reply.text}</Typography>
      </Box>
    </Box>
  );
}
