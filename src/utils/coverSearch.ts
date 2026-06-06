interface BookResult {
  id: string;
  title: string;
  thumbnail: string;
  fullUrl: string;
}

// --- Google Books ---

function parseGoogleBooks(data: { items?: unknown[] }): BookResult[] {
  if (!Array.isArray(data.items)) return [];
  return data.items
    .filter((item): item is {
      id: string;
      volumeInfo: { title?: string; imageLinks?: { thumbnail?: string; smallThumbnail?: string } };
    } => {
      const v = (item as { volumeInfo?: { imageLinks?: Record<string, string> } }).volumeInfo;
      return !!(v?.imageLinks?.thumbnail ?? v?.imageLinks?.smallThumbnail);
    })
    .map(item => {
      const raw = (item.volumeInfo.imageLinks!.thumbnail ?? item.volumeInfo.imageLinks!.smallThumbnail)!
        .replace('http://', 'https://');
      return {
        id: item.id,
        title: item.volumeInfo.title ?? '',
        thumbnail: raw,
        fullUrl: raw.replace('zoom=1', 'zoom=0').replace('zoom=5', 'zoom=0').replace('&edge=curl', ''),
      };
    });
}

export async function fetchGoogleBooks(query: string): Promise<BookResult[]> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string | undefined;
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : '';
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20${keyParam}`
  );
  if (!res.ok) throw new Error(`gbooks:${res.status}`);
  return parseGoogleBooks(await res.json());
}

// --- Open Library fallback ---

interface OLDoc { cover_i?: number; title?: string }

function parseOpenLibrary(data: { docs?: OLDoc[] }): BookResult[] {
  return (data.docs ?? [])
    .filter(d => d.cover_i)
    .map(d => {
      const base = `https://covers.openlibrary.org/b/id/${d.cover_i}`;
      return {
        id: String(d.cover_i),
        title: d.title ?? '',
        thumbnail: `${base}-M.jpg`,
        fullUrl: `${base}-L.jpg`,
      };
    });
}

export async function fetchOpenLibrary(query: string): Promise<BookResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=cover_i,title&limit=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ol:${res.status}`);
  return parseOpenLibrary(await res.json());
}

// Returns the first cover URL found from Google Books, then Open Library, or null.
export async function fetchBookCover(title: string, author: string): Promise<string | null> {
  const query = `${title} ${author}`.trim();
  if (!query) return null;

  try {
    const books = await fetchGoogleBooks(query);
    if (books.length > 0) return books[0].fullUrl;
  } catch {
    // quota or network — fall through
  }

  try {
    const books = await fetchOpenLibrary(query);
    if (books.length > 0) return books[0].fullUrl;
  } catch {
    // both sources failed — no cover
  }

  return null;
}
