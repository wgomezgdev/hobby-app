import { BottomNavigation, BottomNavigationAction, Box, Fab, Paper, Typography } from '@mui/material';
import { Add, BarChart, Home, MenuBook, Person } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

function getActiveTab(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/library') || pathname.startsWith('/books') || pathname === '/ranking') return '/library';
  if (pathname === '/stats') return '/stats';
  if (pathname === '/settings') return '/settings';
  return '/';
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTab(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: '72px' }}>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      <Paper
        elevation={8}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
      >
        {/* Version sits at the top of the nav panel — always visible above nav icons */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', textAlign: 'center', pt: 0.5, fontSize: '0.6rem', lineHeight: 1 }}
        >
          v{__APP_VERSION__}
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <BottomNavigation value={activeTab} onChange={(_, val) => navigate(val)}>
            <BottomNavigationAction label="Home" value="/" icon={<Home />} />
            <BottomNavigationAction label="Library" value="/library" icon={<MenuBook />} />
            {/* placeholder slot for the center FAB */}
            <BottomNavigationAction sx={{ visibility: 'hidden', pointerEvents: 'none' }} value="" />
            <BottomNavigationAction label="Stats" value="/stats" icon={<BarChart />} />
            <BottomNavigationAction label="Profile" value="/settings" icon={<Person />} />
          </BottomNavigation>

          <Fab
            color="primary"
            aria-label="Add book"
            size="medium"
            onClick={() => navigate('/books/new')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          >
            <Add />
          </Fab>
        </Box>
      </Paper>
    </Box>
  );
}
