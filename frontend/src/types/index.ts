// Beets Item (Track) type
export interface Item {
  id: number;
  title: string;
  artist: string;
  album: string;
  album_id: number;
  albumartist: string;
  genre: string;
  year: number;
  track: number;
  disc: number;
  length: number;
  bitrate: number;
  format: string;
  samplerate: number;
  channels: number;
  bpm: number;
  composer: string;
  comments: string;
  mb_trackid: string;
  mb_albumid: string;
  mb_artistid: string;
  added: number;
  mtime: number;
  size: number;
  path?: string;
}

// Beets Album type
export interface Album {
  id: number;
  album: string;
  albumartist: string;
  genre: string;
  year: number;
  month: number;
  day: number;
  disctotal: number;
  comp: boolean;
  mb_albumid: string;
  mb_albumartistid: string;
  label: string;
  added: number;
  artpath?: string;
  items?: Item[];
}

// API response types
export interface ItemsResponse {
  items: Item[];
}

export interface AlbumsResponse {
  albums: Album[];
}

export interface QueryResponse {
  results: Item[] | Album[];
}

export interface ArtistsResponse {
  artist_names: string[];
}

export interface StatsResponse {
  items: number;
  albums: number;
  artists: number;
  total_duration: number;
  total_size: number;
  genres: number;
}

export interface ValuesResponse {
  values: (string | number | null)[];
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database?: string;
  error?: string;
}

// Player state
export interface PlayerState {
  currentItem: Item | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Item[];
  queueIndex: number;
}

// View modes
export type ViewMode = 'grid' | 'list';

// Sort options
export interface SortOption {
  field: string;
  label: string;
  direction: 'asc' | 'desc';
}
