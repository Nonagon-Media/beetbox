import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Album as AlbumIcon,
  Person as PersonIcon,
  MusicNote as TrackIcon,
} from '@mui/icons-material';
import { queryAlbums, queryItems, getAlbumArtUrl } from '../api/beets';
import TrackList from '../components/TrackList';

type TabValue = 'all' | 'albums' | 'artists' | 'tracks';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState<TabValue>((searchParams.get('type') as TabValue) || 'all');

  // Update URL when search changes
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query, type: tab });
    }
  }, [query, tab, setSearchParams]);

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['search-albums', query],
    queryFn: () => queryAlbums(query),
    enabled: !!query && (tab === 'all' || tab === 'albums'),
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['search-items', query],
    queryFn: () => queryItems(query),
    enabled: !!query && (tab === 'all' || tab === 'tracks'),
  });

  // Extract unique artists from search results
  const artists = [...new Set([
    ...albums.map(a => a.albumartist),
    ...items.map(i => i.artist),
  ])].filter(Boolean);

  const isLoading = albumsLoading || itemsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Box>
      {/* Search header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 10,
        }}
      >
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Search for albums, artists, or tracks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="All" value="all" />
          <Tab
            label={`Albums (${albums.length})`}
            value="albums"
            icon={<AlbumIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label={`Artists (${artists.length})`}
            value="artists"
            icon={<PersonIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label={`Tracks (${items.length})`}
            value="tracks"
            icon={<TrackIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Results */}
      <Box sx={{ p: 2 }}>
        {!query && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Start typing to search your library
          </Typography>
        )}

        {query && isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {query && !isLoading && (
          <>
            {/* Albums section */}
            {(tab === 'all' || tab === 'albums') && albums.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Albums
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {albums.slice(0, tab === 'all' ? 6 : undefined).map((album) => (
                    <Card
                      key={album.id}
                      sx={{
                        width: 150,
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-4px)' },
                        transition: 'transform 0.2s',
                      }}
                      onClick={() => navigate(`/album/${album.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height={150}
                        image={getAlbumArtUrl(album.id)}
                        alt={album.album}
                        sx={{ backgroundColor: 'grey.800' }}
                      />
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="body2" noWrap fontWeight="medium">
                          {album.album}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {album.albumartist}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Artists section */}
            {(tab === 'all' || tab === 'artists') && artists.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Artists
                </Typography>
                <List disablePadding>
                  {artists.slice(0, tab === 'all' ? 5 : undefined).map((artist) => (
                    <ListItem key={artist} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}
                      >
                        <Avatar sx={{ mr: 2, backgroundColor: 'primary.dark' }}>
                          <PersonIcon />
                        </Avatar>
                        <ListItemText primary={artist} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Tracks section */}
            {(tab === 'all' || tab === 'tracks') && items.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tracks
                </Typography>
                <TrackList
                  items={tab === 'all' ? items.slice(0, 10) : items}
                  showAlbum
                  showArtist
                />
              </Box>
            )}

            {/* No results */}
            {albums.length === 0 && items.length === 0 && (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No results found for "{query}"
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
