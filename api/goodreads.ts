export const config = { runtime: 'edge' };

const VALID_SHELVES = new Set(['read', 'currently-reading', 'to-read']);

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId')?.replace(/\D/g, '');
  const shelf = searchParams.get('shelf');

  if (!userId || !shelf || !VALID_SHELVES.has(shelf)) {
    return new Response(
      'Bad request: provide userId (digits) and shelf (read|currently-reading|to-read)',
      { status: 400, headers: corsHeaders }
    );
  }

  const rssUrl = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}`;

  try {
    const upstream = await fetch(rssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return new Response(
        `Goodreads returned HTTP ${upstream.status}. Check your user ID and make sure your profile is public.`,
        { status: 502, headers: corsHeaders }
      );
    }

    const xml = await upstream.text();
    const sample = xml.trimStart().toLowerCase();

    // Detect login/CAPTCHA/error HTML pages
    if (sample.startsWith('<!doctype') || sample.startsWith('<html') || sample.includes('<html ')) {
      return new Response(
        'Goodreads returned an HTML page instead of RSS. Your profile may be private, or Goodreads is blocking server requests. Try again in a few minutes.',
        { status: 502, headers: corsHeaders }
      );
    }

    // Detect completely unexpected content (not XML at all)
    if (!xml.includes('<channel') && !xml.includes('<rss') && !xml.includes('<?xml')) {
      const preview = xml.slice(0, 120).replace(/\n/g, ' ');
      return new Response(
        `Goodreads returned unexpected content: "${preview}". The RSS feed may be temporarily unavailable.`,
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Proxy error: ${message}`, { status: 502, headers: corsHeaders });
  }
}
