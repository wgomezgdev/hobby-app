import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { MenuBook, Settings } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <MenuBook sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
          >
            Reading Pal
          </Typography>
          <IconButton color="inherit" component={Link} to="/ranking" aria-label="Ranking">
            <Typography variant="button" sx={{ mr: 1 }}>Ranking</Typography>
          </IconButton>
          <IconButton color="inherit" component={Link} to="/settings" aria-label="Settings">
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{ position: 'sticky', bottom: 0, textAlign: 'center', py: 0.5, bgcolor: 'background.default' }}
      >
        <Typography variant="caption" color="text.disabled">
          v{__APP_VERSION__}
        </Typography>
      </Box>
    </Box>
  );
}
