import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
} from '@mui/icons-material';
import { usePlayerContext } from '../App';
import { formatDuration, getAlbumArtUrl } from '../api/beets';

export default function AudioPlayer() {
  const player = usePlayerContext();
  const { currentItem, isPlaying, volume, currentTime, duration, queue, queueIndex } = player;

  if (!currentItem) return null;

  const hasNext = queueIndex < queue.length - 1;
  const hasPrev = queueIndex > 0 || currentTime > 3;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
        zIndex: 1200,
        backgroundColor: 'background.paper',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {/* Album art and track info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 300 }}>
        <Box
          component="img"
          src={currentItem.album_id ? getAlbumArtUrl(currentItem.album_id) : undefined}
          alt={currentItem.album}
          sx={{
            width: 56,
            height: 56,
            borderRadius: 1,
            objectFit: 'cover',
            backgroundColor: 'grey.800',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body1" noWrap fontWeight="medium">
            {currentItem.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentItem.artist}
          </Typography>
        </Box>
      </Box>

      {/* Playback controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          maxWidth: 600,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={player.previous}
            disabled={!hasPrev}
            size="small"
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            onClick={player.togglePlayPause}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' },
              width: 40,
              height: 40,
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <IconButton
            onClick={player.next}
            disabled={!hasNext}
            size="small"
          >
            <NextIcon />
          </IconButton>
        </Box>

        {/* Progress bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: 'right' }}>
            {formatDuration(currentTime)}
          </Typography>
          <Slider
            size="small"
            value={currentTime}
            max={duration || 100}
            onChange={(_, value) => player.seek(value as number)}
            sx={{ flex: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ width: 40 }}>
            {formatDuration(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Volume control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 150 }}>
        <IconButton
          size="small"
          onClick={() => player.setVolume(volume === 0 ? 1 : 0)}
        >
          {volume === 0 ? <MuteIcon /> : <VolumeIcon />}
        </IconButton>
        <Slider
          size="small"
          value={volume}
          max={1}
          step={0.01}
          onChange={(_, value) => player.setVolume(value as number)}
          sx={{ width: 100 }}
        />
      </Box>
    </Paper>
  );
}
