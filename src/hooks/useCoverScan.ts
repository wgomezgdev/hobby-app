import { useState } from 'react';

export interface ScanResult {
  title: string;
  author: string;
}

export function useCoverScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async (dataUrl: string): Promise<ScanResult | null> => {
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!key) {
      setError('AI scan not configured. Add VITE_GEMINI_API_KEY to enable.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].slice(5);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType, data: base64 } },
                {
                  text: 'Look at this book cover image. Extract the book title and the author name.\nReply in this exact format:\nTitle: <title>\nAuthor: <author>\nIf you cannot find a value, write "Unknown" for that field.',
                },
              ],
            }],
          }),
        }
      );

      if (res.status === 429) {
        setError('Daily scan limit reached. Try again tomorrow.');
        return null;
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        setError('Invalid API key. Check your VITE_GEMINI_API_KEY.');
        return null;
      }
      if (!res.ok) {
        setError('Could not reach AI service. Check your connection.');
        return null;
      }

      const json = await res.json();
      const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const titleLine = text.match(/^Title:\s*(.+)$/m)?.[1]?.trim() ?? 'Unknown';
      const authorLine = text.match(/^Author:\s*(.+)$/m)?.[1]?.trim() ?? 'Unknown';

      const title = titleLine === 'Unknown' ? '' : titleLine;
      const author = authorLine === 'Unknown' ? '' : authorLine;

      if (!title && !author) {
        setError('Cover not recognized. Try a clearer photo or fill in the fields manually.');
        return null;
      }

      return { title, author };
    } catch {
      setError('Could not reach AI service. Check your connection.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scan, loading, error, clearError: () => setError(null) };
}
