import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, Skeleton } from '@mui/material';
import { Virtuoso } from 'react-virtuoso';
import type { Album } from '../types';
import { getAlbumArtUrl } from '../api/beets';

interface AlbumGridProps {
  albums: Album[];
  isLoading?: boolean;
}

const CARD_WIDTH = 180;
const CARD_HEIGHT = 240;
const GAP = 16;

export default function AlbumGrid({ albums, isLoading }: AlbumGridProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  // Calculate items per row based on container width
  // Using virtuoso for large collections
  const itemsPerRow = 6; // Will be dynamic in real implementation

  const rows: Album[][] = [];
  for (let i = 0; i < albums.length; i += itemsPerRow) {
    rows.push(albums.slice(i, i + itemsPerRow));
  }

  return (
    <Virtuoso
      style={{ height: 'calc(100vh - 64px)' }}
      totalCount={rows.length}
      itemContent={(index) => (
        <Box
          sx={{
            display: 'flex',
            gap: `${GAP}px`,
            px: 2,
            py: 1,
            flexWrap: 'wrap',
          }}
        >
          {rows[index].map((album) => (
            <Card
              key={album.id}
              sx={{
                width: CARD_WIDTH,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(`/album/${album.id}`)}
            >
              <CardMedia
                component="img"
                height={CARD_WIDTH}
                image={getAlbumArtUrl(album.id)}
                alt={album.album}
                sx={{
                  backgroundColor: 'grey.800',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="%23666">?</text></svg>';
                }}
              />
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {album.album}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {album.albumartist}
                </Typography>
                {album.year > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {album.year}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    />
  );
}
