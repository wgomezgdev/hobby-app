import { Avatar, BottomNavigation, BottomNavigationAction, Box, Fab, Paper, Typography } from '@mui/material';
import { Add, BarChart, Home, MenuBook } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

function getActiveTab(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/library') || pathname.startsWith('/books') || pathname === '/ranking') return '/library';
  if (pathname === '/stats') return '/stats';
  if (pathname === '/profile' || pathname === '/settings') return '/profile';
  return '/';
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTab(location.pathname);
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      pt: 'env(safe-area-inset-top)',
      pb: 'calc(72px + env(safe-area-inset-bottom))',
    }}>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', textAlign: 'center', pt: 0.5, fontSize: '0.6rem', lineHeight: 1 }}
        >
          v{__APP_VERSION__}
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <BottomNavigation
            value={activeTab}
            onChange={(_, val) => navigate(val)}
            sx={{ height: 60 }}
          >
            <BottomNavigationAction label={t('nav.home')} value="/" icon={<Home />} />
            <BottomNavigationAction label={t('nav.library')} value="/library" icon={<MenuBook />} />
            <BottomNavigationAction sx={{ visibility: 'hidden', pointerEvents: 'none' }} value="" />
            <BottomNavigationAction label={t('nav.stats')} value="/stats" icon={<BarChart />} />
            <BottomNavigationAction
              label={t('nav.profile')}
              value="/profile"
              icon={
                user?.photoURL
                  ? <Avatar src={user.photoURL} sx={{ width: 24, height: 24 }} />
                  : <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>
                      {user?.displayName?.[0] ?? 'P'}
                    </Avatar>
              }
            />
          </BottomNavigation>

          <Fab
            color="primary"
            aria-label={t('nav.addBook')}
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
