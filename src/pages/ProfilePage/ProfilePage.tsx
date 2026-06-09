import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Snackbar,
  Typography,
} from '@mui/material';
import { CloudDownload, CloudUpload, Logout, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { pushToFirestore, pullFromFirestore, getLastSyncedAt } from '../../lib/firestoreSync';

function formatRelative(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, isConfigured, signIn, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(getLastSyncedAt);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await pushToFirestore(user.uid);
      setLastSynced(getLastSyncedAt());
      setSnackbar({ msg: 'Synced to cloud ✓', severity: 'success' });
    } catch {
      setSnackbar({ msg: 'Sync failed. Check your connection.', severity: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async () => {
    setConfirmOpen(false);
    if (!user) return;
    setRestoring(true);
    try {
      await pullFromFirestore(user.uid);
      setLastSynced(getLastSyncedAt());
      setSnackbar({ msg: 'Data restored from cloud ✓', severity: 'success' });
    } catch {
      setSnackbar({ msg: 'Restore failed. Check your connection.', severity: 'error' });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  }

  if (!isConfigured) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Profile</Typography>
        <Alert severity="info">
          Add Firebase environment variables to enable Google Sign-In and cloud sync.
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', pt: 6 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to back up your library and sync across devices
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={signIn}
          sx={{ py: 1.5, px: 4, fontWeight: 700 }}
        >
          Sign in with Google
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Profile</Typography>

      {/* User info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar
          src={user.photoURL ?? undefined}
          sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24, fontWeight: 700 }}
        >
          {user.displayName?.[0] ?? 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>{user.displayName}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>

      {/* Cloud sync */}
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Cloud Sync</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Last synced: {formatRelative(lastSynced)}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
          onClick={handleSync}
          disabled={syncing || restoring}
          fullWidth
          sx={{ py: 1.2 }}
        >
          {syncing ? 'Syncing…' : 'Sync to cloud'}
        </Button>
        <Button
          variant="outlined"
          startIcon={restoring ? <CircularProgress size={16} /> : <CloudDownload />}
          onClick={() => setConfirmOpen(true)}
          disabled={syncing || restoring}
          fullWidth
          sx={{ py: 1.2 }}
        >
          {restoring ? 'Restoring…' : 'Restore from cloud'}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="text"
          startIcon={<Settings />}
          onClick={() => navigate('/settings')}
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          Data Management (export / import)
        </Button>
        <Button
          variant="text"
          color="error"
          startIcon={<Logout />}
          onClick={signOut}
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          Sign out
        </Button>
      </Box>

      {/* Restore confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Restore from cloud?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace all local data with your cloud backup. Any changes made since the
            last sync will be lost. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRestore} color="error" variant="contained">Restore</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity} onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
