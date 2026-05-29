import { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, ImageList, ImageListItem, Typography,
} from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';

interface Props {
  title: string;
  author: string;
  onSelect: (url: string) => void;
}

interface OLDoc {
  cover_i?: number;
  title?: string;
}

export function CoverSearch({ title, author, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OLDoc[]>([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const params = new URLSearchParams({ fields: 'cover_i,title', limit: '20' });
      if (title) params.set('title', title);
      if (author) params.set('author', author);
      const res = await fetch(`https://openlibrary.org/search.json?${params}`);
      const data = await res.json();
      setResults((data.docs as OLDoc[]).filter(d => d.cover_i));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    search();
  };

  const handleSelect = (coverId: number) => {
    onSelect(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
    setOpen(false);
  };

  return (
    <>
      <Button
        startIcon={<SearchOutlined />}
        variant="outlined"
        size="small"
        onClick={handleOpen}
        disabled={!title && !author}
      >
        Search cover online
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Choose a cover</DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && searched && results.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No covers found. Try adjusting the title or author.
            </Typography>
          )}
          {!loading && results.length > 0 && (
            <ImageList cols={3} gap={8}>
              {results.map(r => (
                <ImageListItem
                  key={r.cover_i}
                  onClick={() => handleSelect(r.cover_i!)}
                  sx={{ cursor: 'pointer', borderRadius: 1, overflow: 'hidden', '&:hover': { opacity: 0.75 } }}
                >
                  <img
                    src={`https://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg`}
                    alt={r.title ?? 'Book cover'}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
