import { useState, useRef } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { CloudUpload, CameraAlt, MenuBook } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CoverUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  extra?: React.ReactNode;
}

const MAX_DIMENSION = 500;
const JPEG_QUALITY = 0.75;
const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1 MB

function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export function CoverUpload({ value, onChange, extra }: CoverUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const processFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError(t('cover.errorSize'));
      return;
    }
    try {
      const dataUrl = await resizeAndEncode(file);
      onChange(dataUrl);
    } catch {
      setError(t('cover.errorProcess'));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        sx={{
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'primary.50' : 'transparent',
          '&:hover': { borderColor: 'primary.main' },
        }}
        role="button"
        tabIndex={0}
        aria-label={t('cover.uploadAria')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {value ? (
          <Box
            component="img"
            src={value}
            alt={t('cover.previewAria')}
            sx={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Box sx={{ py: 2 }}>
            <MenuBook sx={{ fontSize: 40, color: 'grey.400' }} />
            <Typography variant="body2" color="text.secondary">
              {t('cover.uploadText')}
            </Typography>
          </Box>
        )}
      </Box>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileInput} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileInput} />

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        <Button variant="outlined" size="small" startIcon={<CloudUpload />} onClick={() => inputRef.current?.click()}>
          {t('cover.upload')}
        </Button>
        <Button variant="outlined" size="small" startIcon={<CameraAlt />} onClick={() => cameraRef.current?.click()}>
          {t('cover.camera')}
        </Button>
        {extra}
        {value && (
          <Button size="small" color="error" onClick={() => onChange(undefined)}>
            {t('cover.remove')}
          </Button>
        )}
      </Box>
    </Box>
  );
}
