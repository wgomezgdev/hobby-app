import { Autocomplete, Chip, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagInput({ value, onChange, suggestions = [] }: TagInputProps) {
  const { t } = useTranslation();

  return (
    <Autocomplete
      multiple
      freeSolo
      options={suggestions.filter((s) => !value.includes(s))}
      value={value}
      onChange={(_, newValue) => onChange(newValue as string[])}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => (
          <Chip
            label={tag}
            size="small"
            {...getTagProps({ index })}
            key={tag}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('tags.label')}
          placeholder={value.length === 0 ? t('tags.placeholder') : ''}
          helperText={t('tags.helper')}
        />
      )}
    />
  );
}
