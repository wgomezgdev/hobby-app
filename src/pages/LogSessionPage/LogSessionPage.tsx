import { useForm } from 'react-hook-form';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { saveSession } from '../../repositories/sessionRepository';

interface SessionFormData {
  startedAt: string;
  durationMinutes: number;
  progressDelta: number;
  notes: string;
}

export function LogSessionPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id!, 10);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    defaultValues: {
      startedAt: new Date().toISOString().split('T')[0],
      durationMinutes: 30,
      progressDelta: 5,
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    await saveSession({
      bookId,
      startedAt: new Date(data.startedAt).getTime(),
      durationMinutes: Number(data.durationMinutes),
      progressDelta: Number(data.progressDelta),
      notes: data.notes || undefined,
    });
    navigate(`/books/${bookId}?tab=sessions`);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>{t('session.logTitle')}</Typography>

      <Stack spacing={3}>
        <TextField
          label={t('session.date')}
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...register('startedAt', { required: t('session.dateRequired') })}
          error={!!errors.startedAt}
          helperText={errors.startedAt?.message}
        />

        <TextField
          label={t('session.duration')}
          type="number"
          fullWidth
          inputProps={{ min: 1 }}
          {...register('durationMinutes', {
            required: t('session.durationRequired'),
            min: { value: 1, message: t('session.durationMin') },
          })}
          error={!!errors.durationMinutes}
          helperText={errors.durationMinutes?.message}
        />

        <TextField
          label={t('session.progress')}
          type="number"
          fullWidth
          inputProps={{ min: 1, max: 100 }}
          {...register('progressDelta', {
            required: t('session.progressRequired'),
            min: { value: 1, message: t('session.progressMin') },
            max: { value: 100, message: t('session.progressMax') },
          })}
          error={!!errors.progressDelta}
          helperText={errors.progressDelta?.message}
        />

        <TextField
          label={t('session.notes')}
          multiline
          rows={3}
          fullWidth
          {...register('notes')}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={() => navigate(-1)}>{t('session.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t('session.save')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
