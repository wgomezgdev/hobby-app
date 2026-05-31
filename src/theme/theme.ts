import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00BCD4' },
    background: { default: '#0D1117', paper: '#161B22' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiBottomNavigation: { styleOverrides: { root: { backgroundColor: '#161B22' } } },
  },
});
