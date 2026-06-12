import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GENRES, type Genre } from '../types/entities';
import { getCached, setCached } from '../lib/bookSearchCache';

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

interface GoogleBooksVolume {
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    imageLinks?: { thumbnail?: string };
    categories?: string[];
  };
}

async function fetchOpenLibrary(query: string, signal: AbortSignal): Promise<TitleSuggestion[]> {
  const fields = 'title,author_name,first_publish_year,number_of_pages_median,cover_i,subject';
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=${fields}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return ((data.docs ?? []) as OpenLibraryDoc[])
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
    }));
}

async function fetchGoogleBooks(query: string, signal: AbortSignal): Promise<TitleSuggestion[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&fields=items(volumeInfo(title,authors,publishedDate,pageCount,imageLinks,categories))`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return ((data.items ?? []) as GoogleBooksVolume[])
    .filter(item => item.volumeInfo?.title)
    .map(item => {
      const v = item.volumeInfo;
      const year = v.publishedDate ? parseInt(v.publishedDate.slice(0, 4), 10) : undefined;
      const thumb = v.imageLinks?.thumbnail?.replace('http://', 'https://');
      return {
        title: v.title,
        author: v.authors?.[0] ?? '',
        year: isNaN(year ?? NaN) ? undefined : year,
        totalPages: v.pageCount,
        cover: thumb,
        genres: mapGenres(v.categories ?? []),
      };
    });
}

function friendlyFetchError(err: unknown, t: (key: string) => string): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.toLowerCase().includes('rate')) return t('titleSearch.rateLimited');
  if (msg.match(/HTTP [45]\d\d/)) return t('titleSearch.unavailable');
  return t('titleSearch.networkError');
}

export function useTitleSuggestions(query: string) {
  const { t } = useTranslation();
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
        const cached = await getCached(query);
        if (cached) {
          setSuggestions(cached);
          setLoading(false);
          return;
        }

        let results = await fetchOpenLibrary(query, controller.signal);

        if (results.length === 0) {
          results = await fetchGoogleBooks(query, controller.signal);
        }

        setCached(query, results);
        setSuggestions(results);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearchError(friendlyFetchError(err, t));
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
