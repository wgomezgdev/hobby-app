import { useRef, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, Snackbar, Stack, Typography,
} from '@mui/material';
import { AutoStories, Download, Upload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { exportSnapshot, importSnapshot } from '../../utils/snapshot';
import { GoodreadsImport } from '../../components/GoodreadsImport/GoodreadsImport';

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [goodreadsOpen, setGoodreadsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const { t } = useTranslation();

  const handleExport = async () => {
    try {
      await exportSnapshot();
      setSnackbar({ message: t('settings.exportSuccess'), severity: 'success' });
    } catch {
      setSnackbar({ message: t('settings.exportError'), severity: 'error' });
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
      setSnackbar({ message: t('settings.importSuccess'), severity: 'success' });
    } catch (err) {
      setSnackbar({
        message: err instanceof Error ? err.message : t('settings.importError'),
        severity: 'error',
      });
    } finally {
      setPendingFile(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('settings.title')}</Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>{t('settings.exportTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.exportDesc')}
          </Typography>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            {t('settings.exportButton')}
          </Button>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>{t('settings.goodreadsTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.goodreadsDesc')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AutoStories />}
            onClick={() => setGoodreadsOpen(true)}
          >
            {t('settings.goodreadsButton')}
          </Button>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>{t('settings.importTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.importDesc')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('settings.importButton')}
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
        <DialogTitle id="import-confirm-title">{t('settings.importConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="import-confirm-desc">
            {t('settings.importConfirmContent', { filename: pendingFile?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingFile(null)} autoFocus>{t('settings.importCancel')}</Button>
          <Button onClick={handleImportConfirm} color="error" variant="contained">
            {t('settings.importConfirm')}
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
