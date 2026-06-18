import { useState } from 'react';
import {
  Alert, Box, Button, Chip, IconButton, Skeleton,
  Tab, Tabs, Tooltip, Typography,
} from '@mui/material';
import { ArrowBack, ContentCopy } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useClub, useClubMembers } from '../../hooks/useClub';
import { FeedTab } from './tabs/FeedTab';
import { DiscussionsTab } from './tabs/DiscussionsTab';
import { MembersTab } from './tabs/MembersTab';
import { CloseClubDialog } from '../../components/clubs/CloseClubDialog';

const TABS = ['feed', 'discussions', 'members'] as const;
type TabValue = typeof TABS[number];

export function ClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [closeOpen, setCloseOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawTab = searchParams.get('tab');
  const tab: TabValue = TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : 'feed';

  const { club, loading } = useClub(clubId ?? '');
  const members = useClubMembers(clubId ?? '');
  const currentMember = members.find(m => m.uid === user?.uid) ?? null;
  const isModerator = club?.moderatorUid === user?.uid;

  const handleCopy = () => {
    if (club) {
      navigator.clipboard.writeText(club.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={20} sx={{ mb: 3 }} />
      </Box>
    );
  }

  if (!club) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{t('club.detail.notFound')}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/clubs')}>{t('club.detail.back')}</Button>
      </Box>
    );
  }

  if (!user || !currentMember) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => navigate('/clubs')}><ArrowBack /></IconButton>
          <Typography variant="h6">{club.name}</Typography>
        </Box>
        <Alert severity="warning">{t('club.detail.notMember')}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate('/clubs')} aria-label={t('club.detail.back')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap fontWeight={700}>{club.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {club.bookTitle} · {club.bookAuthor}
          </Typography>
        </Box>
        <Chip
          label={club.status === 'ACTIVE' ? t('club.status.active') : t('club.status.closed')}
          size="small"
          color={club.status === 'ACTIVE' ? 'success' : 'default'}
        />
      </Box>

      {isModerator && club.status === 'ACTIVE' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('club.detail.inviteCode')}: <strong style={{ fontFamily: 'monospace', letterSpacing: 4 }}>{club.inviteCode}</strong>
          </Typography>
          <Tooltip title={copied ? t('club.detail.copied') : t('club.detail.copy')}>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {isModerator && club.status === 'ACTIVE' && (
        <Box sx={{ mb: 1, px: 1 }}>
          <Button size="small" color="error" variant="outlined" onClick={() => setCloseOpen(true)}>
            {t('club.close.title')}
          </Button>
        </Box>
      )}

      {club.status === 'CLOSED' && club.capsuleId && (
        <Box sx={{ mb: 1, px: 1 }}>
          <Button variant="outlined" onClick={() => navigate(`/clubs/${clubId}/capsule`)}>
            {t('club.capsule.view')}
          </Button>
        </Box>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setSearchParams({ tab: v })}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label={t('club.detail.tabs.feed')} value="feed" />
        <Tab label={t('club.detail.tabs.discussions')} value="discussions" />
        <Tab label={t('club.detail.tabs.members', { count: members.length })} value="members" />
      </Tabs>

      {tab === 'feed' && (
        <FeedTab
          clubId={clubId!}
          clubStatus={club.status}
          bookTitle={club.bookTitle}
          bookAuthor={club.bookAuthor}
          currentMember={currentMember}
          isModerator={isModerator}
        />
      )}
      {tab === 'discussions' && (
        <DiscussionsTab
          clubId={clubId!}
          clubStatus={club.status}
          bookTitle={club.bookTitle}
          bookAuthor={club.bookAuthor}
          currentUid={user.uid}
          currentName={user.displayName ?? 'Unknown'}
          isModerator={isModerator}
        />
      )}
      {tab === 'members' && (
        <MembersTab
          clubId={clubId!}
          clubStatus={club.status}
          bookTitle={club.bookTitle}
          bookAuthor={club.bookAuthor}
          currentUid={user.uid}
        />
      )}

      {isModerator && (
        <CloseClubDialog
          open={closeOpen}
          onClose={() => setCloseOpen(false)}
          clubId={clubId!}
          clubName={club.name}
          currentUser={{ uid: user.uid, displayName: user.displayName ?? 'Moderator' }}
        />
      )}
    </Box>
  );
}
