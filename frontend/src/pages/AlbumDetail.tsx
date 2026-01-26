import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Paper,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import { getAlbum, getAlbumArtUrl, formatDuration } from '../api/beets';
import TrackList from '../components/TrackList';
import { usePlayerContext } from '../App';

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const player = usePlayerContext();

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => getAlbum(Number(id), true),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Skeleton variant="rectangular" width={250} height={250} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={30} />
            <Skeleton variant="text" width={150} height={24} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!album) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Album not found</Typography>
      </Box>
    );
  }

  const items = album.items || [];
  const totalDuration = items.reduce((sum, item) => sum + item.length, 0);

  const handlePlayAll = () => {
    if (items.length > 0) {
      player.playAlbum(items, 0);
    }
  };

  const handleShuffle = () => {
    if (items.length > 0) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      player.playAlbum(shuffled, 0);
    }
  };

  return (
    <Box>
      {/* Album header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          display: 'flex',
          gap: 3,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        }}
      >
        <Box
          component="img"
          src={getAlbumArtUrl(album.id)}
          alt={album.album}
          sx={{
            width: 250,
            height: 250,
            borderRadius: 2,
            boxShadow: 4,
            objectFit: 'cover',
            backgroundColor: 'grey.800',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="%23666">?</text></svg>';
          }}
        />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <Typography variant="overline" color="text.secondary">
            Album
          </Typography>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {album.album}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {album.albumartist}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {album.year > 0 && <Chip label={album.year} size="small" />}
            {album.genre && <Chip label={album.genre} size="small" variant="outlined" />}
            {album.label && <Chip label={album.label} size="small" variant="outlined" />}
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {items.length} tracks • {formatDuration(totalDuration)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <IconButton
              onClick={handlePlayAll}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
                width: 56,
                height: 56,
              }}
            >
              <PlayIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              onClick={handleShuffle}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ShuffleIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Track list */}
      <Box sx={{ px: 2 }}>
        <TrackList items={items} showArtist={false} />
      </Box>
    </Box>
  );
}
