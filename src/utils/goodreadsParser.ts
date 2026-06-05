import type { BookStatus } from '../types/entities';

export interface GoodreadsBookRaw {
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  totalPages: number | undefined;
  year: number | undefined;
  cover: string | undefined;
  userRating: number | undefined;
  shelves: string[];
}

const STATUS_MAP: Record<string, BookStatus> = {
  'read': 'FINISHED',
  'currently-reading': 'READING',
  'to-read': 'WANT_TO_READ',
};

export function extractUserId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/user\/show\/(\d+)/);
  return match?.[1] ?? null;
}

export function parseRSSShelf(xml: string, shelf: string): GoodreadsBookRaw[] {
  const status: BookStatus = STATUS_MAP[shelf] ?? 'WANT_TO_READ';

  // Use regex to extract <item> blocks — avoids strict XML parser failures
  // caused by encoding issues or imperfect well-formedness in Goodreads RSS.
  const blocks: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    blocks.push(m[1]);
  }

  return blocks.map(b => parseItemBlock(b, status)).filter(b => b.title.length > 0);
}

// Extract the text content of an XML element, handling CDATA and plain text.
function getField(block: string, tag: string): string {
  const cdata = block.match(
    new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i')
  );
  if (cdata) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
  if (plain) return plain[1].trim();
  return '';
}

function parseItemBlock(block: string, status: BookStatus): GoodreadsBookRaw {
  const descHtml = getField(block, 'description');
  const fields = parseDescriptionHtml(descHtml);

  let title = fields['name'] ?? '';
  let author = fields['author'] ?? '';

  if (!title) {
    const raw = getField(block, 'title');
    const byIdx = raw.lastIndexOf(' by ');
    if (byIdx !== -1) {
      title = raw.slice(0, byIdx).trim();
      if (!author) author = raw.slice(byIdx + 4).trim();
    } else {
      title = raw;
    }
  }

  const isbn = fields['isbn13'] || fields['isbn'] || '';

  const pagesRaw = parseInt(fields['num_pages'] ?? fields['number of pages'] ?? '', 10);
  const totalPages = !isNaN(pagesRaw) && pagesRaw > 0 ? pagesRaw : undefined;

  const yearRaw = parseInt(fields['book published'] ?? '', 10);
  const year =
    !isNaN(yearRaw) && yearRaw > 1000 && yearRaw <= new Date().getFullYear() + 1
      ? yearRaw
      : undefined;

  const ratingRaw = parseInt(fields['rating'] ?? '0', 10);
  const userRating =
    !isNaN(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;

  const cover = fields['__cover__'] || undefined;

  const shelvesRaw = fields['shelves'] ?? '';
  const shelves = shelvesRaw
    ? shelvesRaw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return { title, author, isbn, status, totalPages, year, cover, userRating, shelves };
}

function parseDescriptionHtml(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!html) return fields;

  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const img = tmp.querySelector('img');
  if (img) {
    const src = img.getAttribute('src');
    if (src) fields['__cover__'] = src;
  }

  // Description lines look like: "key: value<br>" (one per field)
  const lines = tmp.innerHTML.split(/<br\s*\/?>/i);
  for (const line of lines) {
    const text = line.replace(/<[^>]+>/g, '').trim();
    const colonIdx = text.indexOf(':');
    if (colonIdx <= 0) continue;
    const key = text.slice(0, colonIdx).trim().toLowerCase();
    const value = text.slice(colonIdx + 1).trim();
    if (key && value && key.length < 40) {
      fields[key] = value;
    }
  }

  return fields;
}
