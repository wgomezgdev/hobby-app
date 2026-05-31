import { BottomNavigation, BottomNavigationAction, Box, Fab, Paper } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: '56px' }}>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      <Paper
        elevation={8}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
      >
        <BottomNavigation value={activeTab} onChange={(_, val) => navigate(val)}>
          <BottomNavigationAction label="Inicio" value="/" icon={<Home />} />
          <BottomNavigationAction label="Biblioteca" value="/library" icon={<MenuBook />} />
          {/* placeholder slot for the center FAB */}
          <BottomNavigationAction sx={{ visibility: 'hidden', pointerEvents: 'none' }} value="" />
          <BottomNavigationAction label="Stats" value="/stats" icon={<BarChart />} />
          <BottomNavigationAction label="Perfil" value="/settings" icon={<Person />} />
        </BottomNavigation>

        <Fab
          color="primary"
          aria-label="Agregar libro"
          size="medium"
          onClick={() => navigate('/books/new')}
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
          }}
        >
          <Add />
        </Fab>
      </Paper>
    </Box>
  );
}
