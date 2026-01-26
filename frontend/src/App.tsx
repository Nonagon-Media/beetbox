import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { usePlayer } from './hooks/usePlayer';

// Layout
import Sidebar from './components/Sidebar';
import AudioPlayer from './components/AudioPlayer';

// Pages
import Library from './pages/Library';
import AlbumDetail from './pages/AlbumDetail';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Tracks from './pages/Tracks';
import Search from './pages/Search';
import Stats from './pages/Stats';

// Player context
type PlayerContextType = ReturnType<typeof usePlayer>;
const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
}

const SIDEBAR_WIDTH = 240;

function App() {
  const player = usePlayer();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PlayerContext.Provider value={player}>
      <BrowserRouter>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            width={SIDEBAR_WIDTH}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
              transition: 'margin-left 0.3s',
              pb: player.currentItem ? '90px' : 0,
              minHeight: '100vh',
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/albums" replace />} />
              <Route path="/albums" element={<Library />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artist/:name" element={<ArtistDetail />} />
              <Route path="/tracks" element={<Tracks />} />
              <Route path="/search" element={<Search />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </Box>
          {player.currentItem && <AudioPlayer />}
        </Box>
      </BrowserRouter>
    </PlayerContext.Provider>
  );
}

export default App;
