import { useEffect, useRef, useState } from 'react';
import { Box, Button, Fab, Snackbar, Typography } from '@mui/material';
import { Create } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useClubPosts } from '../../../hooks/useClub';
import { ClubPostCard } from '../../../components/clubs/ClubPostCard';
import { ComposePostDialog } from '../../../components/clubs/ComposePostDialog';
import { CatchUpDialog } from '../../../components/clubs/CatchUpDialog';
import { SkeletonCard } from '../../../components/SkeletonCard/SkeletonCard';
import { deletePost, getUserReaction } from '../../../repositories/postRepository';
import type { ClubMember, ClubStatus, ReactionEmoji } from '../../../types/clubs';

interface Props {
  clubId: string;
  clubStatus: ClubStatus;
  bookTitle: string;
  bookAuthor: string;
  currentMember: ClubMember | null;
  isModerator: boolean;
}

export function FeedTab({ clubId, clubStatus, bookTitle, bookAuthor, currentMember, isModerator }: Props) {
  const { t } = useTranslation();
  const [composeOpen, setComposeOpen] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);
  const [deleteSnackbar, setDeleteSnackbar] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionEmoji | null>>({});
  const fetchedReactions = useRef<Set<string>>(new Set());

  const { posts, loadMore, hasMore, loading } = useClubPosts(clubId);

  useEffect(() => {
    if (!currentMember?.uid) return;
    const newPosts = posts.filter(p => !fetchedReactions.current.has(p.id));
    if (newPosts.length === 0) return;
    newPosts.forEach(p => fetchedReactions.current.add(p.id));
    Promise.all(
      newPosts.map(p => getUserReaction(clubId, p.id, currentMember.uid).then(r => [p.id, r] as const))
    ).then(entries => {
      setUserReactions(prev => {
        const next = { ...prev };
        entries.forEach(([id, r]) => { next[id] = r; });
        return next;
      });
    });
  }, [posts, currentMember?.uid, clubId]);

  const pinnedPosts = posts.filter(p => p.isPinned);
  const regularPosts = posts.filter(p => !p.isPinned);

  const handleDeleteRequest = (postId: string) => {
    setPendingDelete(postId);
    setDeleteSnackbar(t('club.post.deleteConfirm'));
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    await deletePost(clubId, pendingDelete);
    setPendingDelete(null);
    setDeleteSnackbar(null);
  };

  if (loading) {
    return <Box>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</Box>;
  }

  return (
    <Box sx={{ pb: 8 }}>
      {currentMember && (currentMember.progress < 80) && clubStatus === 'ACTIVE' && (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setCatchUpOpen(true)}
          sx={{ mb: 2 }}
        >
          📖 {t('club.catchup.button')}
        </Button>
      )}

      {pinnedPosts.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
            📌 {t('club.feed.pinned')}
          </Typography>
          {pinnedPosts.map(post => (
            <ClubPostCard
              key={post.id}
              post={post}
              currentUid={currentMember?.uid ?? ''}
              currentUserReaction={userReactions[post.id] ?? null}
              clubStatus={clubStatus}
              isModerator={isModerator}
              pinnedPostIds={pinnedPosts.map(p => p.id)}
              onDelete={handleDeleteRequest}
            />
          ))}
        </>
      )}

      {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Create sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
          <Typography>{t('club.feed.empty')}</Typography>
        </Box>
      ) : (
        regularPosts.map(post => (
          <ClubPostCard
            key={post.id}
            post={post}
            currentUid={currentMember?.uid ?? ''}
            currentUserReaction={userReactions[post.id] ?? null}
            clubStatus={clubStatus}
            isModerator={isModerator}
            pinnedPostIds={pinnedPosts.map(p => p.id)}
            onDelete={handleDeleteRequest}
          />
        ))
      )}

      {hasMore && (
        <Button fullWidth onClick={loadMore} sx={{ mt: 1 }}>{t('club.feed.loadMore')}</Button>
      )}

      {clubStatus === 'ACTIVE' && currentMember && (
        <Fab
          color="primary"
          onClick={() => setComposeOpen(true)}
          sx={{ position: 'fixed', bottom: 84, right: 16 }}
        >
          <Create />
        </Fab>
      )}

      {currentMember && (
        <ComposePostDialog
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          clubId={clubId}
          author={{
            uid: currentMember.uid,
            displayName: currentMember.displayName,
            photoURL: currentMember.photoURL,
          }}
        />
      )}

      <CatchUpDialog
        open={catchUpOpen}
        onClose={() => setCatchUpOpen(false)}
        bookTitle={bookTitle}
        bookAuthor={bookAuthor}
      />

      <Snackbar
        open={!!deleteSnackbar}
        message={deleteSnackbar}
        autoHideDuration={5000}
        onClose={() => { setPendingDelete(null); setDeleteSnackbar(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <Button size="small" color="error" onClick={handleDeleteConfirm}>
            {t('club.post.deleteConfirmAction')}
          </Button>
        }
      />
    </Box>
  );
}
