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
    return new Response('Bad request: provide userId (digits) and shelf (read|currently-reading|to-read)', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const rssUrl = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}`;

  try {
    const upstream = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReadingPal/1.0)' },
    });

    if (!upstream.ok) {
      return new Response(`Goodreads returned ${upstream.status}. Check the user ID and make sure the profile is public.`, {
        status: 502,
        headers: corsHeaders,
      });
    }

    const xml = await upstream.text();

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
