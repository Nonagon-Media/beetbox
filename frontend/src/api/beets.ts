import type {
  Item,
  Album,
  ItemsResponse,
  AlbumsResponse,
  QueryResponse,
  ArtistsResponse,
  StatsResponse,
  ValuesResponse,
  HealthResponse,
} from '../types';

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Items API

export async function getAllItems(): Promise<Item[]> {
  const data = await apiFetch<ItemsResponse>('/item/');
  return data.items;
}

export async function getItem(id: number, expand?: boolean): Promise<Item> {
  const query = expand ? '?expand' : '';
  return apiFetch<Item>(`/item/${id}${query}`);
}

export async function getItems(ids: number[]): Promise<Item[]> {
  const data = await apiFetch<ItemsResponse>(`/item/${ids.join(',')}`);
  return data.items;
}

export async function queryItems(query: string, expand?: boolean): Promise<Item[]> {
  const expandQuery = expand ? '?expand' : '';
  const data = await apiFetch<QueryResponse>(`/item/query/${encodeURIComponent(query)}${expandQuery}`);
  return data.results as Item[];
}

export async function updateItem(id: number, updates: Partial<Item>): Promise<Item> {
  return apiFetch<Item>(`/item/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteItem(id: number, deleteFile?: boolean): Promise<void> {
  const query = deleteFile ? '?delete' : '';
  await apiFetch<{ deleted: boolean }>(`/item/${id}${query}`, {
    method: 'DELETE',
  });
}

export function getItemFileUrl(id: number): string {
  return `${API_BASE}/item/${id}/file`;
}

export async function getItemValues(field: string, sortKey?: string): Promise<(string | number | null)[]> {
  const query = sortKey ? `?sort_key=${encodeURIComponent(sortKey)}` : '';
  const data = await apiFetch<ValuesResponse>(`/item/values/${encodeURIComponent(field)}${query}`);
  return data.values;
}

// Albums API

export async function getAllAlbums(): Promise<Album[]> {
  const data = await apiFetch<AlbumsResponse>('/album/');
  return data.albums;
}

export async function getAlbum(id: number, expand?: boolean): Promise<Album> {
  const query = expand ? '?expand' : '';
  return apiFetch<Album>(`/album/${id}${query}`);
}

export async function getAlbums(ids: number[]): Promise<Album[]> {
  const data = await apiFetch<AlbumsResponse>(`/album/${ids.join(',')}`);
  return data.albums;
}

export async function queryAlbums(query: string, expand?: boolean): Promise<Album[]> {
  const expandQuery = expand ? '?expand' : '';
  const data = await apiFetch<QueryResponse>(`/album/query/${encodeURIComponent(query)}${expandQuery}`);
  return data.results as Album[];
}

export async function deleteAlbum(id: number, deleteFiles?: boolean): Promise<void> {
  const query = deleteFiles ? '?delete' : '';
  await apiFetch<{ deleted: boolean }>(`/album/${id}${query}`, {
    method: 'DELETE',
  });
}

export function getAlbumArtUrl(id: number): string {
  return `${API_BASE}/album/${id}/art`;
}

export async function getAlbumValues(field: string, sortKey?: string): Promise<(string | number | null)[]> {
  const query = sortKey ? `?sort_key=${encodeURIComponent(sortKey)}` : '';
  const data = await apiFetch<ValuesResponse>(`/album/values/${encodeURIComponent(field)}${query}`);
  return data.values;
}

// Artists API

export async function getAllArtists(): Promise<string[]> {
  const data = await apiFetch<ArtistsResponse>('/artist/');
  return data.artist_names;
}

// Stats API

export async function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/stats');
}

// Health API

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}

// Utility functions

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatBitrate(bitrate: number): string {
  return `${Math.round(bitrate / 1000)} kbps`;
}
