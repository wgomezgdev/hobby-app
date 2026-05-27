import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          aria-label={`Reading progress: ${value}%`}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 36 }}>
        {value}%
      </Typography>
    </Box>
  );
}
