import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Autocomplete, Box, Button, CircularProgress, FormControl,
  InputLabel, MenuItem, Select, Stack, TextField, Typography, FormHelperText,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthorSuggestions } from '../../hooks/useAuthorSuggestions';
import { useBook } from '../../hooks/useBooks';
import { addBook, updateBook } from '../../repositories/bookRepository';
import { CoverUpload } from '../../components/CoverUpload/CoverUpload';
import { CoverSearch } from '../../components/CoverSearch/CoverSearch';
import type { BookStatus } from '../../types/entities';

interface BookFormData {
  title: string;
  author: string;
  status: BookStatus;
  cover?: string;
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
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    defaultValues: { status: 'WANT_TO_READ' },
  });

  const [authorInput, setAuthorInput] = useState('');
  const { suggestions: authorSuggestions, loading: authorLoading } = useAuthorSuggestions(authorInput);

  useEffect(() => {
    if (isEditMode && book) {
      reset({ title: book.title, author: book.author, status: book.status, cover: book.cover });
    }
  }, [book, isEditMode, reset]);

  const onSubmit = async (data: BookFormData) => {
    if (isEditMode && bookId) {
      await updateBook(bookId, data);
      navigate(`/books/${bookId}`);
    } else {
      const newId = await addBook({ ...data, currentProgress: 0 });
      navigate(`/books/${newId}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Book' : 'Add Book'}
      </Typography>

      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              required
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

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
              onInputChange={(_, value) => {
                field.onChange(value);
                setAuthorInput(value);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Author"
                  required
                  error={!!errors.author}
                  helperText={errors.author?.message}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {authorLoading && <CircularProgress size={18} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          rules={{ required: 'Status is required' }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Status *</InputLabel>
              <Select {...field} label="Status *">
                <MenuItem value="WANT_TO_READ">Want to Read</MenuItem>
                <MenuItem value="READING">Reading</MenuItem>
                <MenuItem value="FINISHED">Finished</MenuItem>
              </Select>
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="cover"
          control={control}
          render={({ field }) => (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Cover (optional)
              </Typography>
              <Stack spacing={1}>
                <CoverUpload value={field.value} onChange={field.onChange} />
                <CoverSearch
                  title={getValues('title') ?? ''}
                  author={getValues('author') ?? ''}
                  onSelect={field.onChange}
                />
                {field.value && (
                  <Button
                    size="small"
                    color="inherit"
                    sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                    onClick={() => field.onChange(undefined)}
                  >
                    Remove cover
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Add Book'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
