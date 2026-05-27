import { Rating, Box, Typography } from '@mui/material';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        value={value}
        onChange={readOnly ? undefined : (_, newValue) => onChange?.(newValue)}
        readOnly={readOnly}
        precision={1}
        aria-label={readOnly ? `${value} out of 5 stars` : 'Rate this book'}
      />
      {value && (
        <Typography variant="body2" color="text.secondary">
          {value}/5
        </Typography>
      )}
    </Box>
  );
}
