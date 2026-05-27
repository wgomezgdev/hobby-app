import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout/Layout';
import { LibraryPage } from './pages/LibraryPage/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage/BookDetailPage';
import { AddEditBookPage } from './pages/AddEditBookPage/AddEditBookPage';
import { LogSessionPage } from './pages/LogSessionPage/LogSessionPage';
import { RankingPage } from './pages/RankingPage/RankingPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const theme = createTheme();

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Page not found</Typography>
      <Link to="/">Back to Library</Link>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/books/new" element={<AddEditBookPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/books/:id/edit" element={<AddEditBookPage />} />
            <Route path="/books/:id/sessions/new" element={<LogSessionPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
