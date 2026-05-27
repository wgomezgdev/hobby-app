import { useForm } from 'react-hook-form';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
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
      <Typography variant="h5" sx={{ mb: 3 }}>Log Reading Session</Typography>

      <Stack spacing={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...register('startedAt', { required: 'Date is required' })}
          error={!!errors.startedAt}
          helperText={errors.startedAt?.message}
        />

        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          inputProps={{ min: 1 }}
          {...register('durationMinutes', {
            required: 'Duration is required',
            min: { value: 1, message: 'Must be at least 1 minute' },
          })}
          error={!!errors.durationMinutes}
          helperText={errors.durationMinutes?.message}
        />

        <TextField
          label="Progress added (%)"
          type="number"
          fullWidth
          inputProps={{ min: 1, max: 100 }}
          {...register('progressDelta', {
            required: 'Progress is required',
            min: { value: 1, message: 'Must be at least 1%' },
            max: { value: 100, message: 'Cannot exceed 100%' },
          })}
          error={!!errors.progressDelta}
          helperText={errors.progressDelta?.message}
        />

        <TextField
          label="Notes (optional)"
          multiline
          rows={3}
          fullWidth
          {...register('notes')}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save Session
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
