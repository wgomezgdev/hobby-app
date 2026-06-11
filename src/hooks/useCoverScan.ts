import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ScanResult {
  title: string;
  author: string;
}

export function useCoverScan() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async (dataUrl: string): Promise<ScanResult | null> => {
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!key) {
      setError(t('scan.notConfigured'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].slice(5);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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
        setError(t('scan.limitReached'));
        return null;
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        setError(t('scan.invalidKey'));
        return null;
      }
      if (!res.ok) {
        setError(t('scan.serviceError', { status: res.status }));
        return null;
      }

      const json = await res.json();
      const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const titleLine = text.match(/^Title:\s*(.+)$/m)?.[1]?.trim() ?? 'Unknown';
      const authorLine = text.match(/^Author:\s*(.+)$/m)?.[1]?.trim() ?? 'Unknown';

      const title = titleLine === 'Unknown' ? '' : titleLine;
      const author = authorLine === 'Unknown' ? '' : authorLine;

      if (!title && !author) {
        setError(t('scan.notRecognized'));
        return null;
      }

      return { title, author };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(t('scan.networkError', { error: msg }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scan, loading, error, clearError: () => setError(null) };
}
