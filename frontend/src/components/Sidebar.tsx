import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Album as AlbumIcon,
  Person as ArtistIcon,
  MusicNote as TrackIcon,
  Search as SearchIcon,
  BarChart as StatsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  width: number;
}

const menuItems = [
  { path: '/albums', label: 'Albums', icon: <AlbumIcon /> },
  { path: '/artists', label: 'Artists', icon: <ArtistIcon /> },
  { path: '/tracks', label: 'Tracks', icon: <TrackIcon /> },
  { path: '/search', label: 'Search', icon: <SearchIcon /> },
  { path: '/stats', label: 'Statistics', icon: <StatsIcon /> },
];

export default function Sidebar({ open, onToggle, width }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary">
          Beetbox
        </Typography>
        <IconButton onClick={onToggle} size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.dark',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
