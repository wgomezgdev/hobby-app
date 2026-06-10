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

function mapGenres(categories: string[]): Genre[] {
  const result: Genre[] = [];
  for (const cat of categories) {
    const lower = cat.toLowerCase();
    for (const genre of GENRES) {
      if (!result.includes(genre) &&
          (lower.includes(genre.toLowerCase()) || genre.toLowerCase().split(' ').some(w => lower.includes(w)))) {
        result.push(genre);
      }
    }
  }
  return result;
}

function cleanCover(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url
    .replace('http://', 'https://')
    .replace('zoom=1', 'zoom=5')
    .replace('&edge=curl', '');
}

interface GoogleBooksItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { smallThumbnail?: string; thumbnail?: string };
  };
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
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&printType=books`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setSuggestions(
          ((data.items ?? []) as GoogleBooksItem[])
            .filter(item => item.volumeInfo?.title)
            .map(item => {
              const v = item.volumeInfo;
              const yearNum = parseInt((v.publishedDate ?? '').slice(0, 4), 10);
              return {
                title: v.title,
                author: v.authors?.[0] ?? '',
                year: isNaN(yearNum) ? undefined : yearNum,
                totalPages: v.pageCount,
                cover: cleanCover(v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail),
                genres: mapGenres(v.categories ?? []),
              };
            })
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
