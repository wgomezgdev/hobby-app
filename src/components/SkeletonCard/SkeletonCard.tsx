import { Card, CardContent, Skeleton } from '@mui/material';

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={160} />
      <CardContent>
        <Skeleton width="85%" />
        <Skeleton width="60%" />
        <Skeleton width="40%" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
