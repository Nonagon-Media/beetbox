import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import TrackList from '../components/TrackList';
import { getAllItems } from '../api/beets';
import type { Item } from '../types';

type SortField = 'title' | 'artist' | 'album' | 'year' | 'added';

export default function Tracks() {
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('artist');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  });

  const filteredItems = items
    .filter((item) => {
      if (!filter) return true;
      const searchLower = filter.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.artist.toLowerCase().includes(searchLower) ||
        item.album.toLowerCase().includes(searchLower) ||
        item.genre?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'album':
          comparison = a.album.localeCompare(b.album);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'added':
          comparison = (a.added || 0) - (b.added || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

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
          Tracks
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filteredItems.length})
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Filter tracks..."
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortField}
              label="Sort by"
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <MenuItem value="artist">Artist</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="album">Album</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="added">Date Added</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            size="small"
            value={sortDirection}
            exclusive
            onChange={(_, value) => value && setSortDirection(value)}
          >
            <ToggleButton value="asc">A-Z</ToggleButton>
            <ToggleButton value="desc">Z-A</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Track list */}
      <Box sx={{ px: 2 }}>
        <TrackList items={filteredItems} showAlbum showArtist />
      </Box>
    </Box>
  );
}
