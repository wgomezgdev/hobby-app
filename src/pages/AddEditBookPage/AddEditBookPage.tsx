import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  IconButton, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowBack, CheckCircle, DocumentScanner } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthorSuggestions } from '../../hooks/useAuthorSuggestions';
import { useTitleSuggestions } from '../../hooks/useTitleSuggestions';
import { useBook } from '../../hooks/useBooks';
import { addBook, updateBook } from '../../repositories/bookRepository';
import { CoverUpload } from '../../components/CoverUpload/CoverUpload';
import { CoverSearch } from '../../components/CoverSearch/CoverSearch';
import { useCoverScan, type ScanResult } from '../../hooks/useCoverScan';
import type { BookStatus } from '../../types/entities';
import { GENRES } from '../../types/entities';

const STATUS_OPTIONS: { value: BookStatus; label: string; emoji: string }[] = [
  { value: 'READING', label: 'Reading', emoji: '📖' },
  { value: 'FINISHED', label: 'Finished', emoji: '✅' },
  { value: 'WANT_TO_READ', label: 'Want to Read', emoji: '⏳' },
];

interface BookFormData {
  title: string;
  author: string;
  year: string;
  status: BookStatus;
  totalPages: string;
  currentPage: string;
  cover?: string;
  genres: string[];
}

export function AddEditBookPage() {
  const { id } = useParams<{ id?: string }>();
  const bookId = id ? parseInt(id, 10) : undefined;
  const isEditMode = bookId !== undefined;
  const book = useBook(bookId ?? 0);
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    defaultValues: { status: 'READING', genres: [], year: '', totalPages: '', currentPage: '' },
  });

  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [pendingScan, setPendingScan] = useState<ScanResult | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const { scan, loading: scanLoading, error: scanError, clearError: clearScanError } = useCoverScan();
  const { suggestions: titleSuggestions, loading: titleLoading } = useTitleSuggestions(titleInput);
  const { suggestions: authorSuggestions, loading: authorLoading } = useAuthorSuggestions(authorInput);

  useEffect(() => {
    if (isEditMode && book) {
      reset({
        title: book.title,
        author: book.author,
        year: book.year?.toString() ?? '',
        status: book.status,
        totalPages: book.totalPages?.toString() ?? '',
        currentPage: book.currentPage?.toString() ?? '',
        cover: book.cover,
        genres: book.genres ?? [],
      });
      setTitleInput(book.title);
      setAuthorInput(book.author);
    }
  }, [book, isEditMode, reset]);

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (scanInputRef.current) scanInputRef.current.value = '';
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const result = await scan(dataUrl);
    if (!result) return;

    let hasConflict = false;
    if (result.title) {
      if (!getValues('title')) { setValue('title', result.title); setTitleInput(result.title); }
      else hasConflict = true;
    }
    if (result.author) {
      if (!getValues('author')) { setValue('author', result.author); setAuthorInput(result.author); }
      else hasConflict = true;
    }
    if (hasConflict) setPendingScan(result);
  };

  const applyPendingScan = () => {
    if (!pendingScan) return;
    if (pendingScan.title) { setValue('title', pendingScan.title); setTitleInput(pendingScan.title); }
    if (pendingScan.author) { setValue('author', pendingScan.author); setAuthorInput(pendingScan.author); }
    setPendingScan(null);
  };

  const onSubmit = async (data: BookFormData) => {
    const totalPages = data.totalPages ? parseInt(data.totalPages, 10) : undefined;
    const currentPage = data.currentPage ? parseInt(data.currentPage, 10) : undefined;
    const year = data.year ? parseInt(data.year, 10) : undefined;

    const payload = {
      title: data.title,
      author: data.author,
      status: data.status,
      cover: data.cover,
      genres: data.genres,
      year,
      totalPages,
      currentPage,
      currentProgress: 0,
    };

    if (isEditMode && bookId) {
      await updateBook(bookId, payload);
      navigate(`/books/${bookId}`);
    } else {
      const newId = await addBook(payload);
      navigate(`/books/${newId}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          {isEditMode ? 'Edit Book' : 'Add Book'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {/* Cover */}
        <Controller
          name="cover"
          control={control}
          render={({ field }) => (
            <Box sx={{ mb: scanError ? 1 : 3 }}>
              <CoverUpload
                value={field.value}
                onChange={field.onChange}
                extra={
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={scanLoading ? <CircularProgress size={14} /> : <DocumentScanner />}
                      onClick={() => scanInputRef.current?.click()}
                      disabled={scanLoading}
                    >
                      {scanLoading ? 'Scanning…' : 'Scan cover'}
                    </Button>
                    <CoverSearch
                      title={getValues('title') ?? ''}
                      author={getValues('author') ?? ''}
                      onSelect={field.onChange}
                    />
                    <input
                      ref={scanInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={handleScanFile}
                    />
                  </Stack>
                }
              />
            </Box>
          )}
        />

        {scanError && (
          <Alert severity="error" onClose={clearScanError} sx={{ mb: 3 }}>
            {scanError}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* Title */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', letterSpacing: 1 }}>
              BOOK TITLE
            </Typography>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={titleSuggestions}
                  getOptionLabel={o => (typeof o === 'string' ? o : o.title)}
                  filterOptions={x => x}
                  loading={titleLoading}
                  inputValue={field.value ?? ''}
                  onInputChange={(_, value) => { field.onChange(value); setTitleInput(value); }}
                  onChange={(_, value) => {
                    if (value && typeof value !== 'string') {
                      field.onChange(value.title);
                      setTitleInput(value.title);
                      if (!getValues('author')) { setValue('author', value.author); setAuthorInput(value.author); }
                    }
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={`${option.title}-${option.author}`}>
                      <Box>
                        <Typography variant="body2">{option.title}</Typography>
                        {option.author && <Typography variant="caption" color="text.secondary">{option.author}</Typography>}
                      </Box>
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      InputProps={{ ...params.InputProps, endAdornment: <>{titleLoading && <CircularProgress size={16} />}{params.InputProps.endAdornment}</> }}
                    />
                  )}
                />
              )}
            />
          </Box>

          {/* Author + Year */}
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ flex: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', letterSpacing: 1 }}>
                AUTHOR
              </Typography>
              <Controller
                name="author"
                control={control}
                rules={{ required: 'Author is required' }}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={authorSuggestions}
                    filterOptions={x => x}
                    loading={authorLoading}
                    inputValue={field.value ?? ''}
                    onInputChange={(_, value) => { field.onChange(value); setAuthorInput(value); }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={!!errors.author}
                        helperText={errors.author?.message}
                        InputProps={{ ...params.InputProps, endAdornment: <>{authorLoading && <CircularProgress size={16} />}{params.InputProps.endAdornment}</> }}
                      />
                    )}
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', letterSpacing: 1 }}>
                YEAR
              </Typography>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" type="number" inputProps={{ min: 1000, max: new Date().getFullYear() }} />
                )}
              />
            </Box>
          </Stack>

          {/* Status chips */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              STATUS
            </Typography>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {STATUS_OPTIONS.map(opt => (
                    <Chip
                      key={opt.value}
                      label={`${opt.emoji} ${opt.label}`}
                      onClick={() => field.onChange(opt.value)}
                      color={field.value === opt.value ? 'primary' : 'default'}
                      variant={field.value === opt.value ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Stack>
              )}
            />
          </Box>

          {/* Total pages + Current page */}
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', letterSpacing: 1 }}>
                TOTAL PAGES
              </Typography>
              <Controller
                name="totalPages"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" type="number" inputProps={{ min: 1 }} />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', letterSpacing: 1 }}>
                CURRENT PAGE
              </Typography>
              <Controller
                name="currentPage"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" type="number" inputProps={{ min: 0 }} />
                )}
              />
            </Box>
          </Stack>

          {/* Genre chips */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              GENRE
            </Typography>
            <Controller
              name="genres"
              control={control}
              render={({ field }) => (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {GENRES.map(genre => {
                    const selected = (field.value ?? []).includes(genre);
                    return (
                      <Chip
                        key={genre}
                        label={genre}
                        onClick={() => {
                          const current = field.value ?? [];
                          field.onChange(selected ? current.filter(g => g !== genre) : [...current, genre]);
                        }}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        clickable
                        size="small"
                      />
                    );
                  })}
                </Stack>
              )}
            />
          </Box>

          {/* Save button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={<CheckCircle />}
            sx={{ mt: 1, py: 1.5, fontWeight: 700 }}
          >
            {isEditMode ? 'Save Changes' : 'Save Book'}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={!!pendingScan}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          pendingScan
            ? `Scan found "${[pendingScan.title, pendingScan.author].filter(Boolean).join(' · ')}". Replace existing values?`
            : ''
        }
        action={
          <>
            <Button color="inherit" size="small" onClick={applyPendingScan}>Apply</Button>
            <Button color="inherit" size="small" onClick={() => setPendingScan(null)}>Keep</Button>
          </>
        }
      />
    </Box>
  );
}
