import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { Virtuoso } from 'react-virtuoso';
import { getAllArtists, queryAlbums } from '../api/beets';

export default function Artists() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: getAllArtists,
  });

  const filteredArtists = artists.filter((artist) =>
    artist.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 10,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Artists
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filteredArtists.length})
          </Typography>
        </Typography>

        <TextField
          size="small"
          placeholder="Filter artists..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Artist list */}
      <Virtuoso
        style={{ height: 'calc(100vh - 64px)' }}
        data={filteredArtists}
        itemContent={(index, artist) => (
          <ListItem
            disablePadding
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <ListItemButton
              onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
              sx={{ py: 1.5 }}
            >
              <Avatar sx={{ mr: 2, backgroundColor: 'primary.dark' }}>
                <PersonIcon />
              </Avatar>
              <ListItemText
                primary={artist || 'Unknown Artist'}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItemButton>
          </ListItem>
        )}
      />
    </Box>
  );
}
