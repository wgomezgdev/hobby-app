import { useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createClub } from '../../repositories/clubRepository';
import type { Club } from '../../types/clubs';

interface Props {
  open: boolean;
  onClose: () => void;
  user: { uid: string; displayName: string | null; photoURL: string | null };
}

type FormData = Pick<Club, 'name' | 'bookTitle' | 'bookAuthor'> & { description: string };

export function CreateClubDialog({ open, onClose, user }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const clubId = await createClub(
        {
          name: data.name,
          bookTitle: data.bookTitle,
          bookAuthor: data.bookAuthor,
          description: data.description || undefined,
          moderatorUid: user.uid,
        },
        {
          uid: user.uid,
          displayName: user.displayName ?? 'Unknown',
          photoURL: user.photoURL,
        }
      );
      reset();
      onClose();
      navigate(`/clubs/${clubId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('club.create.error'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('club.create.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label={t('club.create.clubName')}
          {...register('name', { required: t('club.create.nameRequired'), maxLength: { value: 80, message: t('club.create.nameTooLong') } })}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
        <TextField
          label={t('club.create.bookTitle')}
          {...register('bookTitle', { required: t('club.create.bookTitleRequired') })}
          error={!!errors.bookTitle}
          helperText={errors.bookTitle?.message}
          fullWidth
        />
        <TextField
          label={t('club.create.bookAuthor')}
          {...register('bookAuthor', { required: t('club.create.bookAuthorRequired') })}
          error={!!errors.bookAuthor}
          helperText={errors.bookAuthor?.message}
          fullWidth
        />
        <TextField
          label={t('club.create.description')}
          {...register('description')}
          multiline
          rows={2}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('club.create.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('club.create.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
