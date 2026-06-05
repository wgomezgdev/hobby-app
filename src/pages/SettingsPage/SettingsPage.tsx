import { useRef, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, Snackbar, Stack, Typography,
} from '@mui/material';
import { AutoStories, Download, Upload } from '@mui/icons-material';
import { exportSnapshot, importSnapshot } from '../../utils/snapshot';
import { GoodreadsImport } from '../../components/GoodreadsImport/GoodreadsImport';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [goodreadsOpen, setGoodreadsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleExport = async () => {
    try {
      await exportSnapshot();
      setSnackbar({ message: 'Backup downloaded successfully', severity: 'success' });
    } catch {
      setSnackbar({ message: 'Export failed. Please try again.', severity: 'error' });
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportConfirm = async () => {
    if (!pendingFile) return;
    try {
      await importSnapshot(pendingFile);
      setSnackbar({ message: 'Data restored successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({
        message: err instanceof Error ? err.message : 'Import failed',
        severity: 'error',
      });
    } finally {
      setPendingFile(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Export Backup</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download all your books, sessions, quotes, and ratings as a JSON file.
          </Typography>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Export Snapshot
          </Button>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Import from Goodreads</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seed your library from your public Goodreads profile. Paste your profile URL or
            user ID to import all shelves (read, currently reading, to-read). Existing books
            are never overwritten.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AutoStories />}
            onClick={() => setGoodreadsOpen(true)}
          >
            Import from Goodreads
          </Button>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Import Backup</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Restore data from a previously exported JSON file. This will replace all current data.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Backup File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleFileSelected}
          />
        </Box>
      </Stack>

      <GoodreadsImport open={goodreadsOpen} onClose={() => setGoodreadsOpen(false)} />

      <Dialog
        open={!!pendingFile}
        onClose={() => setPendingFile(null)}
        aria-labelledby="import-confirm-title"
        aria-describedby="import-confirm-desc"
      >
        <DialogTitle id="import-confirm-title">Replace all data?</DialogTitle>
        <DialogContent>
          <DialogContentText id="import-confirm-desc">
            This will replace all current data with the contents of{' '}
            <strong>{pendingFile?.name}</strong>. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingFile(null)} autoFocus>Cancel</Button>
          <Button onClick={handleImportConfirm} color="error" variant="contained">
            Replace Data
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
