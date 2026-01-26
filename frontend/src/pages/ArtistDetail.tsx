import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Shuffle as ShuffleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { queryAlbums, getAlbumArtUrl } from '../api/beets';
import { usePlayerContext } from '../App';

export default function ArtistDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const player = usePlayerContext();
  const artistName = decodeURIComponent(name || '');

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['artist-albums', artistName],
    queryFn: () => queryAlbums(`albumartist:${artistName}`, true),
    enabled: !!artistName,
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Skeleton variant="circular" width={200} height={200} />
          <Box>
            <Skeleton variant="text" width={300} height={50} />
            <Skeleton variant="text" width={150} height={30} />
          </Box>
        </Box>
      </Box>
    );
  }

  const allItems = albums.flatMap((album) => album.items || []);
  const totalAlbums = albums.length;
  const totalTracks = allItems.length;

  const handlePlayAll = () => {
    if (allItems.length > 0) {
      player.playAlbum(allItems, 0);
    }
  };

  const handleShuffle = () => {
    if (allItems.length > 0) {
      const shuffled = [...allItems].sort(() => Math.random() - 0.5);
      player.playAlbum(shuffled, 0);
    }
  };

  return (
    <Box>
      {/* Artist header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          gap: 3,
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        }}
      >
        <Avatar
          sx={{
            width: 200,
            height: 200,
            fontSize: 80,
            backgroundColor: 'primary.dark',
          }}
        >
          <PersonIcon sx={{ fontSize: 100 }} />
        </Avatar>

        <Box>
          <Typography variant="overline" color="text.secondary">
            Artist
          </Typography>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {artistName || 'Unknown Artist'}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {totalAlbums} albums • {totalTracks} tracks
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
      </Box>

      {/* Albums grid */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Albums
        </Typography>
        <Grid container spacing={2}>
          {albums.map((album) => (
            <Grid item key={album.id}>
              <Card
                sx={{
                  width: 180,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/album/${album.id}`)}
              >
                <CardMedia
                  component="img"
                  height={180}
                  image={getAlbumArtUrl(album.id)}
                  alt={album.album}
                  sx={{ backgroundColor: 'grey.800' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="%23666">?</text></svg>';
                  }}
                />
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {album.album}
                  </Typography>
                  {album.year > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {album.year}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
