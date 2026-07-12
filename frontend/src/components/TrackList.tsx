import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Item } from '../types';
import { formatDuration } from '../api/beets';
import { usePlayerContext } from '../App';

interface TrackListProps {
  items: Item[];
  showAlbum?: boolean;
  showArtist?: boolean;
}

export default function TrackList({
  items,
  showAlbum = false,
  showArtist = true,
}: TrackListProps) {
  const player = usePlayerContext();

  const isCurrentTrack = (item: Item) =>
    player.currentItem?.id === item.id;

  const handlePlay = (item: Item, index: number) => {
    if (isCurrentTrack(item)) {
      player.togglePlayPause();
    } else {
      player.playAlbum(items, index);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'background.paper' }}>
            <TableCell width={50}>#</TableCell>
            <TableCell>Title</TableCell>
            {showArtist && <TableCell>Artist</TableCell>}
            {showAlbum && <TableCell>Album</TableCell>}
            <TableCell align="right">Duration</TableCell>
            <TableCell width={100} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isCurrentTrack(item) && player.isPlaying ? (
                    <Box
                      sx={{
                        width: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      {[1, 2, 3].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 3,
                            height: 12,
                            backgroundColor: 'primary.main',
                            animation: 'pulse 0.5s ease-in-out infinite',
                            animationDelay: `${i * 0.1}s`,
                            '@keyframes pulse': {
                              '0%, 100%': { transform: 'scaleY(0.4)' },
                              '50%': { transform: 'scaleY(1)' },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {item.track || index + 1}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={isCurrentTrack(item) ? 'medium' : 'regular'}
                  color={isCurrentTrack(item) ? 'primary' : 'inherit'}
                >
                  {item.title}
                </Typography>
              </TableCell>
              {showArtist && (
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.artist}
                  </Typography>
                </TableCell>
              )}
              {showAlbum && (
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.album}
                  </Typography>
                </TableCell>
              )}
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {formatDuration(item.length)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => handlePlay(item, index)}
                >
                  {isCurrentTrack(item) && player.isPlaying ? (
                    <PauseIcon fontSize="small" />
                  ) : (
                    <PlayIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => player.addToQueue(item)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
