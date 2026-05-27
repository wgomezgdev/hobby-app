import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useRating } from '../../../hooks/useRatings';
import { saveRating } from '../../../repositories/ratingRepository';
import { StarRating } from '../../../components/StarRating/StarRating';

interface RatingTabProps {
  bookId: number;
}

interface RatingFormData {
  stars: number | null;
  review: string;
}

export function RatingTab({ bookId }: RatingTabProps) {
  const rating = useRating(bookId);

  const { handleSubmit, control, reset, formState: { isSubmitting } } =
    useForm<RatingFormData>({ defaultValues: { stars: null, review: '' } });

  useEffect(() => {
    if (rating) {
      reset({ stars: rating.stars, review: rating.review ?? '' });
    }
  }, [rating, reset]);

  const onSubmit = async (data: RatingFormData) => {
    if (!data.stars) return;
    await saveRating({
      bookId,
      stars: data.stars,
      review: data.review || undefined,
      ratedAt: Date.now(),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ py: 2, maxWidth: 480 }}>
      {!rating && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You haven't rated this book yet
        </Typography>
      )}
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>Your rating</Typography>
          <Controller
            name="stars"
            control={control}
            rules={{ required: 'Please select a rating' }}
            render={({ field }) => (
              <StarRating value={field.value} onChange={field.onChange} />
            )}
          />
        </Box>
        <TextField
          label="Review (optional)"
          multiline
          rows={4}
          fullWidth
          {...(control.register('review'))}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
          {rating ? 'Update Rating' : 'Save Rating'}
        </Button>
      </Stack>
    </Box>
  );
}
