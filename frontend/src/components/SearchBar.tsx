import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useDebouncedCallback } from '../hooks/useDebounce';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showTypeFilter?: boolean;
  initialQuery?: string;
}

type SearchType = 'all' | 'albums' | 'artists' | 'tracks';

export default function SearchBar({
  onSearch,
  placeholder = 'Search your library...',
  showTypeFilter = true,
  initialQuery = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>('all');
  const navigate = useNavigate();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearch) {
      onSearch(value);
    } else {
      navigate(`/search?q=${encodeURIComponent(value)}&type=${searchType}`);
    }
  }, 300);

  const handleChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
    >
      <TextField
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        size="small"
        sx={{ flex: 1, maxWidth: 500 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {showTypeFilter && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={searchType}
            label="Type"
            onChange={(e) => setSearchType(e.target.value as SearchType)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="albums">Albums</MenuItem>
            <MenuItem value="artists">Artists</MenuItem>
            <MenuItem value="tracks">Tracks</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );
}
