import { memo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, IconButton, Menu, MenuItem, Typography,
} from '@mui/material';
import { DeleteOutlined, MenuBook, MoreVert, PushPin } from '@mui/icons-material';
import { formatDistanceToNow } from '../../utils/formatTime';
import { toggleReaction, pinPost, unpinPost } from '../../repositories/postRepository';
import { REACTION_DISPLAY, POST_TYPE_DISPLAY, type ClubPost, type ClubStatus, type ReactionEmoji } from '../../types/clubs';
import { useTranslation } from 'react-i18next';

interface Props {
  post: ClubPost;
  currentUid: string;
  currentUserReaction: ReactionEmoji | null;
  clubStatus: ClubStatus;
  isModerator: boolean;
  pinnedPostIds: string[];
  onDelete?: (postId: string) => void;
}

const REACTIONS: ReactionEmoji[] = ['fire', 'laugh', 'cry', 'mindblown'];

export const ClubPostCard = memo(function ClubPostCard({
  post, currentUid, currentUserReaction, clubStatus, isModerator, pinnedPostIds, onDelete,
}: Props) {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [reacting, setReacting] = useState(false);

  const handleReaction = async (emoji: ReactionEmoji) => {
    if (reacting || clubStatus === 'CLOSED') return;
    setReacting(true);
    try { await toggleReaction(post.clubId, post.id, currentUid, emoji); }
    finally { setReacting(false); }
  };

  const handlePin = async () => {
    setMenuAnchor(null);
    await pinPost(post.clubId, post.id, pinnedPostIds.filter(id => id !== post.id));
  };

  const handleUnpin = async () => {
    setMenuAnchor(null);
    await unpinPost(post.clubId, post.id);
  };

  const typeInfo = post.type !== 'DISCUSSION_REPLY' ? POST_TYPE_DISPLAY[post.type] : null;

  const cardBg = post.type === 'QUESTION'
    ? 'rgba(33, 150, 243, 0.04)'
    : post.type === 'HOT_TAKE'
    ? 'rgba(224, 121, 64, 0.04)'
    : 'background.paper';

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: cardBg,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {post.isPinned && (
        <PushPin sx={{ position: 'absolute', top: 10, right: 10, fontSize: 16, color: 'text.disabled' }} />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Avatar src={post.authorPhotoURL ?? undefined} sx={{ width: 28, height: 28, fontSize: 12 }}>
          {post.authorName?.[0]}
        </Avatar>
        <Typography variant="caption" fontWeight={600}>{post.authorName}</Typography>
        {typeInfo && (
          <Chip
            label={`${typeInfo.emoji} ${typeInfo.label}`}
            size="small"
            sx={{ fontSize: '0.65rem', height: 18 }}
          />
        )}
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto', mr: post.authorUid === currentUid || isModerator ? 0 : 0.5 }}>
          {formatDistanceToNow(post.createdAt)}
        </Typography>
        {(post.authorUid === currentUid || isModerator) && (
          <>
            <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)} sx={{ ml: 0.5 }}>
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              {isModerator && clubStatus === 'ACTIVE' && (
                post.isPinned
                  ? <MenuItem onClick={handleUnpin}>{t('club.feed.unpin')}</MenuItem>
                  : <MenuItem onClick={handlePin}>{t('club.feed.pin')}</MenuItem>
              )}
              {post.authorUid === currentUid && (
                <MenuItem onClick={() => { setMenuAnchor(null); onDelete?.(post.id); }} sx={{ color: 'error.main' }}>
                  <DeleteOutlined fontSize="small" sx={{ mr: 1 }} />{t('club.post.delete')}
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      {post.chapterTag && (
        <Chip
          icon={<MenuBook sx={{ fontSize: '12px !important' }} />}
          label={post.chapterTag}
          size="small"
          sx={{ mb: 1, fontSize: '0.65rem', height: 18 }}
        />
      )}

      {post.type === 'VOCABULARY' ? (
        <Box>
          <Typography variant="body2" fontWeight={700}>{post.text}</Typography>
          {post.vocabularyDefinition && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {post.vocabularyDefinition}
            </Typography>
          )}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{
            ...(post.type === 'HOT_TAKE' ? {
              fontStyle: 'italic',
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              pl: 1.5,
            } : {}),
          }}
        >
          {post.text}
        </Typography>
      )}

      {post.type === 'QUOTE' && post.pageNumber && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          p. {post.pageNumber}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
        {REACTIONS.map(emoji => (
          <Button
            key={emoji}
            size="small"
            variant={currentUserReaction === emoji ? 'contained' : 'outlined'}
            onClick={() => handleReaction(emoji)}
            disabled={clubStatus === 'CLOSED' || reacting}
            sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.75rem', lineHeight: 1.5 }}
          >
            {REACTION_DISPLAY[emoji]} {post.reactionCounts[emoji] > 0 ? post.reactionCounts[emoji] : ''}
          </Button>
        ))}
      </Box>
    </Box>
  );
});
