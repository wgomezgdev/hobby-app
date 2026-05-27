import { Autocomplete, Chip, TextField } from '@mui/material';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  label?: string;
}

export function TagInput({ value, onChange, suggestions = [], label = 'Tags' }: TagInputProps) {
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
          label={label}
          placeholder={value.length === 0 ? 'Add tags...' : ''}
          helperText="Press Enter or comma to add a tag"
        />
      )}
    />
  );
}
