import { useEffect, useRef, useState } from 'react';
import { GENRES, type Genre } from '../types/entities';

const DEBOUNCE_MS = 350;
const MIN_LENGTH = 2;

export interface TitleSuggestion {
  title: string;
  author: string;
  year?: number;
  totalPages?: number;
  cover?: string;
  genres: Genre[];
}

function mapGenres(subjects: string[]): Genre[] {
  const result: Genre[] = [];
  for (const subject of subjects) {
    const lower = subject.toLowerCase();
    for (const genre of GENRES) {
      if (!result.includes(genre) &&
          (lower.includes(genre.toLowerCase()) || genre.toLowerCase().split(' ').some(w => lower.includes(w)))) {
        result.push(genre);
      }
    }
  }
  return result;
}

interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
}

export function useTitleSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.length < MIN_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setSearchError(null);
      return;
    }

    setLoading(true);
    setSearchError(null);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const fields = 'title,author_name,first_publish_year,number_of_pages_median,cover_i,subject';
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=${fields}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setSuggestions(
          ((data.docs ?? []) as OpenLibraryDoc[])
            .filter(doc => doc.title)
            .map(doc => ({
              title: doc.title,
              author: doc.author_name?.[0] ?? '',
              year: doc.first_publish_year,
              totalPages: doc.number_of_pages_median,
              cover: doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                : undefined,
              genres: mapGenres(doc.subject ?? []),
            }))
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearchError((err as Error).message ?? 'Search failed');
        }
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return { suggestions, loading, searchError };
}
