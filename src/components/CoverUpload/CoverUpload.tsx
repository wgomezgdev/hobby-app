import { useState, useRef } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { CloudUpload, CameraAlt, MenuBook } from '@mui/icons-material';

interface CoverUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.82;

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

export function CoverUpload({ value, onChange }: CoverUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    try {
      const dataUrl = await resizeAndEncode(file);
      onChange(dataUrl);
    } catch {
      setError('Could not process image. Please try another.');
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
        aria-label="Upload cover image"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {value ? (
          <Box
            component="img"
            src={value}
            alt="Book cover preview"
            sx={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Box sx={{ py: 2 }}>
            <MenuBook sx={{ fontSize: 40, color: 'grey.400' }} />
            <Typography variant="body2" color="text.secondary">
              Click or drag to upload cover
            </Typography>
          </Box>
        )}
      </Box>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileInput} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileInput} />

      {value && (
        <Button size="small" onClick={() => onChange(undefined)} sx={{ mt: 0.5 }}>
          Remove cover
        </Button>
      )}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <CloudUpload fontSize="small" color="action" />
        <Button variant="outlined" size="small" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
        <CameraAlt fontSize="small" color="action" />
        <Button variant="outlined" size="small" onClick={() => cameraRef.current?.click()}>
          Take photo
        </Button>
      </Box>
    </Box>
  );
}
