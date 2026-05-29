import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 350;
const MIN_LENGTH = 2;

export interface TitleSuggestion {
  title: string;
  author: string;
}

export function useTitleSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.length < MIN_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&fields=title,author_name&limit=8`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSuggestions(
          (data.docs as { title: string; author_name?: string[] }[]).map(d => ({
            title: d.title,
            author: d.author_name?.[0] ?? '',
          }))
        );
      } catch {
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

  return { suggestions, loading };
}
