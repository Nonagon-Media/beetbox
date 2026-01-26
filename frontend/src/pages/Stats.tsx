import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Album as AlbumIcon,
  Person as ArtistIcon,
  MusicNote as TrackIcon,
  AccessTime as DurationIcon,
  Storage as StorageIcon,
  Category as GenreIcon,
} from '@mui/icons-material';
import { getStats, formatDuration, formatFileSize, getItemValues, getAlbumValues } from '../api/beets';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: 'primary.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {isLoading ? <Skeleton width={80} /> : value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Stats() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  const { data: genres = [] } = useQuery({
    queryKey: ['genre-values'],
    queryFn: () => getItemValues('genre'),
  });

  const { data: years = [] } = useQuery({
    queryKey: ['year-values'],
    queryFn: () => getAlbumValues('year'),
  });

  const { data: formats = [] } = useQuery({
    queryKey: ['format-values'],
    queryFn: () => getItemValues('format'),
  });

  // Calculate decade distribution
  const decades = years
    .filter((y): y is number => typeof y === 'number' && y > 0)
    .reduce((acc, year) => {
      const decade = Math.floor(year / 10) * 10;
      acc[decade] = (acc[decade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

  const sortedDecades = Object.entries(decades)
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 10);

  // Top genres (filter empty and limit)
  const topGenres = genres
    .filter((g): g is string => typeof g === 'string' && g.length > 0)
    .slice(0, 10);

  // Format distribution
  const formatList = formats.filter((f): f is string => typeof f === 'string' && f.length > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Library Statistics
      </Typography>

      {/* Main stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Tracks"
            value={stats?.items.toLocaleString() || 0}
            icon={<TrackIcon />}
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Albums"
            value={stats?.albums.toLocaleString() || 0}
            icon={<AlbumIcon />}
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Artists"
            value={stats?.artists.toLocaleString() || 0}
            icon={<ArtistIcon />}
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Duration"
            value={stats ? formatDuration(stats.total_duration) : '0:00'}
            icon={<DurationIcon />}
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Library Size"
            value={stats ? formatFileSize(stats.total_size) : '0 B'}
            icon={<StorageIcon />}
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Genres"
            value={stats?.genres || 0}
            icon={<GenreIcon />}
            isLoading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* Detailed stats */}
      <Grid container spacing={3}>
        {/* Top Genres */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Genres
            </Typography>
            <List dense disablePadding>
              {topGenres.map((genre, index) => (
                <ListItem key={genre} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{genre}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{index + 1}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {topGenres.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No genre data available
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Decades */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Albums by Decade
            </Typography>
            <List dense disablePadding>
              {sortedDecades.map(([decade, count]) => (
                <ListItem key={decade} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{decade}s</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} albums
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {sortedDecades.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No year data available
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Formats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Audio Formats
            </Typography>
            <List dense disablePadding>
              {formatList.map((format) => (
                <ListItem key={format} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText primary={format} />
                </ListItem>
              ))}
              {formatList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No format data available
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
