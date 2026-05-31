import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Box, Typography } from '@mui/material';
import { appTheme } from './theme/theme';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage/HomePage';
import { LibraryPage } from './pages/LibraryPage/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage/BookDetailPage';
import { AddEditBookPage } from './pages/AddEditBookPage/AddEditBookPage';
import { LogSessionPage } from './pages/LogSessionPage/LogSessionPage';
import { RankingPage } from './pages/RankingPage/RankingPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { StatsPage } from './pages/StatsPage/StatsPage';

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Page not found</Typography>
      <Link to="/library">Back to Library</Link>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/books/new" element={<AddEditBookPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/books/:id/edit" element={<AddEditBookPage />} />
            <Route path="/books/:id/sessions/new" element={<LogSessionPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
