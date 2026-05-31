import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#E07940' },           // warm terracotta-orange
    secondary: { main: '#F4A261' },          // soft peach
    background: { default: '#FFF8F2', paper: '#FFFFFF' },
    text: { primary: '#2D1600', secondary: '#7B5E3E' },
    success: { main: '#6A994E' },
    error: { main: '#C1440E' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(120,60,0,0.08)',
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiBottomNavigation: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF', borderTop: '1px solid #F0E0D0' } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});
