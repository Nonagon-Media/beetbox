import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  GridView as GridIcon,
  ViewList as ListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import AlbumGrid from '../components/AlbumGrid';
import { getAllAlbums } from '../api/beets';
import type { Album, ViewMode } from '../types';

type SortField = 'album' | 'albumartist' | 'year' | 'added';

export default function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('albumartist');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums,
  });

  // Filter and sort albums
  const filteredAlbums = albums
    .filter((album) => {
      if (!filter) return true;
      const searchLower = filter.toLowerCase();
      return (
        album.album.toLowerCase().includes(searchLower) ||
        album.albumartist.toLowerCase().includes(searchLower) ||
        album.genre?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'album':
          comparison = a.album.localeCompare(b.album);
          break;
        case 'albumartist':
          comparison = a.albumartist.localeCompare(b.albumartist);
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
          Albums
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filteredAlbums.length})
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Filter */}
          <TextField
            size="small"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Sort */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortField}
              label="Sort by"
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <MenuItem value="albumartist">Artist</MenuItem>
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

          {/* View mode */}
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
          >
            <ToggleButton value="grid">
              <GridIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <ListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Content */}
      <AlbumGrid albums={filteredAlbums} isLoading={isLoading} />
    </Box>
  );
}
