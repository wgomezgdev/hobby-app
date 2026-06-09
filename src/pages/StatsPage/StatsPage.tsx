import { Box, Card, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import { useStats } from '../../hooks/useStats';
import { useStatsUiStore } from '../../stores/statsUiStore';

const GENRE_COLORS = ['#E07940', '#F4A261', '#E9C46A', '#A8DADC', '#6A994E'];

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function StatsPage() {
  const stats = useStats();
  const { selectedYear, setYear } = useStatsUiStore();

  if (!stats) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton width="50%" height={36} sx={{ mb: 1 }} />
        <Skeleton width="30%" height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const {
    booksRead, booksByMonth, avgPerMonth, genreBreakdown, totalPages,
    bestMonth, yoyChange, availableYears,
    totalReadingMinutes, totalSessions, readingStreak,
  } = stats;

  const years: (number | 'all')[] = [...availableYears, 'all'];
  const hasAnyData = booksRead > 0 || totalSessions > 0;

  if (!hasAnyData && availableYears.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6">Statistics 📊</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Log a reading session to see statistics
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700}>Statistics 📊</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Your reading progress</Typography>

      {/* Year filter */}
      {years.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
          {years.map(y => (
            <Chip
              key={String(y)}
              label={y === 'all' ? 'All' : String(y)}
              onClick={() => setYear(y)}
              color={selectedYear === y ? 'primary' : 'default'}
              variant={selectedYear === y ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
      )}

      {/* Books read card */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="primary.main">{booksRead}</Typography>
            <Typography variant="body2" color="text.secondary">Books read · Annual goal: 50</Typography>
          </Box>
          {yoyChange != null && (
            <Chip
              icon={<TrendingUp fontSize="small" />}
              label={`${yoyChange > 0 ? '+' : ''}${yoyChange}% vs last year`}
              size="small"
              color={yoyChange >= 0 ? 'success' : 'error'}
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Card>

      {/* Reading activity card */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Reading Activity</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {totalSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">Sessions</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {formatHours(totalReadingMinutes)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Time read</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {readingStreak}🔥
            </Typography>
            <Typography variant="caption" color="text.secondary">Day streak</Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Monthly bar chart */}
      {booksRead > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>Books per month</Typography>
            <Typography variant="caption" color="text.secondary">ø {avgPerMonth} / mo</Typography>
          </Box>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={booksByMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9E9E9E' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #F0E0D0', borderRadius: 8 }}
                cursor={{ fill: 'rgba(224,121,64,0.08)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {booksByMonth.map((entry, index) => (
                  <Cell key={index} fill={entry.count > 0 ? '#E07940' : '#F0E0D0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Genre donut + right stats */}
      {booksRead > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Genres</Typography>
              {genreBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie
                        data={genreBreakdown}
                        dataKey="count"
                        nameKey="genre"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={46}
                      >
                        {genreBreakdown.map((_, i) => (
                          <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {genreBreakdown.slice(0, 4).map((g, i) => (
                      <Box key={g.genre} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                          <Typography variant="caption" noWrap sx={{ maxWidth: 70 }}>{g.genre}</Typography>
                        </Box>
                        <Typography variant="caption" color="primary.main" fontWeight={700}>{g.pct}%</Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">No genres tagged</Typography>
              )}
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Card sx={{ p: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>PAGES READ</Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {totalPages > 0 ? totalPages.toLocaleString('en-US') : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalPages === 0 ? 'add page counts to books' : selectedYear === 'all' ? 'all time' : `in ${selectedYear}`}
                </Typography>
              </Card>
              <Card sx={{ p: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>BEST MONTH</Typography>
                {bestMonth ? (
                  <>
                    <Typography variant="h6" fontWeight={800}>{bestMonth.month}</Typography>
                    <Typography variant="caption" color="text.secondary">{bestMonth.count} books 🔥</Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">No data</Typography>
                )}
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
